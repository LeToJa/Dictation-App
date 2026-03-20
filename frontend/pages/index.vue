<template>
  <!-- Redirecting... -->
</template>

<script setup lang="ts">
onMounted(() => {
    if (process.client) {
        const user = localStorage.getItem('auth_user')
        const token = localStorage.getItem('auth_token')
        const isAuthenticated = !!(user && token)

        if (isAuthenticated) {
            navigateTo('/dashboard')
        } else {
            navigateTo('/login')
        }
    }
})
</script>
