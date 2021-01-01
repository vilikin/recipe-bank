import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as AWS from "aws-sdk";
import { AddRecipePayload, AddRecipePayloadCodec } from "./codecs";
import { v4 as uuidv4 } from "uuid";
import { PutItemInputAttributeMap } from "aws-sdk/clients/dynamodb";
import { removeUndefinedAttributes } from "./utils/dynamodb-utils";

const DynamoDB = new AWS.DynamoDB();

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const username = event.requestContext?.authorizer?.claims?.["cognito:username"];

  if (!username) {
    throw new Error("Username not found from request context");
  }

  const parsedBody = JSON.parse(event.body ?? "{}");
  const { name, url, imageUuid } = AddRecipePayloadCodec.unsafeDecode(parsedBody);
  const uuid = uuidv4();

  const itemPayload: PutItemInputAttributeMap = {
    uuid: { S: uuid },
    name: { S: name },
    url: { S: url },
    username: { S: username },
    imageUuid: { S: imageUuid },
  };

  await DynamoDB.putItem({
    TableName: "recipes",
    Item: removeUndefinedAttributes(itemPayload),
  }).promise();

  return {
    statusCode: 200,
    body: JSON.stringify({
      uuid,
      name,
      url,
      username,
      imageUuid,
    }),
  };
}
