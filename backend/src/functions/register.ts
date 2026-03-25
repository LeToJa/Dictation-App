/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { v4 as uuidv4 } from "uuid";
import { docClient, USERS_TABLE } from "../dynamodb";
import { QueryCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

export const handler = async (
	event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
	try {
		const body = JSON.parse(event.body || "{}");
		const { username, password, confirmPassword } = body;

		if (password !== confirmPassword) {
			return {
				statusCode: 400,
				body: JSON.stringify({
					error: "Las contraseñas no coinciden.",
				}),
			};
		}

		if (!username || !password) {
			return {
				statusCode: 400,
				body: JSON.stringify({
					error: "Falta el usuario o la contraseña.",
				}),
			};
		}

		if (password.length < 6) {
			return {
				statusCode: 400,
				body: JSON.stringify({
					error: "La contraseña debe tener al menos 6 caracteres.",
				}),
			};
		}

		const queryResult = await docClient.send(
			new QueryCommand({
				TableName: USERS_TABLE,
				IndexName: "UsernameIndex",
				KeyConditionExpression: "username = :username",
				ExpressionAttributeValues: {
					":username": username,
				},
			}),
		);

		if (queryResult.Items && queryResult.Items.length > 0) {
			return {
				statusCode: 400,
				body: JSON.stringify({ error: "Ya existe este usuario." }),
			};
		}

		const userObject = {
			id: uuidv4(),
			username,
			password,
		};

		await docClient.send(
			new PutCommand({
				TableName: USERS_TABLE,
				Item: userObject,
			}),
		);

		return {
			statusCode: 201,
			body: JSON.stringify({
				message: "Usuario registrado exitosamente.",
				userId: userObject.id,
			}),
		};
	} catch (error: any) {
		return {
			statusCode: 500,
			body: JSON.stringify({ error: "Error interno." }),
		};
	}
};
