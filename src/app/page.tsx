import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EntryGrid } from "@/components/entry-grid";
import { EntryForm } from "@/components/entry-form";
import { db } from "@/lib/db";
import { PlusCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

// Define MediaType enum to match component's expected format
enum MediaType {
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
}

type PrismaEntry = {
  id: string;
  term: string;
  description: string | null;
  mediaUrl: string;
  mediaType: string | MediaType;
  votes: { id: string; value: number }[];
  tags: { id: string; name: string }[];
  [key: string]: unknown;
};

async function getEntries(searchQuery?: string | string[]) {
  try {
    // Convert string array to string if needed
    const searchTerm = Array.isArray(searchQuery)
      ? searchQuery[0]
      : searchQuery;

    // If there's a search query, filter entries by term
    if (searchTerm) {
      const entries = await db.entry.findMany({
        where: {
          term: {
            contains: searchTerm,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          votes: true,
          tags: true,
        },
      });
      return entries;
    }

    // Otherwise, return all entries
    const entries = await db.entry.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        votes: true,
        tags: true,
      },
    });
    return entries;
  } catch (error) {
    console.error("Error fetching entries:", error);
    return [];
  }
}

export default async function Home({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  // Await searchParams before accessing its properties
  const params = await searchParams;
  const search = params?.search || "";
  const tab = params?.tab || "browse";

  // Pass the search parameter to getEntries
  const prismaEntries = await getEntries(search);

  // Map Prisma entries to component's expected format
  const entries = prismaEntries.map((entry: PrismaEntry) => ({
    ...entry,
    mediaType: entry.mediaType as unknown as MediaType,
  }));

  return (
    <main className="container mx-auto py-6 px-4 md:px-6">
      <header className="mb-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">
              Visual Slang Dictionary
            </h1>
            <p className="text-muted-foreground">
              Define slang with images and videos instead of text
            </p>
          </div>
          <div className="flex items-center gap-2">
            <form className="flex-1 md:w-[300px]" action="/" method="get">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  name="search"
                  placeholder="Search for slang..."
                  className="w-full bg-background pl-8"
                  defaultValue={search}
                />
                {/* Preserve the tab parameter when searching */}
                {tab && (
                  <input
                    type="hidden"
                    name="tab"
                    value={typeof tab === "string" ? tab : tab[0] || "browse"}
                  />
                )}
              </div>
            </form>
          </div>
        </div>
      </header>

      <Tabs
        defaultValue={typeof tab === "string" ? tab : tab[0] || "browse"}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="browse" asChild>
              <Link
                href={`?tab=browse${
                  search
                    ? `&search=${encodeURIComponent(
                        typeof search === "string" ? search : search[0] || ""
                      )}`
                    : ""
                }`}
              >
                Browse
              </Link>
            </TabsTrigger>
            <TabsTrigger value="add" asChild>
              <Link
                href={`?tab=add${
                  search
                    ? `&search=${encodeURIComponent(
                        typeof search === "string" ? search : search[0] || ""
                      )}`
                    : ""
                }`}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New
              </Link>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="browse" className="space-y-8">
          <div className="py-6">
            {entries.length > 0 ? (
              <EntryGrid entries={entries} />
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  {search
                    ? `No entries found for "${search}"`
                    : "No entries found"}
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="add" className="max-w-3xl mx-auto">
          <div className="py-6">
            <EntryForm userId="anonymous" />
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
