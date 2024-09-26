import { db } from "@/server/db";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(_: NextApiRequest, res: NextApiResponse) {
  const count = await db.shortLink.count();
  return res.status(200).json({ count, message: "Hello from cron!" });
}
