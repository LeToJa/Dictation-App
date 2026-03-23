<template>
	<div>
		<NuxtPage />
	</div>
</template>

<script setup lang="ts">
const route = useRoute();

useHead({
	title: "Dictation - Dictado App",
	titleTemplate: "%s | Dictation",
});
const authStore = useAuthStore();
authStore.init();
</script>
