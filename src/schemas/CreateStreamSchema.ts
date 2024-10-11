import {z} from "zod";

export const CreateStreamSchema=z.object({
  creatorId:z.string(),
  url:z.string()
})