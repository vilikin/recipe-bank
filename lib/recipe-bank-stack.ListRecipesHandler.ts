import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as AWS from "aws-sdk";
import { RecipeCodec } from "./codecs";

const DynamoDB = new AWS.DynamoDB();

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const result = await DynamoDB.scan({
    TableName: "recipes",
  }).promise();

  const recipes =
    result?.Items?.map((item) => ({
      uuid: item.uuid.S!,
      name: item.name.S!,
      url: item.url?.S,
    })) ?? [];

  return {
    statusCode: 200,
    body: JSON.stringify(recipes),
  };
}
