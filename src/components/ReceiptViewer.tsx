import { useEffect, useState } from 'react'
import { TASKS_BY_ID } from '../data/tasks'
import { dayMonth } from '../lib/format'
import { getReceiptImage } from '../lib/receiptImages'
import type { Receipt } from '../types'
import { Sheet } from './Sheet'

/** A scanned receipt with its saved photo. */
export function ReceiptViewer({ receipt, onClose }: { receipt: Receipt | null; onClose: () => void }) {
  const [src, setSrc] = useState<string | null>(null)
  const [missing, setMissing] = useState(false)
  const [zoom, setZoom] = useState(false)

  useEffect(() => {
    setSrc(null)
    setMissing(false)
    setZoom(false)
    if (!receipt?.id || !receipt.hasImage) return
    let live = true
    getReceiptImage(receipt.id)
      .then((s) => live && (s ? setSrc(s) : setMissing(true)))
      .catch(() => live && setMissing(true))
    return () => {
      live = false
    }
  }, [receipt])

  if (!receipt) return <Sheet open={false} onClose={onClose}>{null}</Sheet>

  const fileName = `receipt-${receipt.date.slice(0, 10)}${receipt.shop ? `-${receipt.shop.replace(/[^\w]+/g, '-').toLowerCase()}` : ''}.jpg`

  // On iPhone the share sheet offers "Save Image", which puts the photo in the Photos app.
  const share = async () => {
    if (!src) return
    try {
      const blob = await (await fetch(src)).blob()
      const file = new File([blob], fileName, { type: 'image/jpeg' })
      if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], title: receipt.shop ?? 'Receipt' })
      else {
        const a = document.createElement('a')
        a.href = src
        a.download = fileName
        a.click()
      }
    } catch {
      /* the user closed the share sheet */
    }
  }

  return (
    <Sheet open onClose={onClose} title={receipt.shop ?? 'Receipt'}>
      <div className="stack-sm">
        <div className="receipt-meta">
          <span>{dayMonth(receipt.date)}</span>
          {receipt.total !== null && <strong>${receipt.total.toFixed(2)}</strong>}
        </div>
        {receipt.taskIds.length > 0 && (
          <div className="pills">
            {receipt.taskIds.map((t) => (
              <span key={t} className="pill pill-green">{TASKS_BY_ID[t]?.name ?? t}</span>
            ))}
          </div>
        )}
        {receipt.summary && <p className="small">{receipt.summary}</p>}

        {src ? (
          <>
            <div className={`receipt-photo ${zoom ? 'zoom' : ''}`} role="button" tabIndex={0} onClick={() => setZoom((z) => !z)} aria-label={zoom ? 'Fit photo' : 'Zoom photo'}>
              <img src={src} alt={`Receipt from ${receipt.shop ?? 'the shop'}`} />
            </div>
            <p className="tiny muted center">Tap the photo to {zoom ? 'fit it' : 'zoom in'}.</p>
            <button className="btn btn-soft btn-block" onClick={share}>
              Save to Photos or share
            </button>
          </>
        ) : receipt.hasImage && !missing ? (
          <div className="receipt-photo loading" />
        ) : (
          <p className="small muted">{missing ? 'The photo for this receipt isn’t on this phone any more.' : 'No photo was kept for this receipt.'}</p>
        )}
      </div>
    </Sheet>
  )
}
