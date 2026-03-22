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
    const userId = event.headers['user'];

    if (!userId) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Missing userId header' }),
      };
    }

    const contentType = event.headers['content-type'] || event.headers['Content-Type'] || '';
    
    let fileBuffer: Buffer;
    let fileName: string;

    if (contentType.includes('application/octet-stream')) {
      fileBuffer = Buffer.from(event.body || '', 'base64');
      fileName = event.headers['x-filename'] || `audio-${Date.now()}`;
    } else if (contentType.includes('multipart/form-data')) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Multipart upload not yet implemented. Use binary upload.' }),
      };
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid content type' }),
      };
    }

    const validExtensions = ['.mp3', '.wav'];
    const hasValidExtension = validExtensions.some((ext) => fileName.toLowerCase().endsWith(ext));

    if (!hasValidExtension) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid file type. Only MP3 and WAV files are allowed.' }),
      };
    }

    const fileId = uuidv4();
    const timestamp = new Date().toISOString();

    const filePath = path.join(UPLOADS_DIR, fileId);
    fs.writeFileSync(filePath, fileBuffer);

    const fileRecord = {
      id: fileId,
      userId,
      name: fileName,
      originalName: fileName,
      uploadedAt: timestamp,
      size: fileBuffer.length,
      filePath,
    };

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
        originalName: fileName,
        uploadedAt: timestamp,
        size: fileBuffer.length,
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
