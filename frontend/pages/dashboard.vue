<template>
    <NuxtLayout>
        Dashboard
    </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({
    middleware: ['auth']
})

useHead({
    title: 'Panel de Control'
})
</script>