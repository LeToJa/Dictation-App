export default defineNuxtRouteMiddleware((to) => {
	if (process.server) return;

	const user = process.client ? localStorage.getItem("auth_user") : null;
	const isAuthenticated = !!user;
	const guestRoutes = ["/login", "/register"];
	const isGuestRoute = guestRoutes.includes(to.path);

	if (
		(!isAuthenticated && !isGuestRoute) ||
		(!isAuthenticated && to.path === "/")
	) {
		return navigateTo("/login");
	}

	if (
		(isAuthenticated && isGuestRoute) ||
		(isAuthenticated && to.path === "/")
	) {
		return navigateTo("/dashboard");
	}
});
