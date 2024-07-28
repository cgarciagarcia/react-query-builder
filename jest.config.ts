import { JestConfigWithTsJest } from 'ts-jest'


const config: JestConfigWithTsJest = {
  verbose: true,
  collectCoverage: true,
  coverageDirectory: 'tests/coverage',
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js'],
  rootDir: './',
  moduleNameMapper: {
    '^@/actions/(.*)$': '<rootDir>/src/actions/$1',
    '^@/utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@/types/(.*)$': '<rootDir>/src/types/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
}
export default config