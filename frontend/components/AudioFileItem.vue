<template>
  <div class="bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-center justify-between hover:bg-gray-100 transition-colors">
    <div class="flex-1">
      <div class="flex items-center gap-2">
        <p class="font-medium text-gray-900">
          {{ fileNameWithoutExtension }}
        </p>
      </div>
      <div v-if="file.transcription" class="mt-2">
        <button
          @click="showTranscription = !showTranscription"
          class="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          {{ showTranscription ? 'Ocultar transcripción' : 'Ver transcripción' }}
        </button>
        <div v-if="showTranscription" class="mt-2 p-3 bg-blue-50 rounded border border-blue-200 text-sm text-gray-700">
          {{ file.transcription }}
        </div>
      </div>
    </div>
    <div class="flex gap-2 ml-4">
      <button
        @click="transcribeFile"
        :disabled="isDownloading || isTranscribing || isDeleting"
        class="px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {{ isTranscribing ? 'Transcribiendo...' : (file.transcription ? 'Transcrito' : 'Transcribir') }}
      </button>
        <button
          @click="downloadFile"
          :disabled="isDownloading || isTranscribing || isDeleting"
          class="px-3 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {{ isDownloading ? 'Descargando...' : 'Descargar' }}
        </button>
      <button
        @click="deleteFile"
        :disabled="isDownloading || isDeleting || isTranscribing"
        class="px-3 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {{ isDeleting ? 'Eliminando...' : 'Eliminar' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const { file } = defineProps<{ file: AudioFile }>()

const filesStore = useFilesStore()
const isDeleting = ref(false)
const isTranscribing = ref(false)
const isDownloading = ref(false)
const showTranscription = ref(false)

const fileNameWithoutExtension = computed(() => {
  return file.name.replace(/\.[^/.]+$/, '')
})

const deleteFile = async () => {
  if (!confirm(`¿Estás seguro de que quieres eliminar "${fileNameWithoutExtension.value}"?`)) {
    return
  }

  isDeleting.value = true

  try {
    await filesStore.delete(file.id)
  } catch (err) {
    console.error('Error eliminando archivo:', err)
  } finally {
    isDeleting.value = false
  }
}

const transcribeFile = async () => {
  isTranscribing.value = true

  try {
    await filesStore.transcribe(file.id)
  } catch (err) {
    alert('Error al transcribir el archivo. Por favor, intenta de nuevo.')
  } finally {
    isTranscribing.value = false
  }
}

const downloadFile = async () => {
  isDownloading.value = true

  try {
    await filesStore.download(file.id)
  } catch (err) {
    console.error('Error downloading file:', err)
    alert('Error al descargar el archivo. Por favor, intenta de nuevo.')
  } finally {
    isDownloading.value = false
  }
}
</script>