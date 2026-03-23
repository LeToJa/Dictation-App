/* eslint-disable @typescript-eslint/no-explicit-any */
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { docClient, FILES_TABLE } from "../../dynamodb";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";

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

		const result = await docClient.send(
			new QueryCommand({
				TableName: FILES_TABLE,
				IndexName: "UserIdIndex",
				KeyConditionExpression: "userId = :userId",
				ExpressionAttributeValues: {
					":userId": userId,
				},
			}),
		);

		const files = (result.Items || []).map((item: any) => ({
			id: item.id,
			name: item.name,
			transcription: item.transcription,
		}));

		return {
			statusCode: 200,
			body: JSON.stringify(files),
		};
	} catch (error: any) {
		console.error("Error:", error);
		return {
			statusCode: 500,
			body: JSON.stringify({ error: "Error interno." }),
		};
	}
};
