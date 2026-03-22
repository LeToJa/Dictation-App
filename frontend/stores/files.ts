export interface AudioFile {
  id: string
  name: string
  originalName: string
  uploadedAt: string
  size: number
}

export const useFilesStore = defineStore('files', {
  state: () => ({
    files: [] as AudioFile[],
    loading: false,
    error: null as string | null,
  }),
  actions: {
    async list() {
      this.loading = true
      this.error = null

      try {
        const { $api } = useNuxtApp()
        const response = await $api<AudioFile[]>('/files', {
          method: 'GET',
        })

        this.files = response
      } catch (error) {
        console.error('Error fetching files:', error)
        this.error = 'Failed to fetch files'
        throw error
      } finally {
        this.loading = false
      }
    },
    async upload(file: File, id: string): Promise<AudioFile> {
      const { $api } = useNuxtApp()
      const fileBuffer = await file.arrayBuffer()
      
      const response = await $api<AudioFile>('/files/upload', {
        method: 'POST',
        headers: {
          'id': id,
          'Content-Type': 'application/octet-stream',
          'x-filename': file.name,
        },
        body: fileBuffer,
      })

      return response
    },
    async delete(fileId: string) {
      this.error = null

      try {
        const { $api } = useNuxtApp()

        await $api(`/files/delete/${fileId}`, {
          method: 'DELETE',
        })

        this.files = this.files.filter((f) => f.id !== fileId)
      } catch (error) {
        console.error('Error deleting file:', error)
        this.error = 'Failed to delete file'
        throw error
      }
    },
  },
})
