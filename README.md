# Visual Slang Dictionary

A modern take on Urban Dictionary where users define slang terms with images and videos instead of text.

## Features

- Image and video uploads for defining slang terms
- Browse visual definitions in a responsive grid layout
- Upvote/downvote system for community curation
- Search functionality
- Tag-based categorization
- Clean, modern UI using Tailwind CSS and Shadcn UI

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: Shadcn UI
- **Database**: Prisma with SQLite (easily upgradable to PostgreSQL)
- **Media Storage**: UploadThing
- **Form Handling**: React Hook Form with Zod validation

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/visual-slang-dictionary.git
cd visual-slang-dictionary
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Setup your .env file:

```
# Example .env
DATABASE_URL="file:./dev.db"
UPLOADTHING_SECRET=your_uploadthing_secret
UPLOADTHING_APP_ID=your_uploadthing_app_id
```

4. Initialize the database:

```bash
npx prisma generate
npx prisma db push
```

5. Run the development server:

```bash
npm run dev
# or
yarn dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
  ├── app/                 # App Router
  │   ├── api/             # API Routes
  │   │   ├── entries/     # Entry CRUD and voting
  │   │   └── uploadthing/ # File uploads
  │   └── page.tsx         # Home page
  ├── components/          # UI Components
  │   ├── ui/              # Shadcn UI components
  │   ├── entry-card.tsx   # Card for displaying entries
  │   ├── entry-form.tsx   # Form for creating entries
  │   ├── entry-grid.tsx   # Grid for displaying entries
  │   └── upload-button.tsx # Media upload component
  ├── lib/                 # Utility functions
  │   └── db.ts            # Prisma client
  └── generated/           # Generated code
      └── prisma/          # Prisma client
```

## Future Enhancements

- User authentication
- Comments on entries
- Trending/Popular entries
- Advanced filtering and sorting
- Mobile app using React Native

## License

This project is licensed under the MIT License.
