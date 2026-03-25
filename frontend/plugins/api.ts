export default defineNuxtPlugin(() => {
	const config = useRuntimeConfig();

	const api = $fetch.create({
		baseURL: config.public.apiBaseUrl,
		onRequest({ options }) {
			const authStore = useAuthStore();

			if (authStore.id) {
				const headers = new Headers(options.headers);

				headers.set("user", authStore.id);
				options.headers = headers;
			}
		},
		onResponseError({ response }) {
			const errorMessage = response._data.error || `HTTP ${response.status}`;

			if (response.status === 401) {
				const authStore = useAuthStore();

				authStore.logout();
				navigateTo("/login");
			}

			throw errorMessage;
		},
	});

	return {
		provide: {
			api,
		},
	};
});
