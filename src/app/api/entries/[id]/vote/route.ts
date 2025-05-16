import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as z from "zod";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";

const voteSchema = z.object({
  value: z.union([
    z.literal(1),
    z.literal(-1),
    z.literal("1").transform(() => 1),
    z.literal("-1").transform(() => -1),
  ]),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Find the entry
    const entry = await db.entry.findUnique({
      where: { id },
    });

    if (!entry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    const body = await request.json();
    const { value } = voteSchema.parse(body);

    // Generate a consistent ID based on client IP address or use a default
    // Using IP as fallback for cookie in server-side
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0] : "unknown";
    const uniqueId = `anon-${ip.replace(/\./g, "-")}`;

    // Use IP-based ID as our user ID
    const userId = uniqueId;

    // Check if user has already voted
    const existingVote = await db.vote.findUnique({
      where: {
        userId_entryId: {
          userId,
          entryId: id,
        },
      },
    });

    if (existingVote) {
      // Update existing vote
      const updated = await db.vote.update({
        where: {
          id: existingVote.id,
        },
        data: {
          value,
        },
      });

      return NextResponse.json({ vote: updated });
    }

    // First check if the user exists in the database
    let user = await db.user.findUnique({
      where: { id: userId },
    });

    // If not, create a new anonymous user
    if (!user) {
      user = await db.user.create({
        data: {
          id: userId,
          name: "Anonymous User",
          email: `${userId}@example.com`, // Required by schema but never used
        },
      });
    }

    // Create new vote
    const vote = await db.vote.create({
      data: {
        value,
        userId,
        entryId: id,
      },
    });

    return NextResponse.json({ vote });
  } catch (error) {
    console.error("Error voting on entry:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
