import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { env } from "@/env";

export const linkRouter = createTRPCRouter({
  slugCheck: publicProcedure
    .input(
      z.object({
        slug: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const link = await ctx.db.shortLink.findUnique({
        where: {
          slug: input.slug,
        },
      });

      return { isAvailable: !link };
    }),

  createSlug: publicProcedure
    .input(
      z.object({
        slug: z.string(),
        url: z.string(),
        password: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.password !== env.PASSWORD) {
        throw new Error("Invalid password");
      }
      await ctx.db.shortLink.create({
        data: {
          slug: input.slug,
          url: input.url,
        },
      });
    }),
});
