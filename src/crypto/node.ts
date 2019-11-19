import crypto from 'crypto'
import Base58 from 'bs58'

export async function decodeBlock(block: Buffer, key: string) {
  // Extract the tag from the payload
  const tag = block.slice(block.length - 16)
  const data = block.slice(0, block.length - 16)
  const keyiv = Base58.decode(key)
  const sk = keyiv.slice(0, 32)
  const iv = keyiv.slice(32)
  console.log('node')

  const decipher = crypto.createDecipheriv('aes-256-gcm', sk, iv)
  decipher.setAuthTag(tag)
  const decrypted = decipher.update(data)
  return decrypted
}
