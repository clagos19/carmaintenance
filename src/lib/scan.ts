import Anthropic from '@anthropic-ai/sdk'
import { tasksFor } from '../data/tasks'
import type { Car } from '../types'
import { carName } from './format'

const KEY = 'carmaint:anthropic-key'

export function getApiKey() {
  try {
    return localStorage.getItem(KEY) ?? ''
  } catch {
    return ''
  }
}

export function setApiKey(key: string) {
  try {
    if (key) localStorage.setItem(KEY, key.trim())
    else localStorage.removeItem(KEY)
  } catch {
    /* storage unavailable */
  }
}

export interface ScanMatch {
  taskId: string
  confidence: 'high' | 'medium' | 'low'
  evidence: string
}

export interface ScanResult {
  isServiceDocument: boolean
  shop: string | null
  date: string | null
  odometerKm: number | null
  total: number | null
  summary: string
  performed: ScanMatch[]
  recommended: ScanMatch[]
}

/** Shrink a photo so uploads stay fast on mobile data and well under the API's image limits. */
export async function prepareImage(file: File, maxSide = 1600): Promise<{ data: string; preview: string }> {
  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image()
      i.onload = () => resolve(i)
      i.onerror = () => reject(new Error('That file could not be opened as an image.'))
      i.src = url
    })
    const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(img.naturalWidth * scale)
    canvas.height = Math.round(img.naturalHeight * scale)
    canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
    const preview = canvas.toDataURL('image/jpeg', 0.85)
    return { data: preview.split(',')[1], preview }
  } finally {
    URL.revokeObjectURL(url)
  }
}

function schema(taskIds: string[]) {
  const match = {
    type: 'object',
    additionalProperties: false,
    required: ['taskId', 'confidence', 'evidence'],
    properties: {
      taskId: { type: 'string', enum: taskIds },
      confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
      evidence: { type: 'string', description: 'The line or words on the document that support this match' },
    },
  }
  return {
    type: 'object',
    additionalProperties: false,
    required: ['isServiceDocument', 'shop', 'date', 'odometerKm', 'total', 'summary', 'performed', 'recommended'],
    properties: {
      isServiceDocument: { type: 'boolean' },
      shop: { type: ['string', 'null'] },
      date: { type: ['string', 'null'], description: 'Service date as YYYY-MM-DD' },
      odometerKm: { type: ['integer', 'null'], description: 'Odometer reading in km (convert from miles if needed)' },
      total: { type: ['number', 'null'], description: 'Total paid including tax' },
      summary: { type: 'string', description: 'One or two plain sentences on what was done' },
      performed: { type: 'array', items: match },
      recommended: { type: 'array', items: match },
    },
  }
}

export class ScanError extends Error {}

export async function scanReceipt(car: Car, imageBase64: string, apiKey: string): Promise<ScanResult> {
  const tasks = tasksFor(car.specs)
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
  const list = tasks.map((t) => `- ${t.id}: ${t.name}`).join('\n')

  let response
  try {
    response = await client.beta.messages.create({
      model: 'claude-opus-5-5',
      max_tokens: 16000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: { effort: 'low', format: { type: 'json_schema', schema: schema(tasks.map((t) => t.id)) } },
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: imageBase64 } },
            {
              type: 'text',
              text: `This is a photo of a receipt, work order, invoice or purchase summary for my ${carName(car)}.
Read it and tell me which of the maintenance jobs below it shows.

Maintenance jobs tracked for this car (use these ids):
${list}

Put a job in "performed" only if the document shows the work was done or the part was bought for this car. Topping up a fluid during an oil change counts as the matching check job, not a flush. Put jobs the shop recommended or flagged for later in "recommended". Leave out anything that does not match a tracked job.
If the photo is not a car service or parts document, set isServiceDocument to false and leave the lists empty. Use null for anything you cannot read.`,
            },
          ],
        },
      ],
    })
  } catch (e) {
    if (e instanceof Anthropic.AuthenticationError) throw new ScanError('The API key was not accepted. Check it in the scan settings.')
    if (e instanceof Anthropic.RateLimitError) throw new ScanError('Too many scans in a short time. Try again in a minute.')
    if (e instanceof Anthropic.APIConnectionError) throw new ScanError('Could not reach the AI service. Check your connection and try again.')
    if (e instanceof Anthropic.APIError) throw new ScanError(`The AI service returned an error (${e.status}). Try again.`)
    throw e
  }

  if (response.stop_reason === 'refusal') throw new ScanError('The AI declined to read this image. Try a clearer photo of the receipt.')
  const text = response.content.find((b) => b.type === 'text')
  if (!text || text.type !== 'text') throw new ScanError('No answer came back. Try again.')
  try {
    return JSON.parse(text.text) as ScanResult
  } catch {
    throw new ScanError('The answer could not be read. Try again.')
  }
}
