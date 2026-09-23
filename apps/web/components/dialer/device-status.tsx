import type {
  DeviceConnectionState,
} from '@/lib/crm/dialer/types'

type Props = {
  state: DeviceConnectionState
}

const CONFIG = {
  connected: {
    label: 'Mobile connected',
    description: 'Your calling device is connected.',
    className:
      'border-emerald-200 bg-emerald-50 text-emerald-700',
  },

  disconnected: {
    label: 'Mobile disconnected',
    description:
      'The calling device has stopped reporting.',
    className:
      'border-destructive/20 bg-destructive/5 text-destructive',
  },

  waiting: {
    label: 'Waiting for mobile',
    description:
      'Start the dialer on your mobile device to connect.',
    className:
      'border-brand-gold/30 bg-brand-gold/5 text-brand-navy',
  },

  unknown: {
    label: 'Device status unavailable',
    description:
      'The device connection has not been established yet.',
    className:
      'border-border bg-muted/50 text-muted-foreground',
  },
} as const

export default function DeviceStatus({
  state,
}: Props) {
  const config = CONFIG[state]

  return (
    <div
      className={[
        'rounded-lg border p-4',
        config.className,
      ].join(' ')}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="mt-1 size-2.5 shrink-0 rounded-full bg-current"
        />

        <div>
          <p className="text-sm font-semibold">
            {config.label}
          </p>

          <p className="mt-1 text-xs opacity-80">
            {config.description}
          </p>
        </div>
      </div>
    </div>
  )
}