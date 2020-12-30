import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import { extension } from "mime-types";
import { GetPreSignedUploadUrlPayloadCodec } from "./codecs";

const S3 = new AWS.S3();

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const uuid = uuidv4();
  const parsedBody = JSON.parse(event.body ?? "{}");
  const getPreSignedUploadUrlPayload = GetPreSignedUploadUrlPayloadCodec.unsafeDecode(parsedBody);
  const ext = extension(getPreSignedUploadUrlPayload.contentType);

  const signedUrl = await S3.getSignedUrlPromise("putObject", {
    Bucket: "recipe-bank-raw-image-uploads",
    Key: `${uuid}.${ext}`,
    ContentType: "image/*",
    Expires: 300,
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      uuid: uuid,
      signedUrl,
    }),
  };
}
