/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { docClient, FILES_TABLE } from "../../dynamodb";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import * as fs from "fs";

export const handler = async (
	event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
	try {
		const userId = event.headers["user"];

		if (!userId) {
			return {
				statusCode: 401,
				body: JSON.stringify({ error: "Falta el ID de usuario." }),
			};
		}

		const fileId = event.pathParameters?.id;

		if (!fileId) {
			return {
				statusCode: 400,
				body: JSON.stringify({ error: "Falta el ID del archivo." }),
			};
		}

		const result = await docClient.send(
			new GetCommand({
				TableName: FILES_TABLE,
				Key: {
					id: fileId,
					userId: userId,
				},
			}),
		);

		if (!result.Item || result.Item.userId !== userId) {
			return {
				statusCode: 404,
				body: JSON.stringify({ error: "Archivo no encontrado." }),
			};
		}

		const fileRecord = result.Item as any;
		const filePath = fileRecord.filePath;

		if (!fs.existsSync(filePath)) {
			return {
				statusCode: 404,
				body: JSON.stringify({ error: "Archivo no encontrado en el disco." }),
			};
		}

		const fileBuffer = fs.readFileSync(filePath);
		const fileBufferOutput = fileBuffer.toString("base64");

		return {
			statusCode: 200,
			body: JSON.stringify({
				base64: fileBufferOutput,
				name: fileRecord.name,
			}),
		};
	} catch (error) {
		return {
			statusCode: 500,
			body: JSON.stringify({ error: "Error interno." }),
		};
	}
};
