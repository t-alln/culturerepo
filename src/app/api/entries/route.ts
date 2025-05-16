import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as z from "zod";

const entrySchema = z.object({
  term: z.string().min(1),
  description: z.string().optional(),
  mediaUrl: z.string().min(1),
  mediaType: z.enum(["IMAGE", "VIDEO"]),
  userId: z.string().optional(),
  awsMediaId: z.string().optional(),
  moderationData: z
    .object({
      status: z.string().optional(),
      confidence: z.string().optional(),
      feedback: z.string().optional(),
    })
    .optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      term,
      description,
      mediaUrl,
      mediaType,
      userId,
      awsMediaId,
      moderationData,
    } = entrySchema.parse(body);

    // Check if the specified user exists, or create a default user
    let userToUse: string;

    if (userId) {
      const existingUser = await db.user.findUnique({
        where: { id: userId },
      });

      if (existingUser) {
        userToUse = existingUser.id;
      } else {
        // User doesn't exist, create a default one
        const defaultUser = await db.user.create({
          data: {
            email: `user_${Date.now()}@example.com`,
            name: "Anonymous User",
          },
        });
        userToUse = defaultUser.id;
      }
    } else {
      // No userId provided, create a default user
      // Try to find a default user first
      let defaultUser = await db.user.findFirst({
        where: {
          name: "Anonymous User",
        },
      });

      // If no default user exists, create one
      if (!defaultUser) {
        defaultUser = await db.user.create({
          data: {
            email: `urly@pm.me`,
            name: "Anonymous User",
          },
        });
      }
      userToUse = defaultUser.id;
    }

    // Create the entry with nested moderation record
    const entry = await db.entry.create({
      data: {
        term,
        description,
        mediaUrl,
        mediaType,
        awsMediaId,
        userId: userToUse,
        // Add moderation relation
        moderation: moderationData
          ? {
              create: {
                status:
                  moderationData.status === "REJECTED"
                    ? "REJECTED"
                    : moderationData.status === "FLAGGED"
                    ? "FLAGGED"
                    : moderationData.status === "APPROVED"
                    ? "APPROVED"
                    : "PENDING",
                confidence:
                  moderationData.confidence === "HIGH"
                    ? "HIGH"
                    : moderationData.confidence === "LOW"
                    ? "LOW"
                    : "MEDIUM",
                feedback: moderationData.feedback,
              },
            }
          : undefined,
      },
      include: {
        moderation: true,
        tags: true,
        votes: true,
      },
    });

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    console.error("Error creating entry:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const term = url.searchParams.get("term");

    let entries;

    if (term) {
      entries = await db.entry.findMany({
        where: {
          term: {
            contains: term,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          votes: true,
          tags: true,
          moderation: true,
        },
      });
    } else {
      entries = await db.entry.findMany({
        orderBy: {
          createdAt: "desc",
        },
        include: {
          votes: true,
          tags: true,
          moderation: true,
        },
      });
    }

    return NextResponse.json({ entries });
  } catch (error) {
    console.error("Error fetching entries:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
