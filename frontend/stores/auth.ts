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
			const user = localStorage.getItem("auth_user");

			if (user) {
				const parsedUser = JSON.parse(user);

				this.username = parsedUser.username;
				this.id = parsedUser.id;
			}
		},
		async register(
			username: string,
			password: string,
			confirmPassword: string,
		) {
			this.loading = true;

			try {
				const { $api } = useNuxtApp();
				const response = await $api("/register", {
					method: "POST",
					body: { username, password, confirmPassword },
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

				localStorage.setItem("auth_user", JSON.stringify(response));

				return response;
			} catch (error) {
				console.error("Login error:", error);

				throw error;
			} finally {
				this.loading = false;
			}
		},
		token() {
			try {
				const { $api } = useNuxtApp();

				return $api<{ token: string; lang: string }>("/token");
			} catch (error) {
				console.error("Token error:", error);

				throw error;
			}
		},
		logout() {
			this.username = null;
			this.id = null;
			localStorage.removeItem("auth_user");
		},
	},
});
