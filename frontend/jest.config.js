/** @type {import('jest').Config} */
module.exports = {
	preset: "ts-jest",
	testEnvironment: "jsdom",
	moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "vue"],
	transform: {
		"^.+\\.tsx?$": "ts-jest",
		"^.+\\.vue$": "@vue/vue3-jest",
	},
	moduleNameMapper: {
		"^@/(.*)$": "<rootDir>/$1",
		"^~~/(.*)$": "<rootDir>/$1",
		"^~/(.*)$": "<rootDir>/$1",
		"^\.(css|less|scss|sass)$": "identity-obj-proxy",
		"^@/(.*)$": "<rootDir>/$1",
	},
	transformIgnorePatterns: ["/node_modules/"],
	testPathIgnorePatterns: ["/node_modules/", "/.nuxt/"],
	setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
	collectCoverage: false,
};
