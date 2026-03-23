import { APIGatewayProxyEvent } from "aws-lambda";
import { handler } from "../../src/functions/token";

describe("Token Handler", () => {
	const originalEnv = process.env;

	beforeEach(() => {
		process.env = { ...originalEnv };
		jest.clearAllMocks();
	});

	afterAll(() => {
		process.env = originalEnv;
	});

	it("debe retornar 401 cuando falta el encabezado de usuario", async () => {
		const event = {
			headers: {},
		} as unknown as APIGatewayProxyEvent;

		process.env.SPEECHMATICS_API_KEY = "test-api-key";

		const result = await handler(event);

		expect(result.statusCode).toBe(401);
		expect(JSON.parse(result.body)).toEqual({
			error: "Falta el ID de usuario.",
		});
	});

	it("debe retornar 500 cuando la clave API no está configurada", async () => {
		const event = {
			headers: {
				user: "user-123",
			},
		} as unknown as APIGatewayProxyEvent;

		delete process.env.SPEECHMATICS_API_KEY;

		const result = await handler(event);

		expect(result.statusCode).toBe(500);
		expect(JSON.parse(result.body)).toEqual({
			error: "API key de Speechmatics no configurada.",
		});
	});

	it("debe retornar 500 cuando la API de Speechmatics no retorna un token", async () => {
		const event = {
			headers: {
				user: "user-123",
			},
		} as unknown as APIGatewayProxyEvent;

		process.env.SPEECHMATICS_API_KEY = "test-api-key";
		process.env.SPEECHMATICS_LANG = "es";

		global.fetch = jest.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				apikey_id: "key-123",
				key_value: null, // No token
			}),
		});

		const result = await handler(event);

		expect(result.statusCode).toBe(500);
		expect(JSON.parse(result.body)).toEqual({
			error: "No se obtuvo token o idioma de Speechmatics.",
		});
	});

	it("debe manejar errores de la API de Speechmatics correctamente", async () => {
		const event = {
			headers: {
				user: "user-123",
			},
		} as unknown as APIGatewayProxyEvent;

		process.env.SPEECHMATICS_API_KEY = "test-api-key";

		const errorMessage = "Invalid API key";
		global.fetch = jest.fn().mockResolvedValue({
			ok: false,
			status: 401,
			text: async () => errorMessage,
		});

		const result = await handler(event);

		expect(result.statusCode).toBe(401);
		expect(JSON.parse(result.body)).toEqual({
			error: `Error generando token RT: ${errorMessage}`,
		});
	});

	it("debe retornar 500 cuando se lanza una excepción", async () => {
		const event = {
			headers: {
				user: "user-123",
			},
		} as unknown as APIGatewayProxyEvent;

		process.env.SPEECHMATICS_API_KEY = "test-api-key";

		global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));

		const result = await handler(event);

		expect(result.statusCode).toBe(500);
		expect(JSON.parse(result.body)).toEqual({
			error: "Error interno.",
		});
	});
	it("debe retornar 200 con token e idioma cuando la solicitud es exitosa", async () => {
		const event = {
			headers: {
				user: "user-123",
			},
		} as unknown as APIGatewayProxyEvent;

		process.env.SPEECHMATICS_API_KEY = "test-api-key";
		process.env.SPEECHMATICS_LANG = "es";

		const mockToken = "rt_test_token_12345";
		global.fetch = jest.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				apikey_id: "key-123",
				key_value: mockToken,
			}),
		});

		const result = await handler(event);

		expect(result.statusCode).toBe(200);
		expect(JSON.parse(result.body)).toEqual({
			token: mockToken,
			lang: "es",
		});
	});

	it("debe llamar a la API de Speechmatics con parámetros correctos", async () => {
		const event = {
			headers: {
				user: "user-123",
			},
		} as unknown as APIGatewayProxyEvent;

		process.env.SPEECHMATICS_API_KEY = "test-api-key";

		global.fetch = jest.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				apikey_id: "key-123",
				key_value: "test_token",
			}),
		});

		await handler(event);

		expect(global.fetch).toHaveBeenCalledWith(
			"https://mp.speechmatics.com/v1/api_keys?type=rt",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: "Bearer test-api-key",
				},
				body: JSON.stringify({ ttl: 60 }),
			},
		);
	});
});
