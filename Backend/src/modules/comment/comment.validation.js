import { z } from "zod";

export const addCommentSchema = z.object({
    message: z
        .string()
        .min(2, "Comment must be at least 2 characters"),
});