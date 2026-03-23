<template>
	<div
		class="bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-center justify-between hover:bg-gray-100 transition-colors"
	>
		<div class="flex-1">
			<div class="flex items-center gap-2">
				<p class="font-medium text-gray-900">
					{{ fileNameWithoutExtension }}
				</p>
			</div>
		</div>
		<div class="flex gap-2 ml-4">
			<button
				@click="
					file.transcription
						? (showTranscriptionModal = true)
						: transcribeFile()
				"
				:disabled="isDownloading || isTranscribing || isDeleting"
				class="px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
			>
				{{
					isTranscribing
						? "Transcribiendo..."
						: file.transcription
							? "Ver transcripción"
							: "Transcribir"
				}}
			</button>
			<button
				@click="downloadFile"
				:disabled="isDownloading || isTranscribing || isDeleting"
				class="px-3 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
			>
				{{ isDownloading ? "Descargando..." : "Descargar" }}
			</button>
			<button
				@click="deleteFile"
				:disabled="isDownloading || isDeleting || isTranscribing"
				class="px-3 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
			>
				{{ isDeleting ? "Eliminando..." : "Eliminar" }}
			</button>
		</div>
	</div>
	<div
		v-if="showTranscriptionModal"
		class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
		@click="showTranscriptionModal = false"
	>
		<div
			class="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4 max-h-96 overflow-y-auto"
			@click.stop
		>
			<div class="flex justify-between items-center mb-4">
				<h3 class="text-lg font-semibold text-gray-900">
					Transcripción de {{ fileNameWithoutExtension }}
				</h3>
				<button
					@click="showTranscriptionModal = false"
					class="text-gray-400 hover:text-gray-600"
				>
					✕
				</button>
			</div>
			<div class="text-sm text-gray-700 whitespace-pre-wrap">
				{{ file.transcription }}
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
const { file } = defineProps<{ file: AudioFile }>();

const filesStore = useFilesStore();
const isDeleting = ref(false);
const isTranscribing = ref(false);
const isDownloading = ref(false);
const showTranscriptionModal = ref(false);

const fileNameWithoutExtension = computed(() => {
	return file.name.replace(/\.[^/.]+$/, "");
});

const deleteFile = async () => {
	if (
		!confirm(
			`¿Estás seguro de que quieres eliminar "${fileNameWithoutExtension.value}"?`,
		)
	) {
		return;
	}

	isDeleting.value = true;

	try {
		await filesStore.delete(file.id);
	} catch (err) {
		console.error("Error eliminando archivo:", err);
	} finally {
		isDeleting.value = false;
	}
};

const transcribeFile = async () => {
	isTranscribing.value = true;

	try {
		await filesStore.transcribe(file.id);
	} catch (err) {
		alert("Error al transcribir el archivo. Por favor, intenta de nuevo.");
	} finally {
		isTranscribing.value = false;
	}
};

const downloadFile = async () => {
	isDownloading.value = true;

	try {
		await filesStore.download(file.id);
	} catch (err) {
		console.error("Error downloading file:", err);
		alert("Error al descargar el archivo. Por favor, intenta de nuevo.");
	} finally {
		isDownloading.value = false;
	}
};
</script>
