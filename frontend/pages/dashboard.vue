<template>
	<NuxtLayout>
		<h1 class="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
		<div class="flex gap-4 mb-6 justify-center">
			<button
				@click="isDictate = false"
				class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
				:class="
					isDictate
						? 'bg-gray-200 text-gray-700'
						: 'bg-blue-500 text-white hover:bg-blue-600'
				"
			>
				Subir Audio
			</button>
			<button
				@click="isDictate = true"
				class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
				:class="
					!isDictate
						? 'bg-gray-200 text-gray-700'
						: 'bg-blue-500 text-white hover:bg-blue-600'
				"
			>
				Dictar Audio
			</button>
		</div>
		<AudioUploadForm v-if="!isDictate" />
		<AudioDictateForm v-else />
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
const isDictate = ref(false);

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
