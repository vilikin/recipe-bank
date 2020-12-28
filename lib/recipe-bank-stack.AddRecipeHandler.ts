import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as AWS from "aws-sdk";
import { Recipe, RecipeCodec } from "./codecs";

const DynamoDB = new AWS.DynamoDB();

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const parsedBody = JSON.parse(event.body ?? "{}");
  const recipe: Recipe = RecipeCodec.unsafeDecode(parsedBody);

  await DynamoDB.putItem({
    TableName: "recipes",
    Item: {
      uuid: { S: recipe.uuid },
      name: { S: recipe.name },
      url: { S: recipe.url },
    },
  }).promise();

  return {
    statusCode: 200,
    body: JSON.stringify(recipe),
  };
}
