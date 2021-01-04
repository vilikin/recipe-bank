import { S3CreateEvent, S3EventRecord } from "aws-lambda";
import sharp from "sharp";
import * as AWS from "aws-sdk";
import { BUCKET_FOR_RESIZED_IMAGES, BUCKET_FOR_RAW_UPLOADED_IMAGES } from "../constants";
import { ResizeSpec, resizeSpecs, stringifySize } from "./common/resizeSpecs";

const S3 = new AWS.S3();

export async function handler(event: S3CreateEvent): Promise<void> {
  await Promise.all(event.Records.map(processRecord));
}

async function processRecord(record: S3EventRecord): Promise<void> {
  console.log(`Starting to process record for key ${record.s3.object.key}`);

  const uuid = extractUuidFromRecord(record);
  const originalImageBuffer = await getImageBufferFromRecord(record);

  await Promise.all(
    resizeSpecs.map(async (resizeSpec) => {
      console.log(`Resizing image to ${stringifySize(resizeSpec)} size`);

      const resizedImageBuffer = await resizeImageBuffer(originalImageBuffer, resizeSpec);

      await uploadResizedImageToS3(resizedImageBuffer, uuid, resizeSpec);
    })
  );

  await deleteOriginalImageFromS3(record);
}

function extractUuidFromRecord(record: S3EventRecord): string {
  const { key } = record.s3.object;
  const regex = /(.+?)(\.[^.]*$|$)/;
  const fileNameWithoutExtension = key.match(regex)?.[1];

  if (!fileNameWithoutExtension) {
    throw new Error("Couldn't extract filename without extension from record");
  }

  return fileNameWithoutExtension;
}

async function getImageBufferFromRecord(record: S3EventRecord): Promise<Buffer> {
  const { bucket, object } = record.s3;

  console.log(`Getting raw image with key ${object.key} from S3`);

  const response = await S3.getObject({
    Bucket: bucket.name,
    Key: object.key,
  }).promise();

  if (!response.Body) {
    throw new Error("No content");
  }

  return response.Body as Buffer;
}

async function resizeImageBuffer(image: Buffer, resizeSpec: ResizeSpec): Promise<Buffer> {
  return sharp(image)
    .resize({
      width: resizeSpec.width,
      height: resizeSpec.height,
    })
    .toFormat("png")
    .toBuffer();
}

async function uploadResizedImageToS3(
  image: Buffer,
  uuid: string,
  resizeSpec: ResizeSpec
): Promise<void> {
  console.log(`Uploading ${stringifySize(resizeSpec)} size image with uuid ${uuid}`);

  await S3.putObject({
    Bucket: BUCKET_FOR_RESIZED_IMAGES,
    Key: `${stringifySize(resizeSpec)}/${uuid}.png`,
    Body: image,
  }).promise();

  console.log(`Successfully uploaded ${stringifySize(resizeSpec)} size image with uuid ${uuid}`);
}

async function deleteOriginalImageFromS3(record: S3EventRecord): Promise<void> {
  const { key } = record.s3.object;
  console.log(`Deleting raw image ${key}`);

  await S3.deleteObject({
    Bucket: BUCKET_FOR_RAW_UPLOADED_IMAGES,
    Key: key,
  }).promise();

  console.log(`Successfully deleted raw image ${key}`);
}
