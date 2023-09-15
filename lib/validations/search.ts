import * as z from "zod";

export const SearchValidation = z.object({
  search: z.string().nonempty(),
});
