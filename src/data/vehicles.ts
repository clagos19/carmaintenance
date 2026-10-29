import type { BodyType, CarSpecs, Drivetrain, Powertrain, Transmission } from '../types'

/**
 * Bundled spec sheet for popular models sold in Canada.
 * Values are typical for recent model years and are meant as a starting point:
 * the app shows them as "From spec sheet" so they can be checked against the owner's manual.
 */
export interface ModelSpec {
  name: string
  body: BodyType
  powertrain?: Powertrain
  engine: string
  transmission: Transmission
  drivetrain: Drivetrain
  oilType?: string
  oilCapacityL?: number
  oilIntervalKm?: number
  tireSize: string
  coolant?: string
  sparkPlugKm?: number
  timingBelt?: boolean
}

export interface MakeSpec {
  name: string
  /** Default oil spec and change interval for the brand */
  oilType: string
  oilIntervalKm: number
  coolant: string
  models: ModelSpec[]
}

const ev = (name: string, body: BodyType, drivetrain: Drivetrain, tireSize: string): ModelSpec => ({
  name,
  body,
  powertrain: 'ev',
  engine: 'Electric motor',
  transmission: 'single-speed',
  drivetrain,
  oilType: 'n/a',
  oilCapacityL: 0,
  oilIntervalKm: 0,
  tireSize,
  sparkPlugKm: 0,
})

export const MAKES: MakeSpec[] = [
  {
    name: 'Toyota', oilType: '0W-16 synthetic', oilIntervalKm: 8000, coolant: 'Toyota Super Long Life (pink)',
    models: [
      { name: 'Corolla', body: 'sedan', engine: '2.0L 4-cyl', transmission: 'cvt', drivetrain: 'fwd', oilType: '0W-16 synthetic', oilCapacityL: 4.2, tireSize: '205/55R16', sparkPlugKm: 190000 },
      { name: 'Camry', body: 'sedan', engine: '2.5L 4-cyl', transmission: 'automatic', drivetrain: 'fwd', oilCapacityL: 4.8, tireSize: '235/45R18', sparkPlugKm: 190000 },
      { name: 'RAV4', body: 'suv', engine: '2.5L 4-cyl', transmission: 'automatic', drivetrain: 'awd', oilType: '0W-16 synthetic', oilCapacityL: 4.8, tireSize: '225/65R17', sparkPlugKm: 190000 },
      { name: 'RAV4 Hybrid', body: 'suv', powertrain: 'hybrid', engine: '2.5L 4-cyl hybrid', transmission: 'cvt', drivetrain: 'awd', oilCapacityL: 4.5, tireSize: '225/60R18', sparkPlugKm: 190000 },
      { name: 'Highlander', body: 'suv', engine: '2.4L turbo 4-cyl', transmission: 'automatic', drivetrain: 'awd', oilType: '0W-20 synthetic', oilCapacityL: 5.7, tireSize: '235/55R20', sparkPlugKm: 190000 },
      { name: 'Tacoma', body: 'truck', engine: '2.4L turbo 4-cyl', transmission: 'automatic', drivetrain: '4wd', oilType: '0W-20 synthetic', oilCapacityL: 5.7, tireSize: '265/70R17', sparkPlugKm: 190000 },
      { name: 'Tundra', body: 'truck', engine: '3.4L twin-turbo V6', transmission: 'automatic', drivetrain: '4wd', oilType: '0W-20 synthetic', oilCapacityL: 7.4, tireSize: '265/70R18', sparkPlugKm: 190000 },
      { name: '4Runner', body: 'suv', engine: '4.0L V6', transmission: 'automatic', drivetrain: '4wd', oilType: '0W-20 synthetic', oilCapacityL: 6.2, tireSize: '265/70R17', sparkPlugKm: 190000 },
      { name: 'Sequoia', body: 'suv', powertrain: 'hybrid', engine: '3.4L twin-turbo V6 hybrid', transmission: 'automatic', drivetrain: '4wd', oilType: '0W-20 synthetic', oilCapacityL: 7.4, tireSize: '265/70R18', sparkPlugKm: 190000 },
      { name: 'Sienna', body: 'suv', powertrain: 'hybrid', engine: '2.5L 4-cyl hybrid', transmission: 'cvt', drivetrain: 'awd', oilCapacityL: 4.5, tireSize: '235/65R17', sparkPlugKm: 190000 },
      { name: 'Corolla Cross', body: 'suv', engine: '2.0L 4-cyl', transmission: 'cvt', drivetrain: 'awd', oilCapacityL: 4.2, tireSize: '225/55R18', sparkPlugKm: 190000 },
      { name: 'Prius', body: 'hatchback', powertrain: 'hybrid', engine: '2.0L 4-cyl hybrid', transmission: 'cvt', drivetrain: 'fwd', oilCapacityL: 4.2, tireSize: '195/50R19', sparkPlugKm: 190000 },
    ],
  },
  {
    name: 'Honda', oilType: '0W-20 synthetic', oilIntervalKm: 8000, coolant: 'Honda Type 2 (blue)',
    models: [
      { name: 'Civic', body: 'sedan', engine: '2.0L 4-cyl', transmission: 'cvt', drivetrain: 'fwd', oilCapacityL: 3.7, tireSize: '215/55R16', sparkPlugKm: 160000 },
      { name: 'Civic Hatchback', body: 'hatchback', engine: '1.5L turbo 4-cyl', transmission: 'cvt', drivetrain: 'fwd', oilCapacityL: 3.4, tireSize: '235/40R18', sparkPlugKm: 160000 },
      { name: 'Accord', body: 'sedan', engine: '1.5L turbo 4-cyl', transmission: 'cvt', drivetrain: 'fwd', oilCapacityL: 3.4, tireSize: '225/50R17', sparkPlugKm: 160000 },
      { name: 'CR-V', body: 'suv', engine: '1.5L turbo 4-cyl', transmission: 'cvt', drivetrain: 'awd', oilCapacityL: 3.7, tireSize: '235/60R18', sparkPlugKm: 160000 },
      { name: 'HR-V', body: 'suv', engine: '2.0L 4-cyl', transmission: 'cvt', drivetrain: 'awd', oilCapacityL: 3.7, tireSize: '215/60R17', sparkPlugKm: 160000 },
      { name: 'Pilot', body: 'suv', engine: '3.5L V6', transmission: 'automatic', drivetrain: 'awd', oilCapacityL: 5.4, tireSize: '255/50R20', sparkPlugKm: 160000 },
      { name: 'Odyssey', body: 'suv', engine: '3.5L V6', transmission: 'automatic', drivetrain: 'fwd', oilCapacityL: 5.4, tireSize: '235/60R18', sparkPlugKm: 160000 },
      { name: 'Ridgeline', body: 'truck', engine: '3.5L V6', transmission: 'automatic', drivetrain: 'awd', oilCapacityL: 5.4, tireSize: '245/60R18', sparkPlugKm: 160000 },
    ],
  },
  {
    name: 'Ford', oilType: '5W-30 synthetic blend', oilIntervalKm: 8000, coolant: 'Motorcraft Orange',
    models: [
      { name: 'F-150', body: 'truck', engine: '3.5L EcoBoost V6', transmission: 'automatic', drivetrain: '4wd', oilType: '5W-30 synthetic', oilCapacityL: 5.7, tireSize: '275/65R18', sparkPlugKm: 96000 },
      { name: 'Escape', body: 'suv', engine: '1.5L EcoBoost 3-cyl', transmission: 'automatic', drivetrain: 'awd', oilType: '0W-20 synthetic', oilCapacityL: 4.0, tireSize: '225/65R17', sparkPlugKm: 160000 },
      { name: 'Explorer', body: 'suv', engine: '2.3L EcoBoost 4-cyl', transmission: 'automatic', drivetrain: 'awd', oilCapacityL: 5.2, tireSize: '255/65R18', sparkPlugKm: 160000 },
      { name: 'Bronco Sport', body: 'suv', engine: '1.5L EcoBoost 3-cyl', transmission: 'automatic', drivetrain: '4wd', oilType: '0W-20 synthetic', oilCapacityL: 4.0, tireSize: '225/65R17', sparkPlugKm: 160000 },
      { name: 'Maverick', body: 'truck', powertrain: 'hybrid', engine: '2.5L 4-cyl hybrid', transmission: 'cvt', drivetrain: 'fwd', oilType: '0W-20 synthetic', oilCapacityL: 5.4, tireSize: '225/65R17', sparkPlugKm: 160000 },
      { name: 'Ranger', body: 'truck', engine: '2.3L EcoBoost 4-cyl', transmission: 'automatic', drivetrain: '4wd', oilCapacityL: 5.7, tireSize: '255/70R17', sparkPlugKm: 160000 },
      ev('Mustang Mach-E', 'suv', 'awd', '225/60R18'),
    ],
  },
  {
    name: 'Chevrolet', oilType: '0W-20 dexos1 synthetic', oilIntervalKm: 12000, coolant: 'Dex-Cool (orange)',
    models: [
      { name: 'Silverado 1500', body: 'truck', engine: '5.3L V8', transmission: 'automatic', drivetrain: '4wd', oilCapacityL: 7.6, tireSize: '265/65R18', sparkPlugKm: 160000 },
      { name: 'Equinox', body: 'suv', engine: '1.5L turbo 4-cyl', transmission: 'automatic', drivetrain: 'awd', oilType: '0W-20 dexos1 synthetic', oilCapacityL: 4.0, tireSize: '225/65R17', sparkPlugKm: 160000 },
      { name: 'Trax', body: 'suv', engine: '1.2L turbo 3-cyl', transmission: 'automatic', drivetrain: 'fwd', oilCapacityL: 3.8, tireSize: '225/55R18', sparkPlugKm: 160000 },
      { name: 'Malibu', body: 'sedan', engine: '1.5L turbo 4-cyl', transmission: 'cvt', drivetrain: 'fwd', oilType: '5W-30 dexos1 synthetic', oilCapacityL: 4.0, tireSize: '225/55R17', sparkPlugKm: 160000 },
      ev('Bolt EUV', 'hatchback', 'fwd', '215/50R17'),
    ],
  },
  {
    name: 'Hyundai', oilType: '0W-20 synthetic', oilIntervalKm: 8000, coolant: 'Hyundai Long Life (green)',
    models: [
      { name: 'Elantra', body: 'sedan', engine: '2.0L 4-cyl', transmission: 'cvt', drivetrain: 'fwd', oilCapacityL: 4.0, tireSize: '205/55R16', sparkPlugKm: 160000 },
      { name: 'Tucson', body: 'suv', engine: '2.5L 4-cyl', transmission: 'automatic', drivetrain: 'awd', oilCapacityL: 5.1, tireSize: '235/60R18', sparkPlugKm: 160000 },
      { name: 'Kona', body: 'suv', engine: '2.0L 4-cyl', transmission: 'cvt', drivetrain: 'fwd', oilCapacityL: 4.0, tireSize: '215/60R17', sparkPlugKm: 160000 },
      { name: 'Santa Fe', body: 'suv', engine: '2.5L turbo 4-cyl', transmission: 'automatic', drivetrain: 'awd', oilType: '0W-30 synthetic', oilCapacityL: 5.7, tireSize: '235/60R18', sparkPlugKm: 160000 },
      ev('Ioniq 5', 'suv', 'awd', '235/55R19'),
    ],
  },
  {
    name: 'Kia', oilType: '0W-20 synthetic', oilIntervalKm: 8000, coolant: 'Kia Long Life (green)',
    models: [
      { name: 'Forte', body: 'sedan', engine: '2.0L 4-cyl', transmission: 'cvt', drivetrain: 'fwd', oilCapacityL: 4.0, tireSize: '205/55R16', sparkPlugKm: 160000 },
      { name: 'Seltos', body: 'suv', engine: '2.0L 4-cyl', transmission: 'cvt', drivetrain: 'awd', oilCapacityL: 4.0, tireSize: '215/55R18', sparkPlugKm: 160000 },
      { name: 'Sportage', body: 'suv', engine: '2.5L 4-cyl', transmission: 'automatic', drivetrain: 'awd', oilCapacityL: 5.1, tireSize: '235/60R18', sparkPlugKm: 160000 },
      { name: 'Sorento', body: 'suv', engine: '2.5L 4-cyl', transmission: 'automatic', drivetrain: 'awd', oilCapacityL: 5.1, tireSize: '235/65R17', sparkPlugKm: 160000 },
      { name: 'Telluride', body: 'suv', engine: '3.8L V6', transmission: 'automatic', drivetrain: 'awd', oilType: '5W-30 synthetic', oilCapacityL: 6.0, tireSize: '245/60R18', sparkPlugKm: 160000 },
      ev('EV6', 'suv', 'awd', '235/55R19'),
    ],
  },
  {
    name: 'Mazda', oilType: '0W-20 synthetic', oilIntervalKm: 8000, coolant: 'Mazda FL22 (green)',
    models: [
      { name: 'Mazda3', body: 'sedan', engine: '2.5L 4-cyl', transmission: 'automatic', drivetrain: 'fwd', oilCapacityL: 4.8, tireSize: '215/45R18', sparkPlugKm: 120000 },
      { name: 'Mazda3 Sport', body: 'hatchback', engine: '2.5L 4-cyl', transmission: 'automatic', drivetrain: 'awd', oilCapacityL: 4.8, tireSize: '215/45R18', sparkPlugKm: 120000 },
      { name: 'CX-30', body: 'suv', engine: '2.5L 4-cyl', transmission: 'automatic', drivetrain: 'awd', oilCapacityL: 4.8, tireSize: '215/55R18', sparkPlugKm: 120000 },
      { name: 'CX-5', body: 'suv', engine: '2.5L 4-cyl', transmission: 'automatic', drivetrain: 'awd', oilCapacityL: 4.8, tireSize: '225/55R19', sparkPlugKm: 120000 },
      { name: 'CX-50', body: 'suv', engine: '2.5L 4-cyl', transmission: 'automatic', drivetrain: 'awd', oilCapacityL: 4.8, tireSize: '225/60R18', sparkPlugKm: 120000 },
      { name: 'CX-90', body: 'suv', engine: '3.3L turbo inline-6', transmission: 'automatic', drivetrain: 'awd', oilCapacityL: 6.4, tireSize: '275/45R21', sparkPlugKm: 120000 },
    ],
  },
  {
    name: 'Nissan', oilType: '0W-20 synthetic', oilIntervalKm: 8000, coolant: 'Nissan Long Life Blue',
    models: [
      { name: 'Sentra', body: 'sedan', engine: '2.0L 4-cyl', transmission: 'cvt', drivetrain: 'fwd', oilCapacityL: 4.1, tireSize: '205/60R16', sparkPlugKm: 168000 },
      { name: 'Altima', body: 'sedan', engine: '2.5L 4-cyl', transmission: 'cvt', drivetrain: 'awd', oilCapacityL: 5.0, tireSize: '215/60R16', sparkPlugKm: 168000 },
      { name: 'Rogue', body: 'suv', engine: '1.5L turbo 3-cyl', transmission: 'cvt', drivetrain: 'awd', oilCapacityL: 4.8, tireSize: '225/65R17', sparkPlugKm: 168000 },
      { name: 'Kicks', body: 'suv', engine: '1.6L 4-cyl', transmission: 'cvt', drivetrain: 'fwd', oilCapacityL: 4.0, tireSize: '205/60R16', sparkPlugKm: 168000 },
      { name: 'Frontier', body: 'truck', engine: '3.8L V6', transmission: 'automatic', drivetrain: '4wd', oilType: '0W-20 synthetic', oilCapacityL: 5.7, tireSize: '265/70R17', sparkPlugKm: 168000 },
      ev('Leaf', 'hatchback', 'fwd', '215/50R17'),
    ],
  },
  {
    name: 'Subaru', oilType: '0W-20 synthetic', oilIntervalKm: 9600, coolant: 'Subaru Super Coolant (blue)',
    models: [
      { name: 'Impreza', body: 'hatchback', engine: '2.0L flat-4', transmission: 'cvt', drivetrain: 'awd', oilCapacityL: 4.4, tireSize: '205/55R16', sparkPlugKm: 96000 },
      { name: 'Crosstrek', body: 'suv', engine: '2.5L flat-4', transmission: 'cvt', drivetrain: 'awd', oilCapacityL: 4.8, tireSize: '225/60R17', sparkPlugKm: 96000 },
      { name: 'Forester', body: 'suv', engine: '2.5L flat-4', transmission: 'cvt', drivetrain: 'awd', oilCapacityL: 4.8, tireSize: '225/60R17', sparkPlugKm: 96000 },
      { name: 'Outback', body: 'suv', engine: '2.5L flat-4', transmission: 'cvt', drivetrain: 'awd', oilCapacityL: 4.8, tireSize: '225/65R17', sparkPlugKm: 96000 },
      { name: 'WRX', body: 'sedan', engine: '2.4L turbo flat-4', transmission: 'manual', drivetrain: 'awd', oilType: '5W-30 synthetic', oilCapacityL: 5.1, tireSize: '245/40R18', sparkPlugKm: 96000 },
      { name: 'Ascent', body: 'suv', engine: '2.4L turbo flat-4', transmission: 'cvt', drivetrain: 'awd', oilType: '0W-20 synthetic', oilCapacityL: 5.1, tireSize: '245/60R18', sparkPlugKm: 96000 },
    ],
  },
  {
    name: 'Volkswagen', oilType: '0W-20 VW 508.00 synthetic', oilIntervalKm: 16000, coolant: 'VW G13 (purple)',
    models: [
      { name: 'Jetta', body: 'sedan', engine: '1.5L turbo 4-cyl', transmission: 'automatic', drivetrain: 'fwd', oilCapacityL: 4.0, tireSize: '205/60R16', sparkPlugKm: 64000 },
      { name: 'Golf GTI', body: 'hatchback', engine: '2.0L turbo 4-cyl', transmission: 'manual', drivetrain: 'fwd', oilType: '0W-20 VW 508.00 synthetic', oilCapacityL: 5.7, tireSize: '225/40R18', sparkPlugKm: 64000 },
      { name: 'Taos', body: 'suv', engine: '1.5L turbo 4-cyl', transmission: 'automatic', drivetrain: 'awd', oilCapacityL: 4.0, tireSize: '215/55R17', sparkPlugKm: 64000 },
      { name: 'Tiguan', body: 'suv', engine: '2.0L turbo 4-cyl', transmission: 'automatic', drivetrain: 'awd', oilCapacityL: 5.7, tireSize: '235/55R18', sparkPlugKm: 64000 },
      { name: 'Atlas', body: 'suv', engine: '2.0L turbo 4-cyl', transmission: 'automatic', drivetrain: 'awd', oilCapacityL: 5.7, tireSize: '255/60R18', sparkPlugKm: 64000 },
      ev('ID.4', 'suv', 'awd', '235/55R19'),
    ],
  },
  {
    name: 'BMW', oilType: '0W-20 BMW LL-17 FE+ synthetic', oilIntervalKm: 16000, coolant: 'BMW Antifreeze (blue)',
    models: [
      { name: '3 Series', body: 'sedan', engine: '2.0L turbo 4-cyl', transmission: 'automatic', drivetrain: 'awd', oilCapacityL: 5.2, tireSize: '225/45R18', sparkPlugKm: 96000 },
      { name: '5 Series', body: 'sedan', engine: '2.0L turbo 4-cyl', transmission: 'automatic', drivetrain: 'awd', oilCapacityL: 5.2, tireSize: '245/45R19', sparkPlugKm: 96000 },
      { name: 'X3', body: 'suv', engine: '2.0L turbo 4-cyl', transmission: 'automatic', drivetrain: 'awd', oilCapacityL: 5.2, tireSize: '245/50R19', sparkPlugKm: 96000 },
      { name: 'X5', body: 'suv', engine: '3.0L turbo inline-6', transmission: 'automatic', drivetrain: 'awd', oilCapacityL: 6.5, tireSize: '275/45R20', sparkPlugKm: 96000 },
      ev('i4', 'sedan', 'rwd', '245/45R18'),
    ],
  },
  {
    name: 'Mercedes-Benz', oilType: '0W-40 MB 229.5 synthetic', oilIntervalKm: 16000, coolant: 'MB 325.0 (blue-green)',
    models: [
      { name: 'C-Class', body: 'sedan', engine: '2.0L turbo 4-cyl', transmission: 'automatic', drivetrain: 'awd', oilCapacityL: 6.5, tireSize: '225/45R18', sparkPlugKm: 96000 },
      { name: 'GLC', body: 'suv', engine: '2.0L turbo 4-cyl', transmission: 'automatic', drivetrain: 'awd', oilCapacityL: 6.5, tireSize: '235/55R19', sparkPlugKm: 96000 },
      { name: 'GLE', body: 'suv', engine: '2.0L turbo 4-cyl', transmission: 'automatic', drivetrain: 'awd', oilCapacityL: 6.5, tireSize: '275/50R20', sparkPlugKm: 96000 },
    ],
  },
  {
    name: 'Audi', oilType: '0W-20 VW 508.00 synthetic', oilIntervalKm: 16000, coolant: 'VW G13 (purple)',
    models: [
      { name: 'A4', body: 'sedan', engine: '2.0L turbo 4-cyl', transmission: 'automatic', drivetrain: 'awd', oilCapacityL: 5.7, tireSize: '245/40R18', sparkPlugKm: 64000 },
      { name: 'Q5', body: 'suv', engine: '2.0L turbo 4-cyl', transmission: 'automatic', drivetrain: 'awd', oilCapacityL: 5.7, tireSize: '235/60R18', sparkPlugKm: 64000 },
      { name: 'Q7', body: 'suv', engine: '2.0L turbo 4-cyl', transmission: 'automatic', drivetrain: 'awd', oilCapacityL: 5.7, tireSize: '255/55R19', sparkPlugKm: 64000 },
    ],
  },
  {
    name: 'Tesla', oilType: 'n/a', oilIntervalKm: 0, coolant: 'G-48 (blue)',
    models: [
      ev('Model 3', 'sedan', 'awd', '235/45R18'),
      ev('Model Y', 'suv', 'awd', '255/45R19'),
      ev('Model S', 'sedan', 'awd', '245/45R19'),
      ev('Model X', 'suv', 'awd', '265/45R20'),
    ],
  },
  {
    name: 'Jeep', oilType: '0W-20 synthetic', oilIntervalKm: 12000, coolant: 'Mopar OAT (purple)',
    models: [
      { name: 'Wrangler', body: 'suv', engine: '3.6L V6', transmission: 'automatic', drivetrain: '4wd', oilCapacityL: 5.7, tireSize: '245/75R17', sparkPlugKm: 160000 },
      { name: 'Grand Cherokee', body: 'suv', engine: '3.6L V6', transmission: 'automatic', drivetrain: '4wd', oilCapacityL: 5.7, tireSize: '265/60R18', sparkPlugKm: 160000 },
      { name: 'Cherokee', body: 'suv', engine: '2.4L 4-cyl', transmission: 'automatic', drivetrain: '4wd', oilCapacityL: 5.2, tireSize: '225/60R17', sparkPlugKm: 160000 },
      { name: 'Gladiator', body: 'truck', engine: '3.6L V6', transmission: 'automatic', drivetrain: '4wd', oilCapacityL: 5.7, tireSize: '245/75R17', sparkPlugKm: 160000 },
      { name: 'Compass', body: 'suv', engine: '2.0L turbo 4-cyl', transmission: 'automatic', drivetrain: '4wd', oilType: '0W-20 synthetic', oilCapacityL: 4.7, tireSize: '225/60R17', sparkPlugKm: 160000 },
    ],
  },
  {
    name: 'Ram', oilType: '0W-20 synthetic', oilIntervalKm: 12000, coolant: 'Mopar OAT (purple)',
    models: [
      { name: '1500', body: 'truck', engine: '5.7L HEMI V8', transmission: 'automatic', drivetrain: '4wd', oilType: '5W-20 synthetic', oilCapacityL: 6.6, tireSize: '275/65R18', sparkPlugKm: 160000 },
      { name: '2500', body: 'truck', engine: '6.4L HEMI V8', transmission: 'automatic', drivetrain: '4wd', oilType: '0W-40 synthetic', oilCapacityL: 6.6, tireSize: '275/70R18', sparkPlugKm: 160000 },
    ],
  },
  {
    name: 'GMC', oilType: '0W-20 dexos1 synthetic', oilIntervalKm: 12000, coolant: 'Dex-Cool (orange)',
    models: [
      { name: 'Sierra 1500', body: 'truck', engine: '5.3L V8', transmission: 'automatic', drivetrain: '4wd', oilCapacityL: 7.6, tireSize: '275/60R20', sparkPlugKm: 160000 },
      { name: 'Terrain', body: 'suv', engine: '1.5L turbo 4-cyl', transmission: 'automatic', drivetrain: 'awd', oilCapacityL: 4.0, tireSize: '225/65R17', sparkPlugKm: 160000 },
      { name: 'Acadia', body: 'suv', engine: '2.5L turbo 4-cyl', transmission: 'automatic', drivetrain: 'awd', oilCapacityL: 5.2, tireSize: '255/55R20', sparkPlugKm: 160000 },
    ],
  },
  {
    name: 'Lexus', oilType: '0W-20 synthetic', oilIntervalKm: 8000, coolant: 'Toyota Super Long Life (pink)',
    models: [
      { name: 'RX', body: 'suv', engine: '2.4L turbo 4-cyl', transmission: 'automatic', drivetrain: 'awd', oilCapacityL: 5.7, tireSize: '235/60R21', sparkPlugKm: 190000 },
      { name: 'NX', body: 'suv', engine: '2.5L 4-cyl', transmission: 'automatic', drivetrain: 'awd', oilType: '0W-16 synthetic', oilCapacityL: 4.5, tireSize: '235/60R18', sparkPlugKm: 190000 },
      { name: 'ES', body: 'sedan', engine: '2.5L 4-cyl', transmission: 'automatic', drivetrain: 'fwd', oilType: '0W-16 synthetic', oilCapacityL: 4.5, tireSize: '235/45R18', sparkPlugKm: 190000 },
    ],
  },
  {
    name: 'Acura', oilType: '0W-20 synthetic', oilIntervalKm: 8000, coolant: 'Honda Type 2 (blue)',
    models: [
      { name: 'Integra', body: 'hatchback', engine: '1.5L turbo 4-cyl', transmission: 'cvt', drivetrain: 'fwd', oilCapacityL: 3.4, tireSize: '235/40R18', sparkPlugKm: 160000 },
      { name: 'RDX', body: 'suv', engine: '2.0L turbo 4-cyl', transmission: 'automatic', drivetrain: 'awd', oilCapacityL: 4.4, tireSize: '235/55R19', sparkPlugKm: 160000 },
      { name: 'MDX', body: 'suv', engine: '3.5L V6', transmission: 'automatic', drivetrain: 'awd', oilCapacityL: 5.4, tireSize: '255/50R20', sparkPlugKm: 160000 },
    ],
  },
  {
    name: 'Mitsubishi', oilType: '0W-20 synthetic', oilIntervalKm: 8000, coolant: 'Mitsubishi Super Long Life (green)',
    models: [
      { name: 'RVR', body: 'suv', engine: '2.0L 4-cyl', transmission: 'cvt', drivetrain: 'awd', oilCapacityL: 4.2, tireSize: '225/55R18', sparkPlugKm: 160000 },
      { name: 'Outlander', body: 'suv', engine: '2.5L 4-cyl', transmission: 'cvt', drivetrain: 'awd', oilCapacityL: 4.7, tireSize: '235/60R18', sparkPlugKm: 160000 },
      { name: 'Outlander PHEV', body: 'suv', powertrain: 'hybrid', engine: '2.4L 4-cyl plug-in hybrid', transmission: 'single-speed', drivetrain: 'awd', oilCapacityL: 4.3, tireSize: '255/45R20', sparkPlugKm: 160000 },
    ],
  },
]

/** Generic fallbacks per body style, used when a model is not in the spec sheet. */
export const GENERIC_BY_BODY: Record<BodyType, Omit<CarSpecs, 'drivingStyle' | 'tireSetup' | 'annualKm'>> = {
  sedan: { bodyType: 'sedan', powertrain: 'gas', engine: '2.0L 4-cyl', transmission: 'automatic', drivetrain: 'fwd', oilType: '0W-20 synthetic', oilCapacityL: 4.5, oilIntervalKm: 8000, tireSize: '215/55R17', coolant: 'Long-life OAT coolant', sparkPlugKm: 160000, timingBelt: false },
  hatchback: { bodyType: 'hatchback', powertrain: 'gas', engine: '1.8L 4-cyl', transmission: 'automatic', drivetrain: 'fwd', oilType: '0W-20 synthetic', oilCapacityL: 4.2, oilIntervalKm: 8000, tireSize: '205/55R16', coolant: 'Long-life OAT coolant', sparkPlugKm: 160000, timingBelt: false },
  suv: { bodyType: 'suv', powertrain: 'gas', engine: '2.5L 4-cyl', transmission: 'automatic', drivetrain: 'awd', oilType: '0W-20 synthetic', oilCapacityL: 5.0, oilIntervalKm: 8000, tireSize: '225/65R17', coolant: 'Long-life OAT coolant', sparkPlugKm: 160000, timingBelt: false },
  truck: { bodyType: 'truck', powertrain: 'gas', engine: '5.0L V8', transmission: 'automatic', drivetrain: '4wd', oilType: '5W-30 synthetic', oilCapacityL: 7.0, oilIntervalKm: 8000, tireSize: '265/70R17', coolant: 'Long-life OAT coolant', sparkPlugKm: 160000, timingBelt: false },
}

/** Very rough guess of body style from a model name not in the spec sheet. */
export function guessBody(model: string): BodyType {
  const m = model.toLowerCase()
  if (/(f-?\d{3}|silverado|sierra|ram|tacoma|tundra|ranger|frontier|colorado|canyon|titan|ridgeline|maverick|gladiator|truck|\d{4}hd)/.test(m)) return 'truck'
  if (/(4runner|sequoia|cherokee|wagoneer|cx-|rav|cr-v|hr-v|suv|x\d|q\d|gl[a-z]|rogue|tucson|santa|sorento|sportage|explorer|escape|equinox|outback|forester|tiguan|atlas|highlander|pilot|wrangler|cherokee|model y|model x|kona|seltos|venue|edge|bronco|trax|blazer|traverse|tahoe|suburban|yukon|pathfinder|murano|ascent|crosstrek|telluride|palisade|odyssey|sienna|pacifica|carnival)/.test(m)) return 'suv'
  if (/(hatch|golf|fit|yaris|sport|leaf|bolt|prius|impreza|veloster|mini)/.test(m)) return 'hatchback'
  return 'sedan'
}

export function findMake(name: string) {
  return MAKES.find((m) => m.name.toLowerCase() === name.trim().toLowerCase())
}

export function findModel(make: string, model: string) {
  return findMake(make)?.models.find((m) => m.name.toLowerCase() === model.trim().toLowerCase())
}
