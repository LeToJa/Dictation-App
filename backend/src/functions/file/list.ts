import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { docClient, FILES_TABLE } from '../../dynamodb';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const userId = event.headers['user'];

    if (!userId) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Missing userId header' }),
      };
    }

    const result = await docClient.send(
      new QueryCommand({
        TableName: FILES_TABLE,
        IndexName: 'UserIdIndex',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId,
        },
      })
    );

    const files = (result.Items || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      originalName: item.originalName,
      uploadedAt: item.uploadedAt,
      size: item.size,
    }));

    return {
      statusCode: 200,
      body: JSON.stringify(files),
    };
  } catch (error: any) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
