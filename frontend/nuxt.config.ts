export default defineNuxtConfig({
	devtools: { enabled: true },
	ssr: false,

	modules: ["@nuxtjs/tailwindcss", "@pinia/nuxt", "@nuxtjs/color-mode"],

	tailwindcss: {
		cssPath: "~/assets/css/tailwind.css",
		configPath: "tailwind.config.js",
		exposeConfig: false,
		viewer: true,
	},

	colorMode: {
		classSuffix: "",
	},

	runtimeConfig: {
		public: {
			apiBaseUrl: "http://localhost:4000",
		},
	},
});
