/* eslint-disable @typescript-eslint/no-explicit-any */
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { docClient, FILES_TABLE } from '../../dynamodb';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import * as fs from 'fs';
import * as path from 'path';

const UPLOADS_DIR = path.join(__dirname, '../../../uploads');

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }

    const userId = event.headers['user'];

    if (!userId) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Missing userId header' }),
      };
    }

    const fileBuffer: Buffer = Buffer.from(event.body || '', 'base64');
    const fileName: string = event.headers['name'] || `audio-${Date.now()}`;

    const validExtensions = ['.mp3', '.wav'];
    const hasValidExtension = validExtensions.some((ext) => fileName.toLowerCase().endsWith(ext));

    if (!hasValidExtension) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid file type. Only MP3 and WAV files are allowed.' }),
      };
    }

    const fileId = uuidv4();
    const extension = path.extname(fileName) || ''

    const filePath = path.join(UPLOADS_DIR, `${fileId}${extension}`)
    fs.writeFileSync(filePath, fileBuffer)

    const fileRecord = {
      id: fileId,
      userId,
      name: fileName,
      filePath,
    }

    await docClient.send(
      new PutCommand({
        TableName: FILES_TABLE,
        Item: fileRecord,
      })
    );

    return {
      statusCode: 201,
      body: JSON.stringify({
        id: fileId,
        name: fileName,
      }),
    };
  } catch (error: any) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
