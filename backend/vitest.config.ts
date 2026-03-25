import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
	test: {
		environment: "node",
		globals: true,
		setupFiles: ["./tests/setup.ts"],
		testTimeout: 10000,
		reporters: ["verbose"],
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
});
