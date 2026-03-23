/* eslint-disable @typescript-eslint/no-unused-vars */
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { docClient, USERS_TABLE } from "../dynamodb";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";

export const handler = async (
	event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
	try {
		const body = JSON.parse(event.body || "{}");
		const { username, password } = body;

		if (!username || !password) {
			return {
				statusCode: 400,
				body: JSON.stringify({
					error: "Falta el usuario o la contraseña.",
				}),
			};
		}

		const result = await docClient.send(
			new ScanCommand({
				TableName: USERS_TABLE,
				FilterExpression: "username = :username",
				ExpressionAttributeValues: {
					":username": username,
				},
			}),
		);

		const userObject = (result.Items && result.Items[0]) as
			| { id: string; username: string; password?: string }
			| undefined;

		if (!userObject || userObject.password !== password) {
			return {
				statusCode: 401,
				body: JSON.stringify({ error: "Credenciales inválidas." }),
			};
		}

		const responseusername = {
			id: userObject.id,
			username: userObject.username,
		};

		return {
			statusCode: 200,
			body: JSON.stringify({ ...responseusername }),
		};
	} catch (error) {
		return {
			statusCode: 500,
			body: JSON.stringify({ error: "Error interno." }),
		};
	}
};
