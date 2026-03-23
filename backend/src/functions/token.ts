import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

export const handler = async (
	_event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
	try {
		const apiKey = process.env.SPEECHMATICS_API_KEY;
		if (!apiKey) {
			return {
				statusCode: 500,
				body: JSON.stringify({
					error: "API key de Speechmatics no configurada.",
				}),
			};
		}

		const response = await fetch(
			"https://mp.speechmatics.com/v1/api_keys?type=rt",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${apiKey}`,
				},
				body: JSON.stringify({ ttl: 60 }),
			},
		);

		if (!response.ok) {
			const errorText = await response.text();
			return {
				statusCode: response.status,
				body: JSON.stringify({
					error: `Error generando token RT: ${errorText}`,
				}),
			};
		}

		interface ApiKeyResponse {
			apikey_id: string | null;
			key_value: string;
		}

		const data = (await response.json()) as ApiKeyResponse;
		const token = data.key_value;

		if (!token) {
			return {
				statusCode: 500,
				body: JSON.stringify({ error: "No se obtuvo token de Speechmatics." }),
			};
		}

		return {
			statusCode: 200,
			body: JSON.stringify({ token, lang: process.env.SPEECHMATICS_LANG }),
		};
	} catch (error) {
		console.error("realtime-token error:", error);
		return {
			statusCode: 500,
			body: JSON.stringify({ error: "Error interno al obtener token RT." }),
		};
	}
};
