<template>
	<NuxtLayout>
		<div class="min-h-screen flex items-center justify-center px-4 py-10">
			<div
				class="max-w-md w-full space-y-8 bg-white border border-gray-300 shadow-lg rounded-xl p-8"
			>
				<h2 class="mt-6 text-center text-3xl font-extrabold">
					Accede a tu cuenta
				</h2>
				<div
					v-if="noticeMessage"
					class="rounded-md p-3 mb-4 text-sm bg-red-100 border border-red-300 text-red-800"
				>
					{{ noticeMessage }}
				</div>
				<form class="mt-8 space-y-6" @submit.prevent="handleLogin">
					<div class="rounded-md shadow-sm">
						<div class="flex items-center justify-between mb-2">
							<label for="username" class="sr-only">Nombre de usuario</label>
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
					</div>
					<div class="flex items-center justify-between">
						<button
							type="submit"
							:disabled="loading"
							class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
						>
							{{ loading ? "Cargando..." : "Iniciar sesión" }}
						</button>
					</div>
					<div class="text-center">
						<NuxtLink
							to="/register"
							class="text-indigo-600 hover:text-indigo-500"
						>
							¿No tienes cuenta? Regístrate
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
	title: "Iniciar Sesión",
});

const username = ref("");
const password = ref("");
const loading = ref(false);
const noticeMessage = ref("");
const noticeType = ref<"error" | "">("");

const authStore = useAuthStore();

const setNotice = (message: string, type: "error") => {
	noticeMessage.value = message;
	noticeType.value = type;
};

const handleLogin = async () => {
	noticeMessage.value = "";
	noticeType.value = "";
	loading.value = true;

	try {
		await authStore.login(username.value, password.value);
		await navigateTo("/dashboard");
	} catch (error) {
		setNotice(`${error}`, "error");
	} finally {
		loading.value = false;
	}
};
</script>
