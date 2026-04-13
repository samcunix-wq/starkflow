import { NextResponse } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = 'llama-3.3-70b-versatile';

const SYSTEM_PROMPT = `You are JARVIS, an intelligent AI financial advisor for StarkFlow.

## CRITICAL RULES:
1. ALWAYS use the data provided in your responses - NEVER make up numbers
2. If data is provided, cite it exactly as given
3. Remember conversation context - don't reintroduce yourself
4. Ask clarifying questions to understand user goals better
5. When users mention goals or wanting to add positions, acknowledge and ask for confirmation

## Your Persona:
- Friendly, conversational, helpful
- Use data-driven insights (never hallucinate numbers)
- Ask follow-up questions to understand goals
- Reference previous conversation when relevant
- Be PROACTIVE - when users ask about dividends, income, or calculations, automatically fetch and use the provided data

## Market Data Available:
- Stock prices, P/E ratios, dividend yields
- Portfolio holdings with cost basis and current value
- Total P/L (realized and unrealized)
- Purchasing power available for new trades

## User Context:
- Purchasing power (cash available): {purchasing_power}
- Total portfolio value: {total_value}
- Holdings: {holdings_summary}`;

export async function POST(request: Request) {
  try {
    const { messages, userContext } = await request.json();
    
    if (!GROQ_API_KEY) {
      return NextResponse.json({ error: 'AI service not configured' }, { status: 500 });
    }

    const portfolioContext = userContext ? `
User's Portfolio:
- Purchasing Power: $${userContext.purchasingPower?.toLocaleString() || 0}
- Total Holdings Value: $${userContext.holdingsValue?.toLocaleString() || 0}
- Realized P/L: $${userContext.realizedPL?.toLocaleString() || 0}
${userContext.holdings?.map((h: any) => `- ${h.ticker}: ${h.shares} shares @ $${h.avgCost} avg (current: $${h.currentPrice})`).join('\n') || 'No holdings'}
` : 'User has not shared their portfolio yet.';

    const prompt = SYSTEM_PROMPT
      .replace('{purchasing_power}', `$${(userContext?.purchasingPower || 0).toLocaleString()}`)
      .replace('{total_value}', `$${((userContext?.holdingsValue || 0) + (userContext?.purchasingPower || 0)).toLocaleString()}`)
      .replace('{holdings_summary}', userContext?.holdings?.length ? userContext.holdings.map((h: any) => `${h.shares} ${h.ticker}`).join(', ') : 'None');

    const conversationHistory = messages.map((m: any) => ({
      role: m.role,
      content: m.content
    }));

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: prompt },
          ...conversationHistory
        ],
        temperature: 0.7,
        max_tokens: 1024
      })
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ error: 'AI service error: ' + error }, { status: 500 });
    }

    const data = await response.json();
    const assistantMessage = data.choices[0]?.message?.content || 'I apologize, but I encountered an issue processing your request.';

    return NextResponse.json({ message: assistantMessage });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
