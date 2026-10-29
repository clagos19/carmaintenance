import type { CarSpecs, Provider, ViewId } from '../types'

export type Range = [number, number]

export interface DiyGuide {
  difficulty: 'Easy' | 'Moderate'
  minutes: number
  cost: Range
  steps: string[]
}

export interface TaskDef {
  id: string
  name: string
  view: ViewId
  /** Hotspot key in the art for this view */
  spot: string
  /** 0 = not km based */
  km: (s: CarSpecs) => number
  /** 0 = not time based */
  months: (s: CarSpecs) => number
  /** Seasonal tasks are due on fixed dates each year instead of an interval */
  seasonal?: boolean
  applies: (s: CarSpecs) => boolean
  why: string
  materials: (s: CarSpecs) => string[]
  costs: Partial<Record<Provider, Range>>
  costNote?: string
  diy?: DiyGuide
  /** Search phrase for YouTube, appended to year/make/model */
  video: string
  /** The dashboard warns about this one, so alerts start off */
  dashWarning?: string
  bookWith: Provider[]
}

const always = () => true
const hasEngine = (s: CarSpecs) => s.powertrain !== 'ev'
const severe = (s: CarSpecs) => s.drivingStyle === 'severe'
/** Round down to a tidy number of km */
const tidy = (km: number) => Math.round(km / 500) * 500

export const TASKS: TaskDef[] = [
  // ---------- Engine bay ----------
  {
    id: 'oil',
    name: 'Engine oil & filter',
    view: 'engine',
    spot: 'oilcap',
    km: (s) => tidy((s.oilIntervalKm || 8000) * (severe(s) ? 0.75 : 1)),
    months: (s) => (severe(s) ? 6 : 12),
    applies: hasEngine,
    why: 'Fresh oil keeps the engine lubricated and cool. Old oil turns to sludge and is the most common cause of avoidable engine wear.',
    materials: (s) => [
      `${s.oilCapacityL ? `${s.oilCapacityL} L` : 'About 5 L'} of ${s.oilType}`,
      'New oil filter and drain plug washer',
      'Drain pan, wrench set, funnel, gloves',
    ],
    costs: { mrlube: [90, 140], kaltire: [85, 130], dealer: [110, 180] },
    costNote: 'Synthetic oil change. Mr. Lube also tops up fluids and checks the air and cabin filters.',
    diy: {
      difficulty: 'Moderate',
      minutes: 45,
      cost: [45, 80],
      steps: [
        'Run the engine for 2 minutes so the oil flows, then switch it off and park on level ground.',
        'Raise the front safely on ramps or jack stands. Never work under a car held only by a jack.',
        'Put the drain pan under the drain plug, remove the plug and let the oil drain fully.',
        'Reinstall the plug with a new washer. Snug, not over-tight.',
        'Unscrew the old filter, wipe the mount, oil the new gasket and spin the new filter on hand-tight.',
        'Lower the car, fill with the specified oil through the filler cap, check the dipstick and top up.',
        'Start the engine, check for leaks, then reset the oil life monitor. Take used oil to a recycling depot.',
      ],
    },
    video: 'oil change',
    bookWith: ['mrlube', 'kaltire', 'dealer'],
  },
  {
    id: 'coolant-check',
    name: 'Check coolant level',
    view: 'engine',
    spot: 'coolant',
    km: () => 5000,
    months: () => 3,
    applies: always,
    why: 'Low coolant leads to overheating and, in a Canadian winter, can freeze. A quick look at the reservoir catches leaks early.',
    materials: (s) => [`Top-up: ${s.coolant}, 50/50 premix`, 'Rag'],
    costs: { mrlube: [0, 15], dealer: [0, 30] },
    costNote: 'Usually checked free during an oil change.',
    diy: {
      difficulty: 'Easy',
      minutes: 5,
      cost: [0, 25],
      steps: [
        'Check with the engine cold. Never open a hot radiator cap.',
        'Find the translucent coolant reservoir and read the level against the MIN and MAX marks.',
        'If low, top up to MAX with the same coolant type (do not mix colours).',
        'If you keep needing to top up, book an inspection for a leak.',
      ],
    },
    video: 'check coolant level',
    bookWith: ['mrlube', 'dealer'],
  },
  {
    id: 'coolant-flush',
    name: 'Coolant flush',
    view: 'engine',
    spot: 'radiator',
    km: (s) => (s.powertrain === 'ev' ? 0 : 160000),
    months: (s) => (s.powertrain === 'ev' ? 0 : 96),
    applies: hasEngine,
    why: 'Coolant additives wear out over time and the fluid becomes corrosive to the radiator, water pump and heater core.',
    materials: (s) => [`About 6 to 8 L of ${s.coolant}`, 'Distilled water for flushing'],
    costs: { mrlube: [150, 220], dealer: [180, 300] },
    video: 'coolant flush',
    bookWith: ['mrlube', 'dealer'],
  },
  {
    id: 'air-filter',
    name: 'Engine air filter',
    view: 'engine',
    spot: 'airbox',
    km: (s) => (severe(s) ? 15000 : 24000),
    months: () => 24,
    applies: hasEngine,
    why: 'A clogged air filter starves the engine of air, hurting power and fuel economy.',
    materials: () => ['Engine air filter for your model', 'Screwdriver (some housings)'],
    costs: { mrlube: [45, 75], kaltire: [45, 75], dealer: [60, 110] },
    diy: {
      difficulty: 'Easy',
      minutes: 10,
      cost: [20, 45],
      steps: [
        'Open the hood and find the black plastic air box connected to the intake tube.',
        'Release the clips or screws and lift the lid.',
        'Note which way the old filter sits, lift it out and wipe the box clean.',
        'Drop in the new filter the same way, close the lid and secure every clip.',
      ],
    },
    video: 'engine air filter replacement',
    bookWith: ['mrlube', 'kaltire', 'dealer'],
  },
  {
    id: 'brake-fluid',
    name: 'Brake fluid flush',
    view: 'engine',
    spot: 'brakefluid',
    km: () => 48000,
    months: () => 36,
    applies: always,
    why: 'Brake fluid absorbs moisture, which lowers its boiling point and corrodes brake lines. Spongy brakes are a sign.',
    materials: () => ['About 1 L of DOT 3 or DOT 4 brake fluid (check the reservoir cap)', 'Bleeder kit'],
    costs: { mrlube: [100, 150], kaltire: [100, 160], dealer: [130, 200] },
    costNote: 'Bleeding brakes needs two people or special tools, so a shop is recommended.',
    video: 'brake fluid flush',
    bookWith: ['kaltire', 'mrlube', 'dealer'],
  },
  {
    id: 'battery',
    name: '12V battery test',
    view: 'engine',
    spot: 'battery',
    km: () => 0,
    months: () => 12,
    applies: always,
    why: 'Cold weather is hard on batteries. A load test before winter avoids a no-start on a frosty morning. Most last 4 to 6 years.',
    materials: () => ['Multimeter (optional)', 'Wire brush and terminal protector spray', 'Replacement: group-size battery for your model'],
    costs: { kaltire: [0, 25], mrlube: [0, 25], dealer: [0, 50] },
    costNote: 'Testing is often free. A replacement battery runs about $180 to $320 installed.',
    diy: {
      difficulty: 'Easy',
      minutes: 15,
      cost: [0, 15],
      steps: [
        'With the car off, check the terminals for white or green corrosion.',
        'Clean corrosion with a wire brush (negative clamp off first, on last).',
        'With a multimeter, a healthy resting battery reads about 12.6 V. Below 12.2 V means it is weak.',
        'If the battery is over 4 years old, get a free load test at a tire or battery shop before winter.',
      ],
    },
    video: 'car battery test',
    bookWith: ['kaltire', 'mrlube', 'dealer'],
  },
  {
    id: 'spark-plugs',
    name: 'Spark plugs',
    view: 'engine',
    spot: 'plugs',
    km: (s) => s.sparkPlugKm || 160000,
    months: () => 0,
    applies: (s) => hasEngine(s) && s.powertrain !== 'diesel',
    why: 'Worn plugs cause misfires, rough idle, poor fuel economy and can damage the catalytic converter.',
    materials: () => ['Set of iridium spark plugs for your engine', 'Spark plug socket, extension, torque wrench'],
    costs: { kaltire: [220, 450], dealer: [280, 560] },
    diy: {
      difficulty: 'Moderate',
      minutes: 60,
      cost: [60, 140],
      steps: [
        'Work on a cold engine. Remove the engine cover if there is one.',
        'Unplug and pull out one ignition coil at a time so wires stay in order.',
        'Remove the old plug with a spark plug socket and extension.',
        'Check the gap on the new plug, thread it in by hand, then torque to spec.',
        'Reinstall the coil and repeat for each cylinder.',
      ],
    },
    video: 'spark plug replacement',
    bookWith: ['dealer', 'kaltire'],
  },
  {
    id: 'belt',
    name: 'Drive belt inspection',
    view: 'engine',
    spot: 'belt',
    km: () => 100000,
    months: () => 84,
    applies: hasEngine,
    why: 'The serpentine belt drives the alternator, A/C and often the water pump. A snapped belt leaves you stranded.',
    materials: () => ['Replacement belt (if cracked)', 'Belt tensioner tool'],
    costs: { kaltire: [150, 260], dealer: [180, 320] },
    video: 'serpentine belt inspection',
    bookWith: ['kaltire', 'dealer'],
  },
  {
    id: 'trans-fluid',
    name: 'Transmission fluid',
    view: 'engine',
    spot: 'trans',
    km: (s) => (s.transmission === 'cvt' ? 50000 : 96000),
    months: (s) => (s.transmission === 'cvt' ? 48 : 72),
    applies: (s) => hasEngine(s) && s.transmission !== 'single-speed',
    why: 'Transmission fluid cools and protects the gears. CVTs are especially sensitive to old fluid. A rebuild costs thousands.',
    materials: (s) => [s.transmission === 'cvt' ? 'Manufacturer CVT fluid (not universal)' : s.transmission === 'manual' ? 'Manual gearbox oil (see manual)' : 'Manufacturer ATF', 'New drain plug washer'],
    costs: { mrlube: [180, 300], dealer: [220, 420] },
    video: 'transmission fluid change',
    bookWith: ['dealer', 'mrlube'],
  },
  {
    id: 'timing-belt',
    name: 'Timing belt',
    view: 'engine',
    spot: 'timing',
    km: () => 160000,
    months: () => 120,
    applies: (s) => hasEngine(s) && s.timingBelt,
    why: 'If a timing belt snaps, many engines suffer major internal damage. Usually replaced together with the water pump.',
    materials: () => ['Timing belt kit with tensioner and water pump'],
    costs: { dealer: [700, 1400] },
    video: 'timing belt replacement',
    bookWith: ['dealer'],
  },
  {
    id: 'washer',
    name: 'Washer fluid',
    view: 'engine',
    spot: 'washer',
    km: () => 3000,
    months: () => 2,
    applies: always,
    why: 'Slush and road salt make visibility a safety issue. Use -40°C rated fluid in winter.',
    materials: () => ['4 L jug of -40°C windshield washer fluid'],
    costs: { mrlube: [8, 15] },
    diy: {
      difficulty: 'Easy',
      minutes: 2,
      cost: [4, 8],
      steps: [
        'Open the hood and find the reservoir cap with the windshield spray symbol.',
        'Pour in washer fluid until it reaches the neck.',
        'Close the cap and test the sprayers.',
      ],
    },
    video: 'refill windshield washer fluid',
    dashWarning: 'Most cars show a low washer fluid light.',
    bookWith: ['mrlube'],
  },

  // ---------- Top view ----------
  {
    id: 'cabin-filter',
    name: 'Cabin air filter',
    view: 'top',
    spot: 'cabin',
    km: () => 24000,
    months: () => 12,
    applies: always,
    why: 'Filters dust and pollen from the air you breathe. A clogged filter weakens the heater, A/C and defroster.',
    materials: () => ['Cabin air filter for your model (charcoal type recommended)'],
    costs: { mrlube: [50, 85], kaltire: [50, 85], dealer: [70, 130] },
    diy: {
      difficulty: 'Easy',
      minutes: 10,
      cost: [20, 45],
      steps: [
        'Empty the glovebox and release its side stops so it swings down.',
        'Unclip the filter cover behind it.',
        'Slide the old filter out, noting the airflow arrow.',
        'Slide the new filter in with the arrow the same way, then refit the cover and glovebox.',
      ],
    },
    video: 'cabin air filter replacement',
    bookWith: ['mrlube', 'kaltire', 'dealer'],
  },
  {
    id: 'wipers',
    name: 'Wiper blades',
    view: 'top',
    spot: 'wipers',
    km: () => 0,
    months: () => 12,
    applies: always,
    why: 'Blades harden in the cold and streak. Winter blades handle ice and snow better.',
    materials: () => ['Driver and passenger wiper blades (sizes in the owner’s manual or store lookup)', 'Rear blade if equipped'],
    costs: { mrlube: [40, 80], kaltire: [40, 80], dealer: [60, 110] },
    diy: {
      difficulty: 'Easy',
      minutes: 10,
      cost: [25, 60],
      steps: [
        'Lift the wiper arm off the glass. Put a towel on the windshield in case the arm snaps back.',
        'Press the release tab and slide the old blade off the hook.',
        'Slide the new blade on until it clicks, then lower the arm gently.',
      ],
    },
    video: 'wiper blade replacement',
    bookWith: ['mrlube', 'kaltire'],
  },
  {
    id: 'lights',
    name: 'Lights check',
    view: 'top',
    spot: 'headlights',
    km: () => 0,
    months: () => 3,
    applies: always,
    why: 'A burnt-out headlight, brake light or signal is a safety risk and a ticket waiting to happen.',
    materials: () => ['Replacement bulb if one is out (see manual for bulb type)'],
    costs: { mrlube: [0, 40], dealer: [30, 120] },
    diy: {
      difficulty: 'Easy',
      minutes: 5,
      cost: [0, 30],
      steps: [
        'Park facing a wall or garage door at dusk.',
        'Turn on low beams, high beams, signals and hazards and check each one.',
        'Ask someone to press the brake while you check the rear, or back up to a reflective surface.',
      ],
    },
    video: 'headlight bulb replacement',
    bookWith: ['mrlube', 'dealer'],
  },
  {
    id: 'rotation',
    name: 'Tire rotation',
    view: 'top',
    spot: 'wheelFL',
    km: () => 10000,
    months: () => 12,
    applies: always,
    why: 'Front tires wear faster. Rotating evens out wear so the set lasts longer. If you swap seasonal tires, rotate at each swap.',
    materials: () => ['Jack, jack stands, torque wrench'],
    costs: { kaltire: [30, 60], dealer: [40, 90] },
    costNote: 'Often included free with a seasonal tire swap.',
    diy: {
      difficulty: 'Moderate',
      minutes: 45,
      cost: [0, 0],
      steps: [
        'Loosen the lug nuts slightly while the car is on the ground.',
        'Raise the car and support it on jack stands at the factory lift points.',
        'Move the tires in the pattern from your manual (usually front to back on the same side).',
        'Hand-tighten the nuts, lower the car, then torque in a star pattern. Re-check after 100 km.',
      ],
    },
    video: 'tire rotation',
    bookWith: ['kaltire', 'dealer'],
  },
  {
    id: 'alignment',
    name: 'Wheel alignment',
    view: 'top',
    spot: 'wheelFR',
    km: () => 40000,
    months: () => 24,
    applies: always,
    why: 'Potholes knock wheels out of alignment, causing uneven tire wear and pulling to one side.',
    materials: () => ['Done on an alignment rack'],
    costs: { kaltire: [100, 170], dealer: [130, 220] },
    video: 'signs you need a wheel alignment',
    bookWith: ['kaltire', 'dealer'],
  },

  // ---------- Side view ----------
  {
    id: 'tire-swap',
    name: 'Seasonal tire swap',
    view: 'side',
    spot: 'wheelFront',
    km: () => 0,
    months: () => 6,
    seasonal: true,
    applies: (s) => s.tireSetup === 'seasonal',
    why: 'Winter tires grip far better below 7°C. Put them on around mid-October and switch back around mid-April.',
    materials: (s) => [`Second set of tires on rims (${s.tireSize})`, 'Torque wrench'],
    costs: { kaltire: [80, 140], dealer: [100, 170] },
    costNote: 'Price for tires already on rims. Mounting and balancing on one set of rims is about $120 to $200.',
    diy: {
      difficulty: 'Moderate',
      minutes: 60,
      cost: [0, 0],
      steps: [
        'Loosen lug nuts slightly on the ground, then lift one corner at a time onto a jack stand.',
        'Swap the wheel, hand-tighten, lower and torque in a star pattern to spec.',
        'Set tire pressures to the door-jamb sticker with the tires cold.',
        'Re-torque after 100 km. Store the off-season set in tire bags, lying flat or on a rack.',
      ],
    },
    video: 'how to change a tire',
    bookWith: ['kaltire', 'dealer'],
  },
  {
    id: 'tire-check',
    name: 'Tire pressure & tread',
    view: 'side',
    spot: 'tireRear',
    km: () => 0,
    months: () => 1,
    applies: always,
    why: 'Pressure drops about 1 PSI for every 5°C. Under-inflated tires wear out fast and hurt fuel economy.',
    materials: () => ['Tire pressure gauge', 'A toonie for checking tread depth'],
    costs: { kaltire: [0, 0], mrlube: [0, 0] },
    costNote: 'Free at most tire shops.',
    diy: {
      difficulty: 'Easy',
      minutes: 10,
      cost: [0, 0],
      steps: [
        'Check pressures cold, before driving, using the numbers on the driver door-jamb sticker.',
        'Insert a toonie into the tread: if the tread does not reach the bottom of the polar bear’s paws, tires are getting worn.',
        'Look for bulges, cracks or nails in the sidewalls and tread.',
      ],
    },
    video: 'check tire pressure and tread depth',
    dashWarning: 'Your tire pressure light (TPMS) comes on when a tire is low.',
    bookWith: ['kaltire'],
  },
  {
    id: 'tires',
    name: 'Tire replacement',
    view: 'side',
    spot: 'wheelRear',
    km: () => 70000,
    months: () => 72,
    applies: always,
    why: 'Tires lose grip as tread wears and rubber ages, even with plenty of tread left after about 6 years.',
    materials: (s) => [`Set of 4 tires, size ${s.tireSize}`, 'Mount, balance and new valve stems'],
    costs: { kaltire: [700, 1400], dealer: [850, 1700] },
    costNote: 'Varies a lot by tire size and brand.',
    video: 'how to read tire size and buy tires',
    bookWith: ['kaltire', 'dealer'],
  },
  {
    id: 'brakes',
    name: 'Brake pads & rotors',
    view: 'side',
    spot: 'brakes',
    km: () => 20000,
    months: () => 12,
    applies: always,
    why: 'Road salt seizes calipers and wears pads unevenly. A yearly inspection catches problems before they reach the rotors.',
    materials: () => ['Inspection: free at many shops', 'If worn: pads and rotors per axle'],
    costs: { kaltire: [0, 60], dealer: [80, 150] },
    costNote: 'Inspection price. Replacing pads and rotors is about $300 to $650 per axle.',
    video: 'brake pad inspection',
    bookWith: ['kaltire', 'dealer'],
  },
  {
    id: 'suspension',
    name: 'Shocks & struts check',
    view: 'side',
    spot: 'suspension',
    km: () => 80000,
    months: () => 60,
    applies: always,
    why: 'Worn shocks increase stopping distance and make the car bounce or nose-dive when braking.',
    materials: () => ['Inspection on a hoist'],
    costs: { kaltire: [0, 80], dealer: [80, 150] },
    costNote: 'Inspection price. Replacing a pair of struts runs about $800 to $1,600.',
    video: 'signs of bad shocks and struts',
    bookWith: ['kaltire', 'dealer'],
  },
  {
    id: 'diff-fluid',
    name: 'Differential fluid',
    view: 'side',
    spot: 'diff',
    km: () => 50000,
    months: () => 48,
    applies: (s) => s.drivetrain === 'awd' || s.drivetrain === '4wd' || s.drivetrain === 'rwd',
    why: 'AWD, 4WD and rear-drive vehicles have differentials (and often a transfer case) whose gear oil breaks down.',
    materials: () => ['Gear oil as specified (often 75W-90)'],
    costs: { mrlube: [100, 180], dealer: [150, 280] },
    video: 'differential fluid change',
    bookWith: ['mrlube', 'dealer'],
  },
  {
    id: 'rust',
    name: 'Rust protection',
    view: 'side',
    spot: 'rocker',
    km: () => 0,
    months: () => 12,
    applies: always,
    why: 'Road salt eats underbodies, brake lines and rocker panels. An annual oil spray in the fall pays for itself at resale.',
    materials: () => ['Annual oil-based rust spray (e.g. Krown, Rust Check)'],
    costs: { dealer: [130, 200] },
    costNote: 'Specialty shops such as Krown charge about $140 to $180.',
    video: 'rust proofing car canada',
    bookWith: ['dealer'],
  },
]

export const TASKS_BY_ID = Object.fromEntries(TASKS.map((t) => [t.id, t])) as Record<string, TaskDef>

export function tasksFor(specs: CarSpecs, view?: ViewId) {
  return TASKS.filter((t) => t.applies(specs) && (!view || t.view === view))
}

/** Bigger vehicles cost more to service */
export function costFactor(specs: CarSpecs) {
  if (specs.bodyType === 'truck') return 1.15
  if (specs.bodyType === 'suv') return 1.05
  return 1
}
