import { z } from "zod";

export const UpvoteSchema=z.object({
  StreamId:z.string()
})