import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as AWS from "aws-sdk";
import { BUCKET_FOR_RESIZED_IMAGES } from "../constants";
import { ResizeSpec, resizeSpecs, stringifySize } from "./common/resizeSpecs";

const DynamoDB = new AWS.DynamoDB();
const S3 = new AWS.S3();

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
      username: item.username.S!,
      imageUuid: item.imageUuid?.S,
    })) ?? [];

  const recipesWithImages = await Promise.all(
    recipes.map(async (recipe) => {
      if (!recipe.imageUuid) {
        return {
          ...recipe,
          images: [],
        };
      }

      const images = await Promise.all(
        resizeSpecs.map(async (resizeSpec) => {
          const signedUrl = await getSignedImageUrl(recipe.imageUuid!, resizeSpec);
          return {
            size: stringifySize(resizeSpec),
            url: signedUrl,
          };
        })
      );

      return {
        ...recipe,
        images,
      };
    })
  );

  return {
    statusCode: 200,
    body: JSON.stringify(recipesWithImages),
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  };
}

async function getSignedImageUrl(imageUuid: string, resizeSpec: ResizeSpec): Promise<string> {
  return await S3.getSignedUrlPromise("getObject", {
    Bucket: BUCKET_FOR_RESIZED_IMAGES,
    Key: `${stringifySize(resizeSpec)}/${imageUuid}.png`,
    Expires: 86400, // 24 hours
  });
}
