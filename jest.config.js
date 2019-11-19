module.exports = {
  transform: {
    '^.+\\.ts?$': 'ts-jest'
  },
  collectCoverage: true,
  testRegex: '/tests/.*\\.(test|spec)?\\.(ts|tsx|js)$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node']
}
