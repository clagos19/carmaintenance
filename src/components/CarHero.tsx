import { SideView } from '../art/CarArt'
import type { Car } from '../types'

/** The car's picture: your own side photo if you added one, otherwise the drawing. */
export function CarHero({ car }: { car: Car }) {
  const own = car.photos?.side
  if (own) {
    return (
      <div className="hero-photo">
        <img src={own.src} alt={`Your ${car.make} ${car.model}`} />
      </div>
    )
  }
  return <SideView body={car.specs.bodyType} color={car.color} />
}
