import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import { extension } from "mime-types";
import { GetPreSignedUploadUrlPayloadCodec } from "./common/codecs";
import { BUCKET_FOR_RAW_UPLOADED_IMAGES } from "../constants";

const S3 = new AWS.S3();

const allowedContentTypes = ["image/png", "image/jpeg"];

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const uuid = uuidv4();
  const parsedBody = JSON.parse(event.body ?? "{}");
  const { contentType } = GetPreSignedUploadUrlPayloadCodec.unsafeDecode(parsedBody);

  if (!allowedContentTypes.includes(contentType)) {
    throw new Error(
      `Content type ${contentType} not allowed. Must be one of ${allowedContentTypes.join(", ")}.`
    );
  }

  const ext = extension(contentType);

  const signedUrl = await S3.getSignedUrlPromise("putObject", {
    Bucket: BUCKET_FOR_RAW_UPLOADED_IMAGES,
    Key: `${uuid}.${ext}`,
    ContentType: contentType,
    Expires: 300,
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      uuid: uuid,
      signedUrl,
    }),
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  };
}
