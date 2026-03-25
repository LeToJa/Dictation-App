/* eslint-disable @typescript-eslint/no-explicit-any */
import "@testing-library/vue";
import { vi } from "vitest";
import { ref, computed, watch, onMounted } from "vue";

(global as any).ref = ref;
(global as any).computed = computed;
(global as any).watch = watch;
(global as any).onMounted = onMounted;
(global as any).defineProps = (props: any) => props;
(global as any).defineEmits = () => {};
(global as any).defineStore = () => {};
global.confirm = vi.fn();
global.alert = vi.fn();

vi.mock("#app", () => ({
	useNuxtApp: () => ({
		$api: vi.fn(),
	}),
	defineNuxtPlugin: vi.fn(),
}));
