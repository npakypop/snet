import * as z from "zod";

export const ThreadValidation = z.object({
  thread: z
    .string()
    .nonempty()
    .min(4, { message: "Write more characters, ass" }),
  accountId: z.string(),
});

export const CommentValidation = z.object({
  thread: z
    .string()
    .nonempty()
    .min(4, { message: "Write more characters, ass" })
});
