import Block from '@ipld/block'
import Base58 from 'bs58'
import { decodeBlock } from './crypto/node'

// @todo: export this from js-threads-client?
export interface LogRecord {
  id: string
  log_id?: string
  thread_id: string
  record_node?: string
  event_node?: string
  header_node?: string
  body_node?: string
}

export interface HeaderNode {
  key: Buffer
  time: number
}

export interface EventNode {
  header: any
  body: any
}

export interface RecordNode {
  sig: Buffer
  prev: any
  block: any
}

// @todo: create an 'encoder' static method to enable encoding in the client
export class Record {
  constructor(
    private logRecord: LogRecord,
    private followKey?: string,
    private readKey?: string,
    private opts: { codec: string; algo: string } = { codec: 'dag-cbor', algo: 'sha2-256' },
  ) {}
  static decoder(record: LogRecord, followKey?: string, readKey?: string) {
    return new Record(record, followKey, readKey)
  }
  async header() {
    if (this.readKey) {
      if (this.logRecord.header_node) {
        const headerNode = this.logRecord.header_node
        const headerRaw = Buffer.from(headerNode, 'base64')
        const headerCipher: Buffer = Block.decoder(headerRaw, this.opts.codec, this.opts.algo).decode()
        const headerBLock = await decodeBlock(headerCipher, this.readKey)
        const header = Block.decoder(headerBLock, this.opts.codec, this.opts.algo).decode()
        return header as HeaderNode
      }
      return undefined
    }
    throw new Error('missing read key')
  }
  async body() {
    const head = await this.header()
    if (this.logRecord.body_node && head) {
      const key = Base58.encode(head.key)
      const bodyNode = this.logRecord.body_node
      const bodyRaw = Buffer.from(bodyNode, 'base64')
      const bodyCipher = Block.decoder(bodyRaw, this.opts.codec, this.opts.algo).decode()
      const bodyBlock = await decodeBlock(bodyCipher, key)
      const body = Block.decoder(bodyBlock, this.opts.codec, this.opts.algo).decode()
      return body
    }
    return undefined
  }
  async event() {
    if (this.logRecord.event_node) {
      const eventNode = this.logRecord.event_node
      const eventRaw = Buffer.from(eventNode, 'base64')
      // Event 'body' is not encrypted
      const event = Block.decoder(eventRaw, this.opts.codec, this.opts.algo).decode()
      return event as EventNode
    }
    return undefined
  }
  async record() {
    if (this.followKey) {
      if (this.logRecord.record_node) {
        const recordNode = this.logRecord.record_node
        const recordRaw = Buffer.from(recordNode, 'base64')
        const recordCipher = Block.decoder(recordRaw, this.opts.codec, this.opts.algo).decode()
        const recordBlock = await decodeBlock(recordCipher, this.followKey)
        const record = Block.decoder(recordBlock, this.opts.codec, this.opts.algo).decode()
        return record as RecordNode
      }
      return undefined
    }
    throw new Error('missing follow key')
  }
}
