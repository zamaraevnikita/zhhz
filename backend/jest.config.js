/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    testMatch: ['**/*.test.ts'],
    testTimeout: 15000,
    // uuid v13+ ships as ESM — must be transformed by ts-jest
    transformIgnorePatterns: [
        'node_modules/(?!uuid/)'
    ],
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
        // Transform uuid's .js ESM files via ts-jest
        'node_modules/uuid/.+\\.js$': 'ts-jest',
    },
};
