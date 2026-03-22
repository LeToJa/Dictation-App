export default defineNuxtRouteMiddleware((to, from) => {
    let isAuthenticated = false

    if (process.client) {
        const user = localStorage.getItem('auth_user')

        isAuthenticated = !!(user)
    }

    if (isAuthenticated) {
        return navigateTo('/dashboard')
    }
})
