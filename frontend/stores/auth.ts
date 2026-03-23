export const useAuthStore = defineStore("auth", {
	state: () => ({
		username: null as string | null,
		id: null as string | null,
		loading: false,
	}),
	getters: {
		isAuthenticated: (state) => !!state.username,
	},
	actions: {
		init() {
			if (process.client) {
				const user = localStorage.getItem("auth_user");

				if (user) {
					const parsedUser = JSON.parse(user);

					this.username = parsedUser.username;
					this.id = parsedUser.id;
				}
			}
		},

		async register(username: string, password: string) {
			this.loading = true;

			try {
				const { $api } = useNuxtApp();
				const response = await $api("/register", {
					method: "POST",
					body: { username, password },
				});

				return response;
			} catch (error) {
				console.error("Register error:", error);
				throw error;
			} finally {
				this.loading = false;
			}
		},
		async login(username: string, password: string) {
			this.loading = true;

			try {
				const { $api } = useNuxtApp();

				const response = await $api<{ username: string; id: string }>(
					"/login",
					{
						method: "POST",
						body: { username, password },
					},
				);

				this.username = response.username;
				this.id = response.id;

				if (process.client) {
					localStorage.setItem("auth_user", JSON.stringify(response));
				}

				return response;
			} catch (error) {
				console.error("Login API error:", error);
				throw error;
			} finally {
				this.loading = false;
			}
		},
		logout() {
			this.username = null;
			this.id = null;

			if (process.client) {
				localStorage.removeItem("auth_user");
			}
		},
	},
});
