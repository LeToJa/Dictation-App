<template>
  <div class="bg-white p-6 rounded-lg shadow mb-6">
    <div v-if="error" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
        <p class="text-red-700 text-sm">{{ error }}</p>
    </div>
    <h2 class="text-xl font-semibold mb-4 text-gray-800">Subir Archivo de Audio</h2>
    <div class="relative">
        <input
            ref="fileInput"
            type="file"
            accept=".mp3,.wav"
            class="hidden"
            @change="handleUpload"
        />
        <button
            @click="fileInput?.click()"
            :disabled="isUploading"
            class="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
        >
            <span v-if="!isUploading">Elije archivos MP3 o WAV</span>
            <span v-else>Subiendo...</span>
        </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const filesStore = useFilesStore()
const authStore = useAuthStore()
const fileInput = ref<HTMLInputElement>()
const isUploading = ref(false)
const error = ref('')

const handleUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file || !authStore.id) return

  const validTypes = ['audio/mpeg', 'audio/wav', 'audio/x-wav']
  const isValidType = validTypes.includes(file.type)
  const isValidName = file.name.endsWith('.mp3') || file.name.endsWith('.wav')

  if (!isValidType && !isValidName) {
    error.value = 'Por favor, selecciona un archivo MP3 o WAV válido.'
    
    if (fileInput.value) {
      fileInput.value.value = ''
    }

    return
  }

  isUploading.value = true
  error.value = ''

  try {
    const uploadedFile = await filesStore.upload(file)
    filesStore.files.push(uploadedFile)
    
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error desconocido al subir el archivo.'
  } finally {
    isUploading.value = false
  }
}
</script>
