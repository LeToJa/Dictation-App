/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import AudioFileItem from "@/components/AudioFileItem.vue";

const mockDelete = vi.fn();
const mockTranscribe = vi.fn();
const mockDownload = vi.fn();

(global as any).useFilesStore = vi.fn(() => ({
	delete: mockDelete,
	transcribe: mockTranscribe,
	download: mockDownload,
	files: [],
	loading: false,
}));

describe("AudioFileItem", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		setActivePinia(createPinia());
	});

	it("debería renderizar el nombre del archivo sin extensión", () => {
		const wrapper = mount(AudioFileItem, {
			props: {
				file: {
					id: "123",
					name: "audio.mp3",
					transcription: "",
				},
			},
		});

		expect(wrapper.text()).toContain("audio");
	});

	it('debería mostrar "Transcribir" cuando no hay transcripción', () => {
		const wrapper = mount(AudioFileItem, {
			props: {
				file: {
					id: "123",
					name: "audio.mp3",
					transcription: "",
				},
			},
		});

		const buttons = wrapper.findAll("button");
		expect(buttons[0].text()).toBe("Transcribir");
	});

	it('debería mostrar "Ver transcripción" cuando hay transcripción', async () => {
		const wrapper = mount(AudioFileItem, {
			props: {
				file: {
					id: "123",
					name: "audio.mp3",
					transcription: "Texto de prueba",
				},
			},
		});

		const buttons = wrapper.findAll("button");
		expect(buttons[0].text()).toBe("Ver transcripción");
	});

	it("debería llamar a transcribeFile cuando se hace click en transcribir", async () => {
		const wrapper = mount(AudioFileItem, {
			props: {
				file: {
					id: "123",
					name: "audio.mp3",
					transcription: "",
				},
			},
		});

		const transcribeButton = wrapper.findAll("button")[0];
		await transcribeButton.trigger("click");

		expect(mockTranscribe).toHaveBeenCalledWith("123");
		expect(mockTranscribe).toHaveBeenCalledTimes(1);
	});

	it("debería mostrar modal cuando hay transcripción y se hace click", async () => {
		const wrapper = mount(AudioFileItem, {
			props: {
				file: {
					id: "123",
					name: "audio.mp3",
					transcription: "Texto de prueba",
				},
			},
		});

		const transcribeButton = wrapper.findAll("button")[0];
		await transcribeButton.trigger("click");

		expect(wrapper.find(".fixed.inset-0").exists()).toBe(true);
		expect(wrapper.text()).toContain("Transcripción de audio");
	});

	it("debería llamar a downloadFile cuando se hace click en descargar", async () => {
		const wrapper = mount(AudioFileItem, {
			props: {
				file: {
					id: "123",
					name: "audio.mp3",
					transcription: "",
				},
			},
		});

		const downloadButton = wrapper.findAll("button")[1];
		await downloadButton.trigger("click");

		expect(mockDownload).toHaveBeenCalledWith("123");
	});

	it("debería mostrar confirmación antes de eliminar", async () => {
		global.confirm = vi.fn(() => true);

		const wrapper = mount(AudioFileItem, {
			props: {
				file: {
					id: "123",
					name: "audio.mp3",
					transcription: "",
				},
			},
		});

		const deleteButton = wrapper.findAll("button")[2];
		await deleteButton.trigger("click");

		expect(global.confirm).toHaveBeenCalledWith(
			'¿Estás seguro de que quieres eliminar "audio"?',
		);
		expect(mockDelete).toHaveBeenCalledWith("123");
	});

	it("no debería eliminar si el usuario cancela", async () => {
		global.confirm = vi.fn(() => false);

		const wrapper = mount(AudioFileItem, {
			props: {
				file: {
					id: "123",
					name: "audio.mp3",
					transcription: "",
				},
			},
		});

		const deleteButton = wrapper.findAll("button")[2];
		await deleteButton.trigger("click");

		expect(mockDelete).not.toHaveBeenCalled();
	});
});
