import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as AWS from "aws-sdk";
import { AddRecipePayload, AddRecipePayloadCodec } from "./codecs";
import { v4 as uuidv4 } from "uuid";

const DynamoDB = new AWS.DynamoDB();

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const parsedBody = JSON.parse(event.body ?? "{}");
  const addRecipePayload: AddRecipePayload = AddRecipePayloadCodec.unsafeDecode(parsedBody);
  const username = event.requestContext?.authorizer?.claims?.["cognito:username"];

  if (!username) {
    throw new Error("Username not found from request context");
  }

  const uuid = uuidv4();

  console.log(uuid);
  console.log(username);
  console.log(addRecipePayload.name);
  console.log(addRecipePayload.url);

  await DynamoDB.putItem({
    TableName: "recipes",
    Item: {
      uuid: { S: uuid },
      name: { S: addRecipePayload.name },
      url: { S: addRecipePayload.url }, // TODO: fix not accepting undefined url
      username: { S: username },
    },
  }).promise();

  return {
    statusCode: 200,
    body: JSON.stringify({
      uuid: uuid,
      name: addRecipePayload.name,
      url: addRecipePayload.url,
      username,
    }),
  };
}
