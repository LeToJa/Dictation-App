<template>
  <div class="bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-center justify-between hover:bg-gray-100 transition-colors">
    <div class="flex-1">
      <p class="font-medium text-gray-900">
        {{ file.name }}
      </p>
      <div class="flex gap-4 mt-2 text-sm text-gray-600">
        <span>{{ formatFileSize(file.size) }}</span>
        <span>{{ formatDate(file.uploadedAt) }}</span>
      </div>
    </div>
    <div class="flex gap-2 ml-4">
      <button
        @click="deleteFile"
        :disabled="isDeleting || isRenaming"
        class="px-3 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {{ isDeleting ? 'Eliminando...' : 'Eliminar' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  file: AudioFile
}

const { file } = defineProps<Props>()

const filesStore = useFilesStore()
const isRenaming = ref(false)
const isDeleting = ref(false)
const newName = ref('')

const deleteFile = async () => {
  if (!confirm(`¿Estás seguro de que quieres eliminar "${file.name}"?`)) {
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
</script>