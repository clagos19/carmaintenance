import { useEffect, useState } from 'react'
import { NUMERIC_SPECS, SPEC_LABELS, SPEC_OPTIONS, formatSpec } from '../lib/specs'
import { confirmSpec, setSpec } from '../store'
import type { Car, CarSpecs, SpecKey } from '../types'
import { Sheet } from './Sheet'
import { SourceTag } from './bits'

const HELP: Partial<Record<SpecKey, string>> = {
  drivingStyle: 'Most Canadian driving counts as severe: short trips, cold starts, salt and slush. Severe shortens oil change intervals.',
  tireSetup: 'With winter and summer sets we remind you to swap in mid-October and mid-April.',
  annualKm: 'Used to estimate when km-based jobs will come due.',
  oilIntervalKm: 'Your oil life monitor or owner’s manual has the exact number.',
  bodyType: 'Changes the pictures and some cost estimates.',
}

export function SpecEditor({ car, specKey, onClose }: { car: Car; specKey: SpecKey | null; onClose: () => void }) {
  const [v, setV] = useState('')
  useEffect(() => {
    if (specKey) setV(String(car.specs[specKey]))
  }, [specKey, car.specs])
  if (!specKey) return null

  const opts = SPEC_OPTIONS[specKey]
  const numeric = NUMERIC_SPECS.includes(specKey)
  const save = () => {
    let value: CarSpecs[SpecKey] = v
    if (numeric) value = parseFloat(v.replace(/[^\d.]/g, '')) || 0
    if (specKey === 'timingBelt') value = v === 'true'
    if (String(value) === String(car.specs[specKey])) confirmSpec(car.id, specKey)
    else setSpec(car.id, specKey, value as never)
    onClose()
  }

  return (
    <Sheet open onClose={onClose} title={SPEC_LABELS[specKey]}>
      <div className="stack-sm">
        <div className="row">
          <div className="row-main">
            <div className="row-sub">Current value</div>
            <div className="row-title">{formatSpec(specKey, car.specs)}</div>
          </div>
          <SourceTag source={car.sources[specKey]} />
        </div>
        {HELP[specKey] && <p className="small muted">{HELP[specKey]}</p>}
        {opts ? (
          <div className="option-list">
            {opts.map((o) => (
              <button key={o.value} className={`option ${v === o.value ? 'on' : ''}`} onClick={() => setV(o.value)}>
                {o.label}
              </button>
            ))}
          </div>
        ) : (
          <label className="field">
            <span>{SPEC_LABELS[specKey]}{specKey === 'oilCapacityL' ? ' (litres)' : numeric ? ' (km)' : ''}</span>
            <input value={v} inputMode={numeric ? 'decimal' : 'text'} onChange={(e) => setV(e.target.value)} />
          </label>
        )}
        <button className="btn btn-primary btn-block" onClick={save}>
          {String(car.specs[specKey]) === v ? 'This is correct' : 'Save'}
        </button>
      </div>
    </Sheet>
  )
}
