/* eslint-disable @typescript-eslint/no-explicit-any */
import { normalizeTranscript, normalizeDate } from "../../utils/transcription";

describe("transcription", () => {
	describe("normalizeTranscript", () => {
		it("devuelve cadena vacía para entradas que no son array", () => {
			expect(normalizeTranscript(123 as any)).toBe("");
		});

		it("devuelve cadena vacía cuando no hay alternativas en los resultados", () => {
			const payload = [{ alternatives: [] }, { alternatives: undefined }];

			expect(normalizeTranscript(payload)).toBe("");
		});

		it("recorta y concatena el contenido de la primera alternativa", () => {
			const payload = [
				{ alternatives: [{ content: " Hello " }] },
				{ alternatives: [{ content: "World" }] },
			];

			expect(normalizeTranscript(payload)).toBe("Hello World");
		});

		it("omite cadenas alternativas vacías o falsy", () => {
			const payload = [
				{ alternatives: [{ content: "Foo" }] },
				{ alternatives: [{ content: "" }] },
				{ alternatives: [{ content: " Bar " }] },
				null,
				{ alternatives: null },
			];

			expect(normalizeTranscript(payload)).toBe("Foo Bar");
		});
	});

	describe("normalizeDate", () => {
		it("formatea la fecha a HH:mm, dd/MM/yyyy", () => {
			const date = new Date(Date.UTC(2025, 10, 5, 8, 9, 0));
			const ts = date.getTime();
			const local = new Date(ts);

			const expectedHours = String(local.getHours()).padStart(2, "0");
			const expectedMinutes = String(local.getMinutes()).padStart(2, "0");
			const expectedDay = String(local.getDate()).padStart(2, "0");
			const expectedMonth = String(local.getMonth() + 1).padStart(2, "0");
			const expectedYear = String(local.getFullYear());

			expect(normalizeDate(ts)).toBe(
				`${expectedHours}:${expectedMinutes}, ${expectedDay}/${expectedMonth}/${expectedYear}`,
			);
		});

		it("espacia correctamente la fecha", () => {
			const date = new Date(2024, 0, 2, 3, 4, 0);
			const formatted = normalizeDate(date.getTime());

			expect(formatted).toMatch(/^03:04, 02\/01\/2024$/);
		});
	});
});
