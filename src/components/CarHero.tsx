import { useEffect } from 'react'
import { SideView } from '../art/CarArt'
import { fetchWikiPhoto } from '../lib/photos'
import { setWikiPhoto } from '../store'
import type { Car } from '../types'

const pending = new Set<string>()

/** Look up the model's Wikipedia photo once per car. */
export function useWikiPhoto(car: Car | undefined) {
  useEffect(() => {
    if (!car || car.wikiPhoto !== undefined || pending.has(car.id) || !navigator.onLine) return
    pending.add(car.id)
    fetchWikiPhoto(car.make, car.model).then((w) => {
      pending.delete(car.id)
      // Only remember "no photo" when we were online, so a dropped connection gets another try.
      if (w || navigator.onLine) setWikiPhoto(car.id, w)
    })
  }, [car])
}

/** The car's best picture: your own side photo, then the model's Wikipedia photo, then the drawing. */
export function CarHero({ car, creditLink = true }: { car: Car; creditLink?: boolean }) {
  useWikiPhoto(car)
  const own = car.photos?.side
  const wiki = car.wikiPhoto
  if (own) {
    return (
      <div className="hero-photo">
        <img src={own.src} alt={`Your ${car.make} ${car.model}`} />
      </div>
    )
  }
  if (wiki) {
    return (
      <div className="hero-photo">
        <img src={wiki.src} alt={`${car.make} ${car.model}`} loading="lazy" referrerPolicy="no-referrer" />
        {creditLink ? (
          <a className="photo-credit" href={wiki.page} target="_blank" rel="noreferrer">
            Photo: {wiki.credit}{wiki.license ? `, ${wiki.license}` : ''} · Wikimedia Commons
          </a>
        ) : (
          <span className="photo-credit">Photo: {wiki.credit}{wiki.license ? `, ${wiki.license}` : ''}</span>
        )}
      </div>
    )
  }
  return <SideView body={car.specs.bodyType} color={car.color} />
}
