export type DialerCallState = 'idle' | 'dialing' | 'ringing' | 'connected' | 'ended' | 'failed' | 'paused'
export type DialerQueueStatus = 'queued' | 'dialing' | 'connected' | 'no_answer' | 'busy' | 'wrong_number' | 'voicemail' | 'callback' | 'completed' | 'skipped' | 'dnc' | 'failed'
export type DialerEventType = 'initiated' | 'ringing' | 'connected' | 'ended' | 'missed' | 'failed' | 'rejected' | 'no_answer' | 'callback_detected'

export interface DialerQueueItem {
  id: string
  campaignId: string
  leadId: string
  personId: string
  phoneId: string
  attemptCount: number
  status: DialerQueueStatus
  nextAttemptAt: string | null
}

export interface DialerSession {
  id: string
  campaignId: string
  agentId: string
  status: 'running' | 'paused' | 'stopped'
  currentQueueItemId: string | null
  deviceId: string | null
}

export interface DialerEvent {
  sessionId?: string
  queueItemId?: string
  leadId?: string
  personId?: string
  callId?: string
  agentId?: string
  direction: 'inbound' | 'outbound'
  eventType: DialerEventType
  normalizedPhone?: string
  externalEventId?: string
  durationSeconds?: number
  rawPayload?: Record<string, unknown>
}

export interface DialerCapabilities {
  cellularCalling: boolean
  callStateEvents: boolean
  inboundCallEvents: boolean
  continuousAutomaticDialing: boolean
  backgroundExecution: boolean
}

export interface DialerTransport {
  getCapabilities(): Promise<DialerCapabilities>
  makeCall(input: { phoneNumber: string; queueItemId: string; sessionId: string }): Promise<void>
  hangUp(): Promise<void>
  start(): Promise<void>
  stop(): Promise<void>
}

export function shouldAutoAdvance(status: DialerQueueStatus): boolean {
  return ['no_answer', 'busy', 'wrong_number', 'voicemail', 'failed', 'skipped', 'dnc'].includes(status)
}
