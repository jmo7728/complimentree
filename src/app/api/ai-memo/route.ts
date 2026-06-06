import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      memo: null,
      error: 'No API key configured. Add ANTHROPIC_API_KEY to .env.local.',
    });
  }

  const { site, weights } = await req.json();

  try {
    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const client = new Anthropic({ apiKey });

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 400,
      system: `You write planting-priority justifications for a NYC municipal decision-support tool, for a city planner to paste into an internal memo. You receive a JSON record of a planting site with its data fields. Write a concise justification (max ~120 words) for why the site is or isn't a priority. ABSOLUTE RULE: you may only state numeric facts that appear as fields in the provided record. Never invent, estimate, infer, or round beyond the given values; if a fact is not in the record, do not claim it. Treat all figures as demo/illustrative. Use plain, non-technical language. End with one line: 'Sources: ' listing the exact field names you cited.`,
      messages: [
        {
          role: 'user',
          content: JSON.stringify({ site, currentWeights: weights }),
        },
      ],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    return NextResponse.json({ memo: text, error: null });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ memo: null, error: message });
  }
}
