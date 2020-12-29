import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as AWS from "aws-sdk";
import { AddRecipePayload, AddRecipePayloadCodec } from "./codecs";
import { v4 as uuidv4 } from "uuid";
import { PutItemInputAttributeMap } from "aws-sdk/clients/dynamodb";
import { removeUndefinedAttributes } from "./utils/dynamodb-utils";

const DynamoDB = new AWS.DynamoDB();

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const parsedBody = JSON.parse(event.body ?? "{}");
  const addRecipePayload: AddRecipePayload = AddRecipePayloadCodec.unsafeDecode(parsedBody);
  const username = event.requestContext?.authorizer?.claims?.["cognito:username"];

  if (!username) {
    throw new Error("Username not found from request context");
  }

  const uuid = uuidv4();

  const itemPayload: PutItemInputAttributeMap = {
    uuid: { S: uuid },
    name: { S: addRecipePayload.name },
    url: { S: addRecipePayload.url },
    username: { S: username },
  };

  await DynamoDB.putItem({
    TableName: "recipes",
    Item: removeUndefinedAttributes(itemPayload),
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
