import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as AWS from "aws-sdk";

const DynamoDB = new AWS.DynamoDB();

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const username = event.requestContext?.authorizer?.claims?.["cognito:username"];

  if (!username) {
    throw new Error("Username not found from request context");
  }

  const result = await DynamoDB.scan({
    TableName: "recipes",
    FilterExpression: "username = :username",
    ExpressionAttributeValues: {
      ":username": { S: username },
    },
  }).promise();

  const recipes =
    result?.Items?.map((item) => ({
      uuid: item.uuid.S!,
      name: item.name.S!,
      url: item.url?.S,
      username: item.username?.S,
    })) ?? [];

  return {
    statusCode: 200,
    body: JSON.stringify(recipes),
  };
}
