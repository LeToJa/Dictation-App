<template>
	<div>
		<nav class="bg-blue-600 text-white shadow">
			<div class="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
				<div class="flex items-center justify-between h-16">
					<div class="flex items-center space-x-4">
						<NuxtLink
							:to="authStore.isAuthenticated ? '/dashboard' : '/login'"
							class="text-white text-sm font-extrabold"
						>
							Dictation App
						</NuxtLink>
					</div>

					<div v-if="authStore.isAuthenticated" class="flex items-center">
						<button
							@click="handleLogout"
							class="text-white px-3 py-2 rounded-md text-sm font-medium"
						>
							Cerrar Sesión ({{ authStore.username }})
						</button>
					</div>
				</div>
			</div>
		</nav>
		<main>
			<div class="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
				<slot />
			</div>
		</main>
	</div>
</template>

<script setup lang="ts">
const authStore = useAuthStore();
const router = useRouter();

const handleLogout = () => {
	authStore.logout();
	router.push("/login");
};
</script>
