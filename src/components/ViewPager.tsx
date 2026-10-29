import { useEffect, useRef, useState } from 'react'
import { CarArt, SPOTS, VIEWBOX } from '../art/CarArt'
import { dueLine } from '../lib/format'
import { carTasks } from '../lib/status'
import type { Car, ViewId } from '../types'
import { StatusPill } from './bits'

const VIEWS: { id: ViewId; label: string }[] = [
  { id: 'top', label: 'Top' },
  { id: 'side', label: 'Side' },
  { id: 'engine', label: 'Engine' },
]

export function ViewPager({ car, onOpen }: { car: Car; onOpen: (taskId: string) => void }) {
  const [vi, setVi] = useState(1)
  const [active, setActive] = useState<Record<ViewId, number>>({ top: 0, side: 0, engine: 0 })
  const pager = useRef<HTMLDivElement>(null)
  const rail = useRef<HTMLDivElement>(null)
  const view = VIEWS[vi].id
  const tasks = carTasks(car, view)
  const ai = Math.min(active[view], Math.max(0, tasks.length - 1))

  // Start on the side view.
  useEffect(() => {
    const el = pager.current
    if (el) el.scrollLeft = el.clientWidth
  }, [])

  const goView = (i: number) => {
    const el = pager.current
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' })
    setVi(i)
  }

  const onPagerScroll = () => {
    const el = pager.current
    if (!el) return
    const i = Math.round(el.scrollLeft / el.clientWidth)
    if (i !== vi) {
      setVi(i)
      rail.current?.scrollTo({ left: 0 })
    }
  }

  const cardStep = () => {
    const first = rail.current?.firstElementChild as HTMLElement | null
    return first ? first.offsetWidth + 12 : 1
  }

  const onRailScroll = () => {
    const el = rail.current
    if (!el) return
    const i = Math.max(0, Math.min(tasks.length - 1, Math.round(el.scrollLeft / cardStep())))
    if (i !== ai) setActive((a) => ({ ...a, [view]: i }))
  }

  const focus = (i: number) => {
    setActive((a) => ({ ...a, [view]: i }))
    rail.current?.scrollTo({ left: i * cardStep(), behavior: 'smooth' })
  }

  return (
    <section className="viewer">
      <div className="segmented" role="tablist">
        {VIEWS.map((v, i) => (
          <button key={v.id} role="tab" aria-selected={i === vi} className={i === vi ? 'on' : ''} onClick={() => goView(i)}>
            {v.label}
          </button>
        ))}
        <span className="segmented-thumb" style={{ transform: `translateX(${vi * 100}%)` }} />
      </div>

      <div className="pager" ref={pager} onScroll={onPagerScroll}>
        {VIEWS.map((v) => {
          const vt = carTasks(car, v.id)
          const box = VIEWBOX[v.id]
          return (
            <div key={v.id} className={`slide slide-${v.id}`}>
              <div className="art-wrap" style={{ aspectRatio: `${box.w} / ${box.h}` }}>
                <CarArt view={v.id} body={car.specs.bodyType} color={car.color} powertrain={car.specs.powertrain} />
                {vt.map((t, i) => {
                  const p = SPOTS[v.id][t.task.spot]
                  if (!p) return null
                  const on = v.id === view && i === ai
                  return (
                    <button
                      key={t.task.id}
                      className={`hotspot hs-${t.st.status} ${on ? 'on' : ''}`}
                      style={{ left: `${p.x}%`, top: `${p.y}%` }}
                      onClick={() => (on ? onOpen(t.task.id) : focus(i))}
                      aria-label={t.task.name}
                    >
                      <span className="hs-dot" />
                      {on && <span className={`hs-label ${p.x > 60 ? 'left' : ''}`}>{t.task.name}</span>}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <div className="rail" ref={rail} onScroll={onRailScroll}>
        {tasks.map((t, i) => (
          <button key={t.task.id} className={`task-card tc-${t.st.status} ${i === ai ? 'on' : ''}`} onClick={() => (i === ai ? onOpen(t.task.id) : focus(i))}>
            <div className="task-card-top">
              <StatusPill status={t.st.status} />
              <span className="muted tiny">{i + 1} / {tasks.length}</span>
            </div>
            <div className="task-card-name">{t.task.name}</div>
            <div className="task-card-due">{dueLine(t.st, car)}</div>
            <div className="task-card-more">
              {t.task.diy ? `DIY: ${t.task.diy.difficulty}` : 'Shop job'} · Details →
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}
