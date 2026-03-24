<template>
	<NuxtPage />
</template>

<script setup lang="ts">
useHead({
	title: "Dictation - Dictado App",
	titleTemplate: "%s | Dictation",
});

const authStore = useAuthStore();
authStore.init();
</script>
