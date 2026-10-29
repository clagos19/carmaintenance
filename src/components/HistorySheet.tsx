import { TASKS_BY_ID } from '../data/tasks'
import { dayMonth, km } from '../lib/format'
import { findReceipt } from '../store'
import type { Car, Receipt } from '../types'
import { IconChevron, IconReceipt } from './Icons'
import { Sheet } from './Sheet'

/** Every job done on this car, newest first, with the date and the kilometers at the time. */
export function serviceLog(car: Car) {
  return Object.entries(car.history)
    .flatMap(([taskId, recs]) => recs.map((r) => ({ taskId, ...r })))
    .filter((r) => TASKS_BY_ID[r.taskId])
    .sort((a, b) => b.date.localeCompare(a.date) || b.km - a.km)
}

export function HistorySheet({ car, open, onClose, onOpen, onReceipt }: { car: Car; open: boolean; onClose: () => void; onOpen: (taskId: string) => void; onReceipt: (r: Receipt) => void }) {
  const log = serviceLog(car)
  const years = [...new Set(log.map((r) => new Date(r.date).getFullYear()))]
  return (
    <Sheet open={open} onClose={onClose} title="Service history">
      {log.length === 0 ? (
        <p className="muted">Nothing logged yet. When you mark a job as done, or scan a receipt, it shows up here with the date and your kilometers at the time.</p>
      ) : (
        <div className="stack-sm">
          <p className="small muted">
            {log.length} service{log.length === 1 ? '' : 's'} logged. Tap one to see the job, or Receipt to see the photo.
          </p>
          {years.map((y) => (
            <section key={y} className="stack-sm">
              <h3 className="history-year">{y}</h3>
              <div className="card inset list">
                {log
                  .filter((r) => new Date(r.date).getFullYear() === y)
                  .map((r, i) => {
                    const receipt = findReceipt(car, r.receiptId)
                    return (
                    <div key={r.taskId + r.date + i} className="row history-row">
                    <button className="history-main" onClick={() => onOpen(r.taskId)}>
                      <div className="history-date">
                        <span>{new Date(r.date).toLocaleDateString('en-CA', { month: 'short' })}</span>
                        <strong>{new Date(r.date).getDate()}</strong>
                      </div>
                      <div className="row-main">
                        <div className="row-title">{TASKS_BY_ID[r.taskId].name}</div>
                        <div className="row-sub">
                          At {km(r.km)} · {dayMonth(r.date)}
                          {r.note ? ` · ${r.note}` : ''}
                        </div>
                      </div>
                    </button>
                    {receipt ? (
                      <button className="receipt-btn" onClick={() => onReceipt(receipt)}>
                        <IconReceipt /> Receipt
                      </button>
                    ) : (
                      <IconChevron />
                    )}
                    </div>
                    )
                  })}
              </div>
            </section>
          ))}
        </div>
      )}
    </Sheet>
  )
}
