// Explicit route handler to ensure Vercel treats this as static
// This prevents Vercel from looking for a lambda function
import { NextResponse } from 'next/server';

export async function GET() {
  // This route is handled by the static page.tsx
  // Return a redirect or let Next.js handle it statically
  return NextResponse.next();
}

// Force static generation
export const dynamic = 'force-static';
export const runtime = 'nodejs';

