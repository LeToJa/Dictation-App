/* eslint-disable @typescript-eslint/no-explicit-any */
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { docClient, FILES_TABLE } from "../../dynamodb";
import { GetCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import * as fs from "fs";

export const handler = async (
	event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
	try {
		const userId = event.headers["user"];

		if (!userId) {
			return {
				statusCode: 401,
				body: JSON.stringify({ error: "Missing userId header" }),
			};
		}

		const fileId = event.pathParameters?.id;

		if (!fileId) {
			return {
				statusCode: 400,
				body: JSON.stringify({ error: "File ID is required" }),
			};
		}

		const result = await docClient.send(
			new GetCommand({
				TableName: FILES_TABLE,
				Key: { id: fileId },
			}),
		);

		const file = result.Item as any;

		if (!file || file.userId !== userId) {
			return {
				statusCode: 403,
				body: JSON.stringify({ error: "Unauthorized" }),
			};
		}

		if (file.filePath && fs.existsSync(file.filePath)) {
			try {
				fs.unlinkSync(file.filePath);
			} catch (err) {
				console.error("Error deleting file from disk:", err);
			}
		}

		await docClient.send(
			new DeleteCommand({
				TableName: FILES_TABLE,
				Key: { id: fileId },
			}),
		);

		return {
			statusCode: 200,
			body: JSON.stringify({ message: "File deleted successfully" }),
		};
	} catch (error: any) {
		console.error("Error:", error);
		return {
			statusCode: 500,
			body: JSON.stringify({ error: "Internal server error" }),
		};
	}
};
