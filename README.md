# Design Review App

A modern UI/UX design review application built with Next.js, React, Tailwind CSS, and Shadcn UI.

## Features

- 🔐 User authentication (Designers and Testers)
- 📱 Responsive design with Tailwind CSS
- 🎨 Modern UI components with Shadcn UI
- 🚀 Built with Next.js 15 and Turbopack
- 🔥 Real-time database with Supabase
- 📤 Image upload and rating system (coming soon)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (for authentication and database)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp env.example .env.local
   ```

4. Configure Supabase:
   - Create a new project at [supabase.com](https://supabase.com)
   - Get your project URL and anon key from Settings > API
   - Update `.env.local` with your credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Supabase Setup

### Database Tables

The app expects the following tables in your Supabase database:

#### Users Table
```sql
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  user_type TEXT CHECK (user_type IN ('designer', 'tester')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Designs Table
```sql
CREATE TABLE designs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  designer_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Ratings Table
```sql
CREATE TABLE ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  design_id UUID REFERENCES designs(id) ON DELETE CASCADE,
  tester_id UUID REFERENCES users(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(design_id, tester_id)
);
```

### Row Level Security (RLS)

Enable RLS on all tables and create appropriate policies for security.

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
design-review-app/
├── app/                 # Next.js app directory
│   ├── login/          # Login page
│   ├── register/       # Registration page
│   ├── dashboard/      # Dashboard page
│   └── test/           # Test page
├── components/         # Reusable components
│   └── ui/            # Shadcn UI components
├── lib/               # Utility functions
│   ├── auth.ts        # Authentication utilities
│   ├── supabase.ts    # Supabase client
│   └── designs.ts     # Design management utilities
└── public/            # Static assets
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
