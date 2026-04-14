import { NextResponse } from 'next/server';

export async function GET() {
  try {
    if (typeof window === 'undefined') {
      return NextResponse.json({ holdings: [] });
    }
    
    const stored = localStorage.getItem('starkflow_holdings');
    const userHoldings = stored ? JSON.parse(stored) : [];
    
    return NextResponse.json({ holdings: userHoldings });
  } catch (err) {
    console.error('Error fetching user holdings:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ holdings: [], error: errorMessage }, { status: 500 });
  }
}