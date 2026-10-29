import type { SpecSource, Status } from '../types'

export const STATUS_LABEL: Record<Status, string> = { overdue: 'Due now', soon: 'Due soon', ok: 'Good', off: 'Alerts off' }

export function StatusDot({ status }: { status: Status }) {
  return <span className={`dot dot-${status}`} aria-label={STATUS_LABEL[status]} />
}

export function StatusPill({ status }: { status: Status }) {
  return <span className={`pill pill-${status === 'overdue' ? 'red' : status === 'soon' ? 'amber' : status === 'off' ? 'grey' : 'green'}`}>{STATUS_LABEL[status]}</span>
}

export const SOURCE_LABEL: Record<SpecSource, string> = { you: 'You', spec: 'Spec sheet', assumed: 'Assumed' }

export function SourceTag({ source }: { source: SpecSource }) {
  return <span className={`src src-${source}`}>{SOURCE_LABEL[source]}</span>
}
