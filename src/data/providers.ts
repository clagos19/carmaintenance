import type { Provider } from '../types'

export interface ProviderInfo {
  id: Provider
  name: string
  blurb: string
  site: (make: string) => string
  mapsQuery: (make: string) => string
}

export const PROVIDERS: Record<Provider, ProviderInfo> = {
  mrlube: {
    id: 'mrlube',
    name: 'Mr. Lube',
    blurb: 'Quick fluid and filter services, usually no appointment needed.',
    site: () => 'https://www.mrlube.com/',
    mapsQuery: () => 'Mr. Lube',
  },
  kaltire: {
    id: 'kaltire',
    name: 'Kal Tire',
    blurb: 'Tires, seasonal swaps, brakes, alignment and batteries.',
    site: () => 'https://www.kaltire.com/',
    mapsQuery: () => 'Kal Tire',
  },
  dealer: {
    id: 'dealer',
    name: 'Dealer',
    blurb: 'Factory-trained techs and OEM parts for major jobs.',
    site: (make) => `https://www.google.com/search?q=${encodeURIComponent(`${make} dealer service appointment near me`)}`,
    mapsQuery: (make) => `${make} dealer`,
  },
}

export function mapsUrl(query: string) {
  return `https://maps.apple.com/?q=${encodeURIComponent(query)}`
}
