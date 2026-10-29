import { GENERIC_BY_BODY, findMake, findModel, guessBody } from '../data/vehicles'
import type { CarSpecs, SpecKey, SpecSource } from '../types'

export const SPEC_LABELS: Record<SpecKey, string> = {
  bodyType: 'Body style',
  powertrain: 'Powertrain',
  engine: 'Engine',
  transmission: 'Transmission',
  drivetrain: 'Drivetrain',
  oilType: 'Oil type',
  oilCapacityL: 'Oil capacity',
  oilIntervalKm: 'Oil change interval',
  tireSize: 'Tire size',
  coolant: 'Coolant',
  sparkPlugKm: 'Spark plug interval',
  timingBelt: 'Timing belt',
  drivingStyle: 'Driving conditions',
  tireSetup: 'Tire setup',
  annualKm: 'Km per year',
}

export const SPEC_OPTIONS: Partial<Record<SpecKey, { value: string; label: string }[]>> = {
  bodyType: [
    { value: 'sedan', label: 'Sedan / coupe' },
    { value: 'hatchback', label: 'Hatchback / wagon' },
    { value: 'suv', label: 'SUV / crossover / van' },
    { value: 'truck', label: 'Pickup truck' },
  ],
  powertrain: [
    { value: 'gas', label: 'Gas' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'diesel', label: 'Diesel' },
    { value: 'ev', label: 'Electric' },
  ],
  transmission: [
    { value: 'automatic', label: 'Automatic' },
    { value: 'cvt', label: 'CVT' },
    { value: 'manual', label: 'Manual' },
    { value: 'single-speed', label: 'Single-speed (EV)' },
  ],
  drivetrain: [
    { value: 'fwd', label: 'Front-wheel drive' },
    { value: 'rwd', label: 'Rear-wheel drive' },
    { value: 'awd', label: 'All-wheel drive' },
    { value: '4wd', label: '4x4' },
  ],
  drivingStyle: [
    { value: 'normal', label: 'Normal (mostly highway, mild weather)' },
    { value: 'severe', label: 'Severe (short trips, winter, towing, dust)' },
  ],
  tireSetup: [
    { value: 'seasonal', label: 'Winter + summer sets' },
    { value: 'all-season', label: 'All-season year round' },
    { value: 'all-weather', label: 'All-weather year round' },
  ],
  timingBelt: [
    { value: 'false', label: 'Timing chain (no belt)' },
    { value: 'true', label: 'Timing belt' },
  ],
}

export const NUMERIC_SPECS: SpecKey[] = ['oilCapacityL', 'oilIntervalKm', 'sparkPlugKm', 'annualKm']

export function formatSpec(key: SpecKey, specs: CarSpecs): string {
  const v = specs[key]
  const opt = SPEC_OPTIONS[key]?.find((o) => o.value === String(v))
  if (opt) return opt.label
  if (key === 'oilCapacityL') return v ? `${v} L` : 'n/a'
  if (key === 'oilIntervalKm' || key === 'sparkPlugKm') return v ? `${Number(v).toLocaleString('en-CA')} km` : 'n/a'
  if (key === 'annualKm') return `${Number(v).toLocaleString('en-CA')} km`
  return String(v)
}

/**
 * Build the spec sheet for a car. Values the user entered win, then the bundled spec sheet for the
 * model, then brand defaults, then generic guesses by body style (marked 'assumed').
 */
export function resolveSpecs(
  make: string,
  model: string,
  given: Partial<CarSpecs> = {},
): { specs: CarSpecs; sources: Record<SpecKey, SpecSource> } {
  const mk = findMake(make)
  const md = findModel(make, model)
  const body = given.bodyType ?? md?.body ?? guessBody(model)
  const generic = GENERIC_BY_BODY[body]

  const fromSheet: Partial<CarSpecs> = {}
  if (md) {
    Object.assign(fromSheet, {
      bodyType: md.body,
      powertrain: md.powertrain ?? 'gas',
      engine: md.engine,
      transmission: md.transmission,
      drivetrain: md.drivetrain,
      oilType: md.oilType ?? mk?.oilType,
      oilCapacityL: md.oilCapacityL,
      oilIntervalKm: md.oilIntervalKm ?? mk?.oilIntervalKm,
      tireSize: md.tireSize,
      coolant: md.coolant ?? mk?.coolant,
      sparkPlugKm: md.sparkPlugKm,
      timingBelt: md.timingBelt ?? false,
    })
  }

  // Brand known but model not: brand fluids are a decent guess but still an assumption.
  const brandGuess: Partial<CarSpecs> = mk ? { oilType: mk.oilType, oilIntervalKm: mk.oilIntervalKm, coolant: mk.coolant } : {}
  const defaults: CarSpecs = {
    ...generic,
    ...brandGuess,
    drivingStyle: 'normal',
    tireSetup: 'seasonal',
    annualKm: 20000,
  }

  const specs = {} as CarSpecs
  const sources = {} as Record<SpecKey, SpecSource>
  for (const key of Object.keys(defaults) as SpecKey[]) {
    const g = given[key]
    const s = fromSheet[key]
    if (g !== undefined && g !== '') {
      ;(specs as unknown as Record<string, unknown>)[key] = g
      sources[key] = 'you'
    } else if (s !== undefined) {
      ;(specs as unknown as Record<string, unknown>)[key] = s
      sources[key] = 'spec'
    } else {
      ;(specs as unknown as Record<string, unknown>)[key] = defaults[key]
      sources[key] = 'assumed'
    }
  }

  // An EV picked by the user has no oil or plugs, regardless of the guessed values.
  if (specs.powertrain === 'ev') {
    specs.oilType = 'n/a'
    specs.oilCapacityL = 0
    specs.oilIntervalKm = 0
    specs.sparkPlugKm = 0
    specs.transmission = 'single-speed'
    specs.engine = specs.engine.includes('Electric') ? specs.engine : 'Electric motor'
    for (const k of ['oilType', 'oilCapacityL', 'oilIntervalKm', 'sparkPlugKm', 'transmission', 'engine'] as SpecKey[]) {
      if (sources[k] === 'assumed') sources[k] = 'spec'
    }
  }

  return { specs, sources }
}

/** Keys shown as "assumptions" on the maintenance screen, most impactful first. */
export const ASSUMPTION_ORDER: SpecKey[] = [
  'drivingStyle',
  'tireSetup',
  'annualKm',
  'powertrain',
  'bodyType',
  'drivetrain',
  'transmission',
  'oilType',
  'oilIntervalKm',
  'oilCapacityL',
  'tireSize',
  'engine',
  'coolant',
  'sparkPlugKm',
  'timingBelt',
]
