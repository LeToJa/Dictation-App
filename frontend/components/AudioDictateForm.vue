<template>
	<div class="bg-white p-6 rounded-lg shadow mb-6">
		<h2 class="text-xl font-semibold mb-4 text-gray-800">Dictar Audio</h2>

		<div class="flex gap-2 mb-4">
			<button
				@click="startDictation"
				v-if="!isRecording"
				:disabled="isConnected"
				class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
			>
				Iniciar dictado en tiempo real
			</button>
			<button
				@click="stopDictation"
				v-else
				:disabled="!isConnected"
				class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
			>
				Detener dictado
			</button>
		</div>
		<div
			v-if="error"
			class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md"
		>
			<p class="text-red-700 text-sm">{{ error }}</p>
		</div>
		<div class="grid gap-4">
			<h3 class="text-sm font-semibold text-gray-700 mb-2">Transcripción</h3>
			<p class="whitespace-pre-wrap text-gray-800">
				{{ transcript || "(sin transcripción todavía)" }}
			</p>
		</div>
	</div>
</template>

<script setup lang="ts">
const transcript = ref("");
const error = ref("");
const isRecording = ref(false);
const isConnected = ref(false);

const startDictation = async () => {
	const authStore = useAuthStore();
	const tokenResponse = await authStore.token();
	const token = tokenResponse.token;
	const lang = tokenResponse.lang;

	if (!token) {
		error.value = "No se pudo obtener el token de autenticación.";

		return;
	}

	try {
	} catch (err) {
		error.value = "Error al inicializar el cliente en tiempo real.";
		console.error("RealtimeClient error:", err);
	}
};

const stopDictation = async () => {};

onBeforeUnmount(() => {
	stopDictation();
});
</script>
