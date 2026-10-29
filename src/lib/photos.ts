import Anthropic from '@anthropic-ai/sdk'
import { SPOTS } from '../art/CarArt'
import type { Car, ViewId } from '../types'
import { carName } from './format'

// ---------------------------------------------------------------- AI placement of the dots

const PART_HINTS: Record<ViewId, Record<string, string>> = {
  side: {
    wheelFront: 'centre of the front wheel',
    brakes: 'brake disc or caliper visible through the front wheel spokes',
    tireRear: 'bottom of the rear tire tread, where it meets the ground',
    wheelRear: 'centre of the rear wheel',
    suspension: 'top of the rear wheel arch',
    diff: 'underbody just ahead of the rear axle',
    rocker: 'rocker panel below the doors, midway between the wheels',
  },
  top: {
    headlights: 'a front headlight',
    wipers: 'wiper blades at the base of the windshield',
    cabin: 'passenger side of the windshield base (cabin air intake)',
    wheelFL: 'front left wheel',
    wheelFR: 'front right wheel',
  },
  engine: {
    oilcap: 'engine oil filler cap (often yellow, on top of the engine)',
    coolant: 'coolant reservoir / overflow tank (translucent plastic tank)',
    radiator: 'radiator or front grille area at the front of the bay',
    airbox: 'air filter box (black plastic box with the intake tube)',
    brakefluid: 'brake fluid reservoir (small tank near the windshield on the driver side)',
    battery: '12V battery',
    plugs: 'ignition coils or spark plug area on top of the engine',
    belt: 'serpentine drive belt and pulleys',
    trans: 'transmission dipstick or transmission area',
    timing: 'timing cover at the end of the engine',
    washer: 'windshield washer fluid cap (blue cap with a windshield symbol)',
  },
}

export interface Located {
  spots: Record<string, { x: number; y: number }>
  missing: string[]
}

export async function locateParts(car: Car, view: ViewId, imageBase64: string, apiKey: string): Promise<Located> {
  const keys = Object.keys(SPOTS[view])
  const point = {
    type: 'object',
    additionalProperties: false,
    required: ['visible', 'x', 'y'],
    properties: {
      visible: { type: 'boolean' },
      x: { type: ['number', 'null'], description: 'Percent from the left edge, 0 to 100' },
      y: { type: ['number', 'null'], description: 'Percent from the top edge, 0 to 100' },
    },
  }
  const schema = {
    type: 'object',
    additionalProperties: false,
    required: keys,
    properties: Object.fromEntries(keys.map((k) => [k, point])),
  }
  const list = keys.map((k) => `- ${k}: ${PART_HINTS[view][k]}`).join('\n')
  const what = view === 'engine' ? 'the engine bay with the hood open' : view === 'top' ? 'the car seen from above' : 'the side of the car'

  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
  const res = await client.beta.messages.create({
    model: 'claude-opus-5-5',
    max_tokens: 16000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort: 'medium', format: { type: 'json_schema', schema } },
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: imageBase64 } },
          {
            type: 'text',
            text: `This photo shows ${what} of my ${carName(car)}. I want to put a marker on each of these parts:
${list}

For each part, give the position of its centre as a percentage of the image width (x, from the left) and height (y, from the top). If a part can't be seen, set visible to false and x and y to null. Be precise: the marker should sit on the part itself.`,
          },
        ],
      },
    ],
  })
  if (res.stop_reason === 'refusal') throw new Error('The AI declined to read this photo.')
  const text = res.content.find((b) => b.type === 'text')
  if (!text || text.type !== 'text') throw new Error('No answer came back.')
  const out = JSON.parse(text.text) as Record<string, { visible: boolean; x: number | null; y: number | null }>
  const spots: Located['spots'] = {}
  const missing: string[] = []
  for (const k of keys) {
    const p = out[k]
    if (p?.visible && p.x !== null && p.y !== null) spots[k] = { x: Math.max(2, Math.min(98, p.x)), y: Math.max(2, Math.min(98, p.y)) }
    else missing.push(k)
  }
  return { spots, missing }
}
