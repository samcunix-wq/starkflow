import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  return NextResponse.json({
    holdings: [],
    purchasingPower: 5000,
    realizedPL: 0,
    totalValue: 5000
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    return NextResponse.json({
      success: true,
      message: 'Portfolio saved',
      data: body
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
