"use server";
import { PrismaClient } from "@prisma/client";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // Auth logic is moved to a separate file

const prisma = new PrismaClient();

export async function blacklistInfo() {
  const session = await getServerSession(authOptions);
  const userid = Number(session?.user.id);
  try {
    const blacklist = await prisma.blacklist_visitors.findMany({
      include: {
        visitiors: true,
      },
    });
    return blacklist;
  } catch (error) {
    return error;
  }
}

export async function getblacklistInfo(vid: number) {
  const session = await getServerSession(authOptions);
  const userid = Number(session?.user.id);
  try {
    const blacklist = await prisma.blacklist_visitors.findUnique({
      where: {
        visitor_id: Number(vid),
      },
      include: {
        visitiors: true,
      },
    });
    return blacklist || null; // Return null if not found
  } catch (error) {
    return error;
  }
}
