<template>
	<div class="bg-white p-6 rounded-lg shadow mb-6">
		<h2 class="text-xl font-semibold mb-4 text-gray-800">Dictar Audio</h2>

		<div class="flex gap-2 mb-4">
			<button
				v-if="
					status === TranscriptionStatus.INITIAL ||
					status === TranscriptionStatus.LOADING
				"
				@click="startDictation"
				:disabled="status === TranscriptionStatus.LOADING"
				class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
			>
				Iniciar dictado en tiempo real
			</button>
			<button
				v-else-if="
					status === TranscriptionStatus.RECORDING ||
					status === TranscriptionStatus.PROCESSING
				"
				@click="stopDictation"
				:disabled="status === TranscriptionStatus.PROCESSING"
				class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
			>
				Detener dictado
			</button>
			<template
				v-else-if="
					(status === TranscriptionStatus.COMPLETED && transcript) ||
					status === TranscriptionStatus.UPLOADING
				"
			>
				<button
					@click="uploadRecording"
					:disabled="status === TranscriptionStatus.UPLOADING"
					class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
				>
					{{
						status !== TranscriptionStatus.UPLOADING
							? "Subir transcripción y audio"
							: "Subiendo..."
					}}
				</button>
				<button
					@click="resetState()"
					:disabled="status === TranscriptionStatus.UPLOADING"
					class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
				>
					Cancelar
				</button>
			</template>
		</div>
		<div
			v-if="error"
			class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md"
		>
			<p class="text-red-700 text-sm">{{ error }}</p>
		</div>
		<div class="grid gap-4">
			<div class="p-4 bg-gray-50 rounded-lg">
				<h3 class="text-sm font-semibold text-gray-700 mb-2">Transcripción</h3>
				<p class="whitespace-pre-wrap text-gray-800">
					{{ transcript || partialTranscript || "(sin transcripción todavía)" }}
				</p>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { RealtimeClient } from "@speechmatics/real-time-client";

const filesStore = useFilesStore();
const authStore = useAuthStore();
const transcript = ref("");
const partialTranscript = ref("");
const error = ref("");
const status = ref(TranscriptionStatus.INITIAL);

let client: RealtimeClient | null = null;
let mediaRecorder: MediaRecorder | null = null;
let stream: MediaStream | null = null;
let audioChunks: Blob[] = [];

const handleRealtimeMessage = (event: any) => {
	const msg = event.data;

	if (!msg || typeof msg !== "object") {
		return;
	}

	if (msg.message === "AddPartialTranscript") {
		partialTranscript.value = normalizeTranscript(msg.results);

		return;
	}

	if (msg.message === "AddTranscript") {
		const text = normalizeTranscript(msg.results);

		if (text) {
			transcript.value = transcript.value
				? `${transcript.value} ${text}`.trim()
				: text;
		}

		partialTranscript.value = "";

		return;
	}

	if (msg.message === "Error") {
		stopDictation();
		resetState(
			`Error del servidor de transcripción: ${msg.error || "Desconocido"}`,
		);

		return;
	}
};

const startDictation = async () => {
	const tokenResponse = await authStore.token();
	const token = tokenResponse.token;
	const lang = tokenResponse.lang;

	if (!token) {
		resetState("No se pudo obtener el token de autenticación.");

		return;
	}

	try {
		client = new RealtimeClient({ url: "wss://eu.rt.speechmatics.com/v2" });
		client.addEventListener("receiveMessage", handleRealtimeMessage);
		client.addEventListener("socketStateChange", (ev: any) => {
			if (ev.socketState === "connecting") {
				status.value = TranscriptionStatus.LOADING;
			}
		});

		await client.start(token, {
			transcription_config: {
				language: lang,
				enable_partials: true,
			},
		});

		stream = await navigator.mediaDevices.getUserMedia({ audio: true });

		mediaRecorder = new MediaRecorder(stream, {
			mimeType: "audio/webm;codecs=opus",
		});
		mediaRecorder.addEventListener("dataavailable", async (event) => {
			if (event.data && event.data.size > 0) {
				audioChunks.push(event.data);
			}

			if (!event.data || event.data.size === 0 || !client) return;

			try {
				const buffer = await event.data.arrayBuffer();
				client.sendAudio(buffer);
			} catch (sendError) {
				console.error("Error enviando audio:", sendError);
			}
		});

		mediaRecorder.addEventListener("error", (event) => {
			error.value = `MediaRecorder error: ${event}`;
		});

		mediaRecorder.start(250);
		status.value = TranscriptionStatus.RECORDING;
	} catch (err: any) {
		stopDictation();
		resetState(err instanceof Error ? err.message : String(err));
	}
};

const stopDictation = async () => {
	status.value = TranscriptionStatus.PROCESSING;

	if (mediaRecorder && mediaRecorder.state !== "inactive") {
		mediaRecorder.stop();
	}

	if (stream) {
		stream.getTracks().forEach((track) => track.stop());
		stream = null;
	}

	if (client) {
		try {
			await client.stopRecognition();
		} catch (stopError) {
			console.warn("Error al detener reconocimiento:", stopError);
		}

		client = null;
	}

	status.value = TranscriptionStatus.COMPLETED;
};

const uploadRecording = async () => {
	if (audioChunks.length === 0 || !transcript.value) return;

	status.value = TranscriptionStatus.UPLOADING;

	try {
		const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
		const fileName = `Dictado ${normalizeDate(Date.now())}.webm`;
		const file = new File([audioBlob], fileName, { type: "audio/webm" });

		await filesStore.upload(file, transcript.value);

		resetState();
	} catch (err: any) {
		error.value = err instanceof Error ? err.message : String(err);
	}
};

const resetState = (errorMessage?: string) => {
	error.value = errorMessage || "";
	transcript.value = "";
	partialTranscript.value = "";
	audioChunks = [];
	status.value = TranscriptionStatus.INITIAL;
};
</script>
