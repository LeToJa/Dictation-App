<template>
	<NuxtLayout>
		<h1 class="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
		<AudioUploadForm />
		<div class="mt-8">
			<h2 class="text-2xl font-semibold text-gray-800 mb-4">Tus audios</h2>
			<div
				v-if="filesStore.loading && filesStore.files.length === 0"
				class="text-center py-12"
			>
				<p class="text-gray-600">Cargando archivos...</p>
			</div>
			<div
				v-else-if="filesStore.files.length === 0"
				class="text-center py-12 bg-gray-50 rounded-lg"
			>
				<p class="text-gray-600">No has subido ningún archivo de audio aún.</p>
			</div>
			<div v-else class="space-y-3">
				<AudioFileItem
					v-for="file in filesStore.files"
					:key="file.id"
					:file="file"
				/>
			</div>
		</div>
	</NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({
	middleware: ["auth"],
});

const filesStore = useFilesStore();

useHead({
	title: "Panel de Control",
});

onMounted(async () => {
	try {
		await filesStore.list();
	} catch (error) {
		console.error("Error cargando archivos:", error);
	}
});
</script>
