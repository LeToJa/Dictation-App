import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({
  endpoint: 'http://localhost:8000',
  region: 'localhost',
  credentials: {
    accessKeyId: 'local',
    secretAccessKey: 'local',
  },
});

export const docClient = DynamoDBDocumentClient.from(client);
export const USERS_TABLE = 'dictation-users';
