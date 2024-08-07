import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/server/db";

export type ResponseData =
  | {
      error: false;
      url: string;
      slug: string;
    }
  | {
      error: true;
      message: string;
    };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
) {
  if (req.method === "GET") {
    const slug = req.query.slug as string;

    if (!slug || typeof slug !== "string") {
      res.statusCode = 404;

      return res.json({ message: "pls use with a slug", error: true });
    }

    const data = await db.shortLink.findFirst({
      where: {
        slug: {
          equals: slug,
        },
      },
      select: {
        url: true,
        slug: true,
      },
    });

    if (!data) {
      res.statusCode = 404;

      return res.json({ message: "slug not found", error: true });
    }

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Cache-Control",
      "s-maxage=1000000000, stale-while-revalidate",
    );

    return res.json({ ...data, error: false });
  }
}
