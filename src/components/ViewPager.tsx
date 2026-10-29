import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { CarArt, SPOTS, VIEWBOX } from '../art/CarArt'
import { dueLine } from '../lib/format'
import { locateParts } from '../lib/photos'
import { getApiKey, prepareImage } from '../lib/scan'
import { carTasks } from '../lib/status'
import { setPhoto, setPhotoSpot, storageFull } from '../store'
import type { Car, ViewId } from '../types'
import { StatusPill } from './bits'

const CameraSmall = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.2l1.3-2h6l1.3 2h1.2A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5z" />
    <circle cx="12" cy="12.5" r="3.5" />
  </svg>
)

const PHOTO_PROMPT: Record<ViewId, string> = {
  top: 'Use a photo from above',
  side: 'Use a photo of your car',
  engine: 'Use a photo of your engine',
}

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
  const [adjust, setAdjust] = useState(false)
  const [busy, setBusy] = useState<ViewId | null>(null)
  const [note, setNote] = useState<{ text: string; err?: boolean } | null>(null)
  const photo = car.photos?.[view]

  const onPhoto = async (file: File | undefined) => {
    if (!file) return
    const v = view
    setBusy(v)
    setNote({ text: 'Placing the dots on your photo…' })
    try {
      const img = await prepareImage(file, 1200, 0.8)
      const key = getApiKey()
      let spots: Record<string, { x: number; y: number }> = {}
      let msg = ''
      if (key) {
        try {
          const r = await locateParts(car, v, img.data, key)
          spots = r.spots
          msg = r.missing.length ? `Couldn’t see ${r.missing.length} part${r.missing.length === 1 ? '' : 's'} in the photo. Use Adjust dots to place them.` : 'Dots placed. Use Adjust dots if any are off.'
        } catch {
          msg = 'Couldn’t place the dots automatically. Use Adjust dots to place them.'
        }
      } else {
        msg = 'Add your AI key (via the + button) to place dots automatically, or use Adjust dots.'
      }
      setPhoto(car.id, v, { src: img.preview, aspect: img.aspect, spots })
      setNote(storageFull ? { text: 'Your phone’s storage for this app is full, so the photo won’t be kept. Remove another photo first.', err: true } : { text: msg })
    } catch (e) {
      setNote({ text: e instanceof Error ? e.message : 'That photo could not be used.', err: true })
    } finally {
      setBusy(null)
    }
  }

  const place = (e: MouseEvent<HTMLDivElement>) => {
    if (!adjust || !photo || !tasks[ai]) return
    const r = e.currentTarget.getBoundingClientRect()
    setPhotoSpot(car.id, view, tasks[ai].task.spot, { x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 })
  }

  // Start on the side view.
  useEffect(() => {
    const el = pager.current
    if (el) el.scrollLeft = el.clientWidth
  }, [])

  const goView = (i: number) => {
    const el = pager.current
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' })
    setVi(i)
    setAdjust(false)
    setNote(null)
  }

  const onPagerScroll = () => {
    const el = pager.current
    if (!el) return
    const i = Math.round(el.scrollLeft / el.clientWidth)
    if (i !== vi) {
      setVi(i)
      setAdjust(false)
      setNote(null)
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
          const ph = car.photos?.[v.id]
          return (
            <div key={v.id} className={`slide slide-${v.id} ${ph ? 'has-photo' : ''}`}>
              <div
                className={`art-wrap ${ph ? 'photo-slide' : ''} ${adjust && v.id === view ? 'adjusting' : ''}`}
                style={{ aspectRatio: ph ? String(ph.aspect) : `${box.w} / ${box.h}` }}
                onClick={v.id === view ? place : undefined}
              >
                {ph ? <img src={ph.src} alt="" /> : <CarArt view={v.id} body={car.specs.bodyType} color={car.color} powertrain={car.specs.powertrain} />}
                {vt.map((t, i) => {
                  const p = ph ? ph.spots[t.task.spot] : SPOTS[v.id][t.task.spot]
                  if (!p) return null
                  const on = v.id === view && i === ai
                  return (
                    <button
                      key={t.task.id}
                      className={`hotspot hs-${t.st.status} ${on ? 'on' : ''}`}
                      style={{ left: `${p.x}%`, top: `${p.y}%` }}
                      onClick={(e) => {
                        if (adjust) return
                        e.stopPropagation()
                        if (on) onOpen(t.task.id)
                        else focus(i)
                      }}
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

      <div className="view-tools">
        <label className="tool-btn">
          <input type="file" accept="image/*" hidden disabled={!!busy} onChange={(e) => { onPhoto(e.target.files?.[0]); e.target.value = '' }} />
          <CameraSmall /> {busy === view ? 'Working…' : photo ? 'Retake photo' : PHOTO_PROMPT[view]}
        </label>
        {photo && (
          <>
            <button className={`tool-btn ${adjust ? 'on' : ''}`} onClick={() => setAdjust((a) => !a)}>
              {adjust ? 'Done adjusting' : 'Adjust dots'}
            </button>
            <button className="tool-btn" onClick={() => { setPhoto(car.id, view, null); setAdjust(false); setNote(null) }}>
              Use drawing
            </button>
          </>
        )}
      </div>
      {adjust && tasks[ai] ? (
        <p className="view-hint">Tap the photo where the {tasks[ai].task.name.toLowerCase()} is. Swipe the cards below to pick another part.</p>
      ) : (
        note && <p className={`view-hint ${note.err ? 'err' : ''}`}>{note.text}</p>
      )}

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
