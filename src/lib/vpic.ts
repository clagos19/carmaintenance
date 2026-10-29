import type { CarSpecs, Drivetrain } from '../types'

// NHTSA's free vehicle database (vPIC). Used to widen the model list and decode VINs.
const BASE = 'https://vpic.nhtsa.dot.gov/api/vehicles'

async function getJson(url: string, ms = 6000) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), ms)
  try {
    const res = await fetch(url, { signal: ctrl.signal })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } finally {
    clearTimeout(timer)
  }
}

export async function fetchModels(make: string): Promise<string[]> {
  try {
    const data = await getJson(`${BASE}/GetModelsForMake/${encodeURIComponent(make)}?format=json`)
    const names: string[] = (data.Results ?? []).map((r: { Model_Name: string }) => r.Model_Name.trim())
    return [...new Set(names)].sort((a, b) => a.localeCompare(b))
  } catch {
    return []
  }
}

export interface VinResult {
  make?: string
  model?: string
  year?: number
  specs: Partial<CarSpecs>
}

export async function decodeVin(vin: string): Promise<VinResult | null> {
  try {
    const data = await getJson(`${BASE}/DecodeVinValues/${encodeURIComponent(vin.trim())}?format=json`)
    const r = data.Results?.[0]
    if (!r || !r.Make) return null
    const specs: Partial<CarSpecs> = {}
    const body = String(r.BodyClass || '').toLowerCase()
    if (body.includes('pickup')) specs.bodyType = 'truck'
    else if (/(sport utility|crossover|van|minivan)/.test(body)) specs.bodyType = 'suv'
    else if (/(hatchback|wagon)/.test(body)) specs.bodyType = 'hatchback'
    else if (/(sedan|coupe|convertible)/.test(body)) specs.bodyType = 'sedan'

    const fuel = String(r.FuelTypePrimary || '').toLowerCase()
    const elec = String(r.ElectrificationLevel || '').toLowerCase()
    if (fuel.includes('electric') && !fuel.includes('gasoline')) specs.powertrain = 'ev'
    else if (elec.includes('hybrid') || elec.includes('hev')) specs.powertrain = 'hybrid'
    else if (fuel.includes('diesel')) specs.powertrain = 'diesel'
    else if (fuel) specs.powertrain = 'gas'

    const disp = parseFloat(r.DisplacementL)
    const cyl = parseInt(r.EngineCylinders, 10)
    if (disp && cyl) specs.engine = `${disp.toFixed(1)}L ${cyl}-cyl${r.Turbo === 'Yes' ? ' turbo' : ''}`

    const drive = String(r.DriveType || '').toLowerCase()
    const dt: Drivetrain | undefined = drive.includes('4x4') || drive.includes('4wd')
      ? '4wd'
      : drive.includes('awd') || drive.includes('all')
        ? 'awd'
        : drive.includes('rwd') || drive.includes('rear')
          ? 'rwd'
          : drive.includes('fwd') || drive.includes('front')
            ? 'fwd'
            : undefined
    if (dt) specs.drivetrain = dt

    const trans = String(r.TransmissionStyle || '').toLowerCase()
    if (trans.includes('cvt') || trans.includes('continuously')) specs.transmission = 'cvt'
    else if (trans.includes('manual')) specs.transmission = 'manual'
    else if (trans.includes('automatic')) specs.transmission = 'automatic'

    const title = (s: string) => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
    return { make: title(r.Make), model: r.Model || undefined, year: parseInt(r.ModelYear, 10) || undefined, specs }
  } catch {
    return null
  }
}
