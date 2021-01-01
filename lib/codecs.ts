import { array, Codec, GetType, number, optional, string } from "purify-ts/Codec";

export const AddRecipePayloadCodec = Codec.interface({
  name: string,
  url: optional(string),
  imageUuid: optional(string),
});

export type AddRecipePayload = GetType<typeof AddRecipePayloadCodec>;

export const RecipeCodec = Codec.interface({
  uuid: string,
  name: string,
  url: optional(string),
  username: string,
  images: array(
    Codec.interface({
      size: string,
      url: string,
    })
  ),
});

export type Recipe = GetType<typeof RecipeCodec>;

export const GetPreSignedUploadUrlPayloadCodec = Codec.interface({
  contentType: string,
});

export type GetPreSignedUploadUrlPayload = GetType<typeof GetPreSignedUploadUrlPayloadCodec>;
