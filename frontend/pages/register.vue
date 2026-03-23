<template>
	<NuxtLayout>
		<div class="min-h-screen flex items-center justify-center px-4 py-10">
			<div
				class="max-w-md w-full space-y-8 bg-white border border-gray-300 shadow-lg rounded-xl p-8"
			>
				<h2 class="mt-6 text-center text-3xl font-extrabold">Crea tu cuenta</h2>
				<p class="text-center text-sm">
					Empieza con tu registro para crear tu primera transcripción
				</p>
				<div
					v-if="noticeMessage"
					:class="[
						'rounded-md p-3 mb-4 text-sm',
						noticeType === 'success'
							? 'bg-green-100 border border-green-300 text-green-800'
							: 'bg-red-100 border border-red-300 text-red-800',
					]"
				>
					{{ noticeMessage }}
				</div>
				<form class="mt-6 space-y-6" @submit.prevent="handleRegister">
					<div class="rounded-md">
						<div class="mb-2">
							<label for="username" class="sr-only">Usuario</label>
							<input
								id="username"
								v-model="username"
								type="text"
								required
								class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
								placeholder="Usuario"
							/>
						</div>
						<div class="flex items-center justify-between">
							<label for="password" class="sr-only">Contraseña</label>
							<input
								id="password"
								v-model="password"
								type="password"
								required
								class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
								placeholder="Contraseña"
							/>
						</div>
						<div class="mt-2">
							<label for="confirmPassword" class="sr-only"
								>Confirmar contraseña</label
							>
							<input
								id="confirmPassword"
								v-model="confirmPassword"
								type="password"
								required
								class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
								placeholder="Confirmar contraseña"
							/>
						</div>
					</div>
					<div class="flex items-center justify-between">
						<button
							type="submit"
							:disabled="loading"
							class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
						>
							{{ loading ? "Cargando..." : "Registrarse" }}
						</button>
					</div>
					<div class="text-center">
						<NuxtLink to="/login" class="text-indigo-600 hover:text-indigo-500">
							¿Ya tienes cuenta? Inicia sesión
						</NuxtLink>
					</div>
				</form>
			</div>
		</div>
	</NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({
	middleware: ["guest"],
});

useHead({
	title: "Registrarse",
});

const username = ref("");
const password = ref("");
const confirmPassword = ref("");
const loading = ref(false);
const noticeMessage = ref("");
const noticeType = ref<"success" | "error" | "">("");

const authStore = useAuthStore();

const setNotice = (message: string, type: "success" | "error") => {
	noticeMessage.value = message;
	noticeType.value = type;
};

const handleRegister = async () => {
	noticeMessage.value = "";
	noticeType.value = "";
	loading.value = true;

	if (!username.value.trim() || !password.value) {
		setNotice("Por favor completa usuario y contraseña.", "error");
		loading.value = false;
		return;
	}

	if (password.value.length < 6) {
		setNotice("La contraseña debe tener al menos 6 caracteres.", "error");
		loading.value = false;
		return;
	}

	if (password.value !== confirmPassword.value) {
		setNotice("Las contraseñas no coinciden.", "error");
		loading.value = false;
		return;
	}

	try {
		await authStore.register(username.value, password.value);
		setNotice(
			"¡Registro exitoso! Redirigiendo a inicio de sesión en 5 segundos...",
			"success",
		);
		setTimeout(async () => {
			await navigateTo("/login");
		}, 5000);
	} catch (error) {
		console.error("Registro error:", error);
		setNotice(
			"Error al registrarse: " + (error || "respuesta desconocida"),
			"error",
		);
	} finally {
		loading.value = false;
	}
};
</script>
