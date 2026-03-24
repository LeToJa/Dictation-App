<template>
	<div class="bg-white p-6 rounded-lg shadow mb-6">
		<div
			v-if="error"
			class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg"
		>
			<p class="text-red-700 text-sm">{{ error }}</p>
		</div>
		<h2 class="text-xl font-semibold mb-4 text-gray-800">Subir Audio</h2>
		<div class="relative">
			<input
				ref="fileInput"
				type="file"
				accept=".mp3,.wav,.webm"
				class="hidden"
				@change="handleUpload"
			/>
			<button
				@click="fileInput?.click()"
				:disabled="isUploading"
				class="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
			>
				{{ !isUploading ? "Elije archivos MP3, WAV o WebM" : "Subiendo..." }}
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
const filesStore = useFilesStore();
const authStore = useAuthStore();
const fileInput = ref<HTMLInputElement>();
const isUploading = ref(false);
const error = ref("");

const handleUpload = async (event: Event) => {
	const target = event.target as HTMLInputElement;
	const file = target.files?.[0];

	if (!file || !authStore.id) return;

	const validTypes = ["audio/mpeg", "audio/wav", "audio/x-wav", "audio/webm"];
	const isValidType = validTypes.includes(file.type);
	const isValidName =
		file.name.endsWith(".mp3") ||
		file.name.endsWith(".wav") ||
		file.name.endsWith(".webm");

	if (!isValidType && !isValidName) {
		error.value = "Por favor, selecciona un archivo MP3, WAV o WebM válido.";

		if (fileInput.value) {
			fileInput.value.value = "";
		}

		return;
	}

	isUploading.value = true;
	error.value = "";

	try {
		const uploadedFile = await filesStore.upload(file);
		filesStore.files.unshift(uploadedFile);

		if (fileInput.value) {
			fileInput.value.value = "";
		}
	} catch (err) {
		error.value =
			err instanceof Error
				? err.message
				: "Error desconocido al subir el archivo.";
	} finally {
		isUploading.value = false;
	}
};
</script>
