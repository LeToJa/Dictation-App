export default defineNuxtRouteMiddleware((to, from) => {
    let isAuthenticated = false

    if (process.client) {
        const user = localStorage.getItem('auth_user')
        const token = localStorage.getItem('auth_token')

        isAuthenticated = !!(user && token)
    }

    if (isAuthenticated) {
        return navigateTo('/dashboard')
    }
})
