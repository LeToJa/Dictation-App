export interface AudioFile {
	id: string;
	name: string;
	transcription?: string;
}

export const useFilesStore = defineStore("files", {
	state: () => ({
		files: [] as AudioFile[],
		loading: false,
		error: null as string | null,
	}),
	actions: {
		async list() {
			this.loading = true;
			this.error = null;

			try {
				const { $api } = useNuxtApp();
				const response = await $api<AudioFile[]>("/files", {
					method: "GET",
				});

				this.files = response;
			} catch (error) {
				console.error("Error fetching files:", error);
				this.error = "Failed to fetch files";
				throw error;
			} finally {
				this.loading = false;
			}
		},
		async upload(file: File, transcription?: string) {
			this.loading = true;
			this.error = null;

			try {
				const { $api } = useNuxtApp();
				const fileBuffer = await file.arrayBuffer();
				const fileBufferOutput = btoa(
					new Uint8Array(fileBuffer).reduce(
						(data, byte) => data + String.fromCharCode(byte),
						"",
					),
				);

				const headers: Record<string, string> = {
					name: file.name,
				};

				if (transcription) {
					headers.transcription = transcription;
				}

				await $api<AudioFile>("/files/upload", {
					method: "POST",
					headers,
					body: fileBufferOutput,
				});

				const response = await $api<AudioFile[]>("/files", {
					method: "GET",
				});

				setTimeout(() => {}, 1000);

				this.files = response;
			} catch (error) {
				console.error("Error uploading file:", error);
				this.error = "Failed to upload file";
				throw error;
			} finally {
				this.loading = false;
			}
		},
		async download(fileId: string): Promise<void> {
			this.error = null;

			try {
				const { $api } = useNuxtApp();

				const data = await $api<{ base64: string; name: string }>(
					`/files/download/${fileId}`,
					{
						method: "GET",
					},
				);

				const buffer = Uint8Array.from(atob(data.base64), (c) =>
					c.charCodeAt(0),
				);
				const blob = new Blob([buffer], {
					type: data.name.toLowerCase().endsWith(".mp3")
						? "audio/mpeg"
						: data.name.toLowerCase().endsWith(".wav")
							? "audio/wav"
							: "audio/webm",
				});

				const url = URL.createObjectURL(blob);
				const downloadLink = document.createElement("a");

				downloadLink.href = url;
				downloadLink.download = data.name;
				downloadLink.click();

				URL.revokeObjectURL(url);
			} catch (error) {
				console.error("Error downloading file:", error);
				this.error = "Failed to download file";
				throw error;
			}
		},
		async delete(fileId: string) {
			this.error = null;

			try {
				const { $api } = useNuxtApp();

				await $api(`/files/delete/${fileId}`, {
					method: "DELETE",
				});

				const response = await $api<AudioFile[]>("/files", {
					method: "GET",
				});

				setTimeout(() => {}, 1000);

				this.files = response;
			} catch (error) {
				console.error("Error deleting file:", error);
				this.error = "Failed to delete file";
				throw error;
			}
		},
		async transcribe(fileId: string) {
			this.error = null;

			try {
				const { $api } = useNuxtApp();

				await $api<{ transcription: string }>(`/files/transcribe/${fileId}`, {
					method: "POST",
				});

				const response = await $api<AudioFile[]>("/files", {
					method: "GET",
				});

				setTimeout(() => {}, 1000);

				this.files = response;
			} catch (error) {
				console.error("Error transcribing file:", error);
				this.error = "Failed to transcribe file";
				throw error;
			}
		},
	},
});
