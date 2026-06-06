import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      rationale: 'AI features require ANTHROPIC_API_KEY in .env.local.',
      adjustedWeights: null,
      highlightedSiteIds: [],
      appliedFiltersDescription: '',
    });
  }

  const { query, weights, sites } = await req.json();

  try {
    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const client = new Anthropic({ apiKey });

    const siteSummary = sites.slice(0, 39).map((s: {
      site_id: string;
      address: string;
      neighborhood: string;
      borough: string;
      near_sensitive_site: string;
      site_status: string;
      heat_vulnerability_index: number;
      area_canopy_pct: number;
      last_nearby_planting_year: number;
    }) => ({
      id: s.site_id,
      address: s.address,
      neighborhood: s.neighborhood,
      borough: s.borough,
      near_sensitive_site: s.near_sensitive_site,
      site_status: s.site_status,
      hvi: s.heat_vulnerability_index,
      canopy_pct: s.area_canopy_pct,
      last_planting: s.last_nearby_planting_year,
    }));

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
      system: `You are a planning assistant for a NYC tree-planting prioritization tool. Convert natural-language planning goals into structured filter and weight adjustments. Return JSON only, no prose. Schema: { rationale: string, adjustedWeights?: { heat, gap, equity, exposure } (all 0–1, must sum close to 1.0), highlightedSiteIds?: string[], appliedFiltersDescription: string }`,
      messages: [
        {
          role: 'user',
          content: JSON.stringify({
            query,
            currentWeights: weights,
            availableSites: siteSummary,
          }),
        },
      ],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '{}';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');
    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({
      rationale: `Error: ${message}`,
      adjustedWeights: null,
      highlightedSiteIds: [],
      appliedFiltersDescription: '',
    });
  }
}
