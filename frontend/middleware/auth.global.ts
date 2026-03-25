export default defineNuxtRouteMiddleware((to) => {
	const userCookie = useCookie("auth_user");
	const isAuthenticated = !!userCookie.value;
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
