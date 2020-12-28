import { Codec, GetType, optional, string } from "purify-ts/Codec";

export const AddRecipePayloadCodec = Codec.interface({
  name: string,
  url: optional(string),
});

export type AddRecipePayload = GetType<typeof AddRecipePayloadCodec>;

export const RecipeCodec = Codec.interface({
  uuid: string,
  name: string,
  url: optional(string),
  username: string,
});

export type Recipe = GetType<typeof RecipeCodec>;
