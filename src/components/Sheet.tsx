import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { IconClose } from './Icons'

export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title?: ReactNode; children: ReactNode }) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null
  return createPortal(
    <div className="sheet-wrap" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-grip" />
        <div className="sheet-head">
          <div className="sheet-title">{title}</div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <IconClose />
          </button>
        </div>
        <div className="sheet-body">{children}</div>
      </div>
    </div>,
    document.body,
  )
}
