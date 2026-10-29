export type BodyType = 'sedan' | 'hatchback' | 'suv' | 'truck'
export type Powertrain = 'gas' | 'hybrid' | 'diesel' | 'ev'
export type Transmission = 'automatic' | 'cvt' | 'manual' | 'single-speed'
export type Drivetrain = 'fwd' | 'rwd' | 'awd' | '4wd'
export type DrivingStyle = 'normal' | 'severe'
export type TireSetup = 'seasonal' | 'all-season' | 'all-weather'
export type ViewId = 'top' | 'side' | 'engine'
export type Provider = 'mrlube' | 'kaltire' | 'dealer'

/** Every field that drives a maintenance rule. Each one can come from the user, the spec sheet, or a guess. */
export interface CarSpecs {
  bodyType: BodyType
  powertrain: Powertrain
  engine: string
  transmission: Transmission
  drivetrain: Drivetrain
  oilType: string
  oilCapacityL: number
  oilIntervalKm: number
  tireSize: string
  coolant: string
  sparkPlugKm: number
  timingBelt: boolean
  drivingStyle: DrivingStyle
  tireSetup: TireSetup
  annualKm: number
}

export type SpecKey = keyof CarSpecs

/** Where a spec value came from. 'assumed' values are highlighted on the maintenance screen. */
export type SpecSource = 'you' | 'spec' | 'assumed'

export interface TaskRecord {
  km: number
  date: string // ISO date
  note?: string
  /** The scanned receipt this record came from */
  receiptId?: string
}

export interface Appointment {
  taskIds: string[]
  provider: Provider
  date: string // ISO datetime
  note?: string
}

export interface Receipt {
  /** Also the key of its photo in receipt storage, when one was saved */
  id?: string
  hasImage?: boolean
  date: string
  shop: string | null
  total: number | null
  summary: string
  taskIds: string[]
  scannedAt: string
}

/** A photo of the user's own car for one view, with the maintenance dots placed on it (percent of the photo). */
export interface CarPhoto {
  src: string
  aspect: number
  spots: Record<string, { x: number; y: number }>
}

export interface Car {
  id: string
  make: string
  model: string
  year: number
  trim?: string
  nickname?: string
  color: string
  odometerKm: number
  odometerUpdatedAt: string
  /** Readings the user entered (estimates are never logged) */
  odometerLog: { km: number; date: string }[]
  /** KM auto: estimate kilometers from the average daily distance each time the app opens */
  kmAuto?: boolean
  /** True when odometerKm is a KM auto estimate rather than a reading */
  odometerEstimated?: boolean
  specs: CarSpecs
  sources: Record<SpecKey, SpecSource>
  history: Record<string, TaskRecord[]>
  appointments: Appointment[]
  /** Receipts and work orders read with the scanner */
  receipts?: Receipt[]
  photos?: Partial<Record<ViewId, CarPhoto>>
  /** Per-job alert switches. Missing means the job's default (off for jobs the car's dashboard already warns about). */
  alerts?: Record<string, boolean>
  profileComplete: boolean
  createdAt: string
}

/** 'off' = alerts are turned off for this job on this car */
export type Status = 'overdue' | 'soon' | 'ok' | 'off'

export interface TaskStatus {
  status: Status
  /** km left until due (negative = overdue) */
  kmLeft: number | null
  dueKm: number | null
  dueDate: string | null
  daysLeft: number | null
  /** true when there is no service record and the last service was estimated */
  estimated: boolean
  last: TaskRecord | null
}
