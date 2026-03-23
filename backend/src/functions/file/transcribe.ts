/* eslint-disable @typescript-eslint/no-explicit-any */
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { docClient, FILES_TABLE } from "../../dynamodb";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import * as fs from "fs";
import * as path from "path";

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
				body: JSON.stringify({ error: "Missing fileId" }),
			};
		}

		const result = await docClient.send(
			new GetCommand({
				TableName: FILES_TABLE,
				Key: {
					id: fileId,
				},
			}),
		);

		if (!result.Item || result.Item.userId !== userId) {
			return {
				statusCode: 404,
				body: JSON.stringify({ error: "File not found" }),
			};
		}

		const fileRecord = result.Item as any;
		const filePath = fileRecord.filePath;

		if (!fs.existsSync(filePath)) {
			return {
				statusCode: 404,
				body: JSON.stringify({ error: "File not found on disk" }),
			};
		}

		const apiKey = process.env.SPEECHMATICS_API_KEY;

		if (!apiKey) {
			return {
				statusCode: 500,
				body: JSON.stringify({
					error: "Speechmatics API key not configured",
				}),
			};
		}

		const baseUrl = process.env.SPEECHMATICS_BASE_URL;

		const buffer = fs.readFileSync(filePath);
		const formData = new FormData();

		formData.append("data_file", new Blob([buffer]), path.basename(filePath));
		formData.append(
			"config",
			JSON.stringify({
				type: "transcription",
				transcription_config: {
					language: process.env.SPEECHMATICS_LANG,
				},
			}),
		);

		const createResponse = await fetch(`${baseUrl}/jobs`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${apiKey}`,
			},
			body: formData,
		});

		if (!createResponse.ok) {
			const errorText = await createResponse.text();

			throw new Error(
				`Failed to create job: ${createResponse.status} ${errorText}`,
			);
		}

		const createData = (await createResponse.json()) as { id: string };
		const jobId = createData.id;

		let jobStatus = "running";

		while (jobStatus === "running") {
			await new Promise((resolve) => setTimeout(resolve, 2000));

			const statusResponse = await fetch(`${baseUrl}/jobs/${jobId}`, {
				headers: {
					Authorization: `Bearer ${apiKey}`,
				},
			});

			if (!statusResponse.ok) {
				throw new Error(`Failed to get job status: ${statusResponse.status}`);
			}

			const statusData = (await statusResponse.json()) as {
				status: string;
			};
			jobStatus = statusData.status;

			if (jobStatus === "rejected") {
				throw new Error("Transcription job was rejected");
			}
		}

		const transcriptResponse = await fetch(
			`${baseUrl}/jobs/${jobId}/transcript?format=txt`,
			{
				headers: {
					Authorization: `Bearer ${apiKey}`,
				},
			},
		);

		if (!transcriptResponse.ok) {
			throw new Error(`Failed to get transcript: ${transcriptResponse.status}`);
		}

		const transcription = await transcriptResponse.text();

		return {
			statusCode: 200,
			body: JSON.stringify({ transcription }),
		};
	} catch (error) {
		console.error("Transcription error:", error);
		return {
			statusCode: 500,
			body: JSON.stringify({ error: "Transcription failed" }),
		};
	}
};
