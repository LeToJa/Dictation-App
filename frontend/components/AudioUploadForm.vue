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
            @change="handleFileSelect"
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
    <div v-if="selectedFile" class="mt-4 p-4 bg-gray-50 rounded-lg">
        <p class="text-sm text-gray-600">
            <strong>Archivo:</strong> {{ selectedFile.name }}
        </p>
        <p class="text-sm text-gray-600 mt-1">
            <strong>Tamaño:</strong> {{ formatFileSize(selectedFile.size) }}
        </p>
        <button
            @click="uploadFile"
            :disabled="isUploading"
            class="mt-3 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
        >
            {{ isUploading ? 'Subiendo...' : 'Subir archivo' }}
        </button>
        <button
            @click="clearSelection"
            :disabled="isUploading"
            class="mt-3 ml-2 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
        >
            Vaciar selección
        </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const filesStore = useFilesStore()
const authStore = useAuthStore()
const config = useRuntimeConfig()
const fileInput = ref<HTMLInputElement>()
const selectedFile = ref<File | null>(null)
const isUploading = ref(false)
const error = ref('')

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/x-wav']
    const isValidType = validTypes.includes(file.type)
    const isValidName = file.name.endsWith('.mp3') || file.name.endsWith('.wav')

    if (!isValidType && !isValidName) {
      error.value = 'Por favor, selecciona un archivo MP3 o WAV válido.'
      selectedFile.value = null
      
      return
    }

    error.value = ''
    selectedFile.value = file
  }
}

const uploadFile = async () => {
  if (!selectedFile.value || !authStore.id) return

  isUploading.value = true
  error.value = ''

  try {
    const uploadedFile = await filesStore.upload(selectedFile.value, authStore.id)
    
    filesStore.files.push(uploadedFile)
    
    selectedFile.value = null
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error desconocido al subir el archivo.'
  } finally {
    isUploading.value = false
  }
}

const clearSelection = () => {
  selectedFile.value = null
  error.value = ''

  if (fileInput.value) {
    fileInput.value.value = ''
  }
}
</script>
