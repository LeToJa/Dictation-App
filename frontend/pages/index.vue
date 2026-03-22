<template>
  <!-- Redirecting... -->
</template>

<script setup lang="ts">
onMounted(() => {
    if (process.client) {
        const user = localStorage.getItem('auth_user')
        const isAuthenticated = !!(user)

        if (isAuthenticated) {
            navigateTo('/dashboard')
        } else {
            navigateTo('/login')
        }
    }
})
</script>
