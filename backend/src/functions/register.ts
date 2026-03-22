import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { docClient, USERS_TABLE } from '../dynamodb';
import { PutCommand } from '@aws-sdk/lib-dynamodb';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { username, password } = body;

    if (!username || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'username and password are required' }),
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
        ConditionExpression: 'attribute_not_exists(username)',
      })
    );

    return {
      statusCode: 201,
      body: JSON.stringify({ message: 'user registered successfully' }),
    };
  } catch (error: any) {
    console.error('Error:', error);

    if (error.name === 'ConditionalCheckFailedException') {
      return {
        statusCode: 409,
        body: JSON.stringify({ error: 'user already exists' }),
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
