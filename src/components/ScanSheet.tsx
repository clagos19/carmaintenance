import { useEffect, useState } from 'react'
import { TASKS_BY_ID } from '../data/tasks'
import { km } from '../lib/format'
import { ScanError, getApiKey, prepareImage, scanReceipt, setApiKey, type ScanMatch, type ScanResult } from '../lib/scan'
import { applyReceipt, setOdometer } from '../store'
import type { Car } from '../types'
import { IconCheck } from './Icons'
import { Sheet } from './Sheet'

type Phase = 'key' | 'pick' | 'reading' | 'review' | 'done' | 'error'

const today = () => new Date().toISOString().slice(0, 10)

export function ScanSheet({ car, open, onClose }: { car: Car; open: boolean; onClose: () => void }) {
  const [phase, setPhase] = useState<Phase>('pick')
  const [key, setKey] = useState('')
  const [preview, setPreview] = useState('')
  const [result, setResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState('')
  const [picked, setPicked] = useState<string[]>([])
  const [odo, setOdo] = useState('')
  const [date, setDate] = useState(today())
  const [doneCount, setDoneCount] = useState(0)

  useEffect(() => {
    if (open) {
      setPhase(getApiKey() ? 'pick' : 'key')
      setPreview('')
      setResult(null)
      setError('')
    }
  }, [open])

  const onFile = async (file: File | undefined) => {
    if (!file) return
    setError('')
    try {
      const img = await prepareImage(file)
      setPreview(img.preview)
      setPhase('reading')
      const r = await scanReceipt(car, img.data, getApiKey())
      setResult(r)
      setPicked(r.performed.filter((m) => m.confidence !== 'low').map((m) => m.taskId))
      setOdo(r.odometerKm ? r.odometerKm.toLocaleString('en-CA') : car.odometerKm.toLocaleString('en-CA'))
      setDate(r.date && /^\d{4}-\d{2}-\d{2}$/.test(r.date) ? r.date : today())
      setPhase('review')
    } catch (e) {
      setError(e instanceof ScanError || e instanceof Error ? e.message : 'Something went wrong. Try again.')
      setPhase('error')
    }
  }

  const apply = () => {
    if (!result) return
    const kmVal = parseInt(odo.replace(/\D/g, ''), 10) || car.odometerKm
    if (kmVal > car.odometerKm) setOdometer(car.id, kmVal)
    applyReceipt(
      car.id,
      {
        date: new Date(date + 'T12:00:00').toISOString(),
        shop: result.shop,
        total: result.total,
        summary: result.summary,
        taskIds: picked,
        scannedAt: new Date().toISOString(),
      },
      kmVal,
    )
    setDoneCount(picked.length)
    setPhase('done')
  }

  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))

  return (
    <Sheet open={open} onClose={onClose} title="Scan a receipt">
      <div className="stack-sm">
        {phase === 'key' && (
          <>
            <p>Take a photo of a receipt, work order or parts purchase. Claude reads it and offers to update your maintenance tasks.</p>
            <p className="small muted">
              Scanning uses your own Anthropic API key, stored only on this phone. Each scan costs about a cent. Create a key at{' '}
              <a className="link-btn" href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer">console.anthropic.com</a>.
            </p>
            <label className="field">
              <span>Anthropic API key</span>
              <input value={key} onChange={(e) => setKey(e.target.value)} placeholder="sk-ant-…" autoComplete="off" spellCheck={false} />
            </label>
            <button className="btn btn-primary btn-block" disabled={!key.trim().startsWith('sk-')} onClick={() => { setApiKey(key); setPhase('pick') }}>
              Save key
            </button>
          </>
        )}

        {phase === 'pick' && (
          <>
            <p className="muted">Lay the receipt flat in good light so every line is readable.</p>
            <label className="scan-drop">
              <input type="file" accept="image/*" capture="environment" hidden onChange={(e) => onFile(e.target.files?.[0])} />
              <span className="scan-drop-icon"><CameraIcon /></span>
              <strong>Take a photo</strong>
            </label>
            <label className="btn btn-soft btn-block">
              <input type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0])} />
              Choose from Photos
            </label>
            <button className="link-btn center" onClick={() => { setApiKey(''); setKey(''); setPhase('key') }}>Change API key</button>
          </>
        )}

        {phase === 'reading' && (
          <div className="scan-reading">
            {preview && <img src={preview} alt="Receipt" />}
            <div className="scan-beam" />
            <p className="center muted">Reading your receipt…</p>
          </div>
        )}

        {phase === 'error' && (
          <>
            <div className="banner banner-red">{error}</div>
            <button className="btn btn-primary btn-block" onClick={() => setPhase('pick')}>Try another photo</button>
          </>
        )}

        {phase === 'review' && result && (
          <>
            {!result.isServiceDocument ? (
              <div className="banner banner-amber">This doesn’t look like a car service or parts receipt. Try another photo.</div>
            ) : (
              <div className="receipt-card">
                {preview && <img src={preview} alt="" />}
                <div className="row-main">
                  <div className="row-title">{result.shop ?? 'Unknown shop'}</div>
                  <div className="row-sub">{result.total !== null ? `$${result.total.toFixed(2)}` : 'Total not found'}</div>
                  <p className="small">{result.summary}</p>
                </div>
              </div>
            )}

            {result.performed.length > 0 && (
              <>
                <h3>Mark these as done?</h3>
                <div className="list card inset">
                  {result.performed.map((m) => (
                    <MatchRow key={m.taskId} m={m} checked={picked.includes(m.taskId)} onToggle={() => toggle(m.taskId)} />
                  ))}
                </div>
                <div className="grid-2">
                  <label className="field">
                    <span>Odometer (km)</span>
                    <input inputMode="numeric" value={odo} onChange={(e) => setOdo(e.target.value)} />
                  </label>
                  <label className="field">
                    <span>Date</span>
                    <input type="date" value={date} max={today()} onChange={(e) => setDate(e.target.value)} />
                  </label>
                </div>
                {!result.odometerKm && <p className="tiny muted">No odometer reading on the receipt, so we used your current kilometers.</p>}
              </>
            )}

            {result.recommended.length > 0 && (
              <>
                <h3>The shop also recommended</h3>
                <ul className="bullets">
                  {result.recommended.map((m) => (
                    <li key={m.taskId}>{TASKS_BY_ID[m.taskId]?.name} <span className="muted small">“{m.evidence}”</span></li>
                  ))}
                </ul>
              </>
            )}

            {result.isServiceDocument && result.performed.length === 0 && (
              <p className="muted">We couldn’t match anything on this receipt to your maintenance list.</p>
            )}

            <button className="btn btn-primary btn-block" disabled={!picked.length} onClick={apply}>
              <IconCheck /> Update {picked.length} task{picked.length === 1 ? '' : 's'}
            </button>
            <button className="btn btn-soft btn-block" onClick={() => setPhase('pick')}>Scan a different photo</button>
          </>
        )}

        {phase === 'done' && (
          <>
            <div className="banner banner-green">
              <IconCheck />
              <div>
                <strong>Updated {doneCount} task{doneCount === 1 ? '' : 's'}.</strong>
                <div className="small">Logged at {km(parseInt(odo.replace(/\D/g, ''), 10) || car.odometerKm)}. The receipt is saved under this car.</div>
              </div>
            </div>
            <button className="btn btn-primary btn-block" onClick={onClose}>Done</button>
          </>
        )}
      </div>
    </Sheet>
  )
}

function MatchRow({ m, checked, onToggle }: { m: ScanMatch; checked: boolean; onToggle: () => void }) {
  return (
    <label className="row check-row">
      <input type="checkbox" checked={checked} onChange={onToggle} />
      <div className="row-main">
        <div className="row-title">{TASKS_BY_ID[m.taskId]?.name ?? m.taskId}</div>
        <div className="row-sub">“{m.evidence}”</div>
      </div>
      {m.confidence !== 'high' && <span className="src src-assumed">{m.confidence === 'medium' ? 'Likely' : 'Unsure'}</span>}
    </label>
  )
}

function CameraIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.2l1.3-2h6l1.3 2h1.2A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5z" />
      <circle cx="12" cy="12.5" r="3.5" />
    </svg>
  )
}
