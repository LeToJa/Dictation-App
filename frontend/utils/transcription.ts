/* eslint-disable @typescript-eslint/no-explicit-any */
export const normalizeTranscript = (results: Array<any>) => {
	if (!Array.isArray(results)) return "";

	return results
		.map((r) => {
			if (!r || !Array.isArray(r.alternatives)) return "";

			return r.alternatives[0]?.content.trim() || "";
		})
		.filter(Boolean)
		.join(" ");
};

export const normalizeDate = (timestamp: number) => {
	const date = new Date(timestamp);
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	const hours = String(date.getHours()).padStart(2, "0");
	const minutes = String(date.getMinutes()).padStart(2, "0");

	return `${hours}:${minutes}, ${day}/${month}/${year}`;
};
