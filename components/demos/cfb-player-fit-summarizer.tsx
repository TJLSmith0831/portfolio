'use client'

import { useEffect, useRef, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

import cfb_teams from '../../data/cfb-teams.json'
import { LOADING_VERBS } from '@/data/loading-verbs'

const FBS_TEAMS: string[] = cfb_teams.FBS.flatMap(
  conference => conference.teams
).sort((a, b) => a.localeCompare(b, 'en-US'))

type RequestState = 'idle' | 'loading' | 'success' | 'error'

interface PlayerFitSummary {
  player: string
  team: string
  position: string
  fit_score: number
  scheme_fit: string
  depth_chart_impact: string
  development_outlook: string
  risk_factors: string[]
  overall_summary: string
}

interface JobStatusResponse {
  job_id: string
  status: 'completed' | 'failed' | 'pending' | 'running'
  result?: PlayerFitSummary | null
  error?: string | null
}

const POLL_INTERVAL_MS = 5000
const MAX_POLL_TIME_MS = 120_000

export function CfbPlayerFitSummarizerDemo() {
  const [playerName, setPlayerName] = useState('')
  const [team, setTeam] = useState<string | null>(null)
  const [requestState, setRequestState] = useState<RequestState>('idle')
  const [result, setResult] = useState<PlayerFitSummary | null>(null)
  const [errorCode, setErrorCode] = useState<string | null>(null)
  const [pollAttempt, setPollAttempt] = useState(0)
  const [elapsedMs, setElapsedMs] = useState(0)

  const pollTimerRef = useRef<NodeJS.Timeout | null>(null)
  const stopwatchRef = useRef<NodeJS.Timeout | null>(null)
  const pollStartRef = useRef<number | null>(null)

  function getLoadingVerb(attempt: number) {
    return LOADING_VERBS[attempt % LOADING_VERBS.length]
  }

  function formatElapsed(ms: number) {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    const tenths = Math.floor((ms % 1000) / 100)
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${tenths}`
  }

  function clearTimers() {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current)
      pollTimerRef.current = null
    }
    if (stopwatchRef.current) {
      clearInterval(stopwatchRef.current)
      stopwatchRef.current = null
    }
  }

  function clearInputs() {
    setPlayerName('')
    setTeam(null)
  }

  useEffect(() => {
    return () => clearTimers()
  }, [])

  async function pollJob(jobId: string) {
    try {
      setPollAttempt(prev => prev + 1)

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_PORTFOLIO_API_BASE}/jobs/${jobId}`
      )

      if (!res.ok) throw new Error('JOB_STATUS_ERROR')

      const data: JobStatusResponse = await res.json()

      if (data.status === 'completed') {
        clearTimers()
        setResult(data.result ?? null)
        setRequestState('success')
        clearInputs()
        return
      }

      if (data.status === 'failed') {
        clearTimers()
        setErrorCode(data.error ?? 'JOB_FAILED')
        setRequestState('error')
        clearInputs()
        return
      }

      if (
        pollStartRef.current &&
        Date.now() - pollStartRef.current > MAX_POLL_TIME_MS
      ) {
        clearTimers()
        setErrorCode('JOB_TIMEOUT')
        setRequestState('error')
        clearInputs()
      }
    } catch {
      clearTimers()
      setErrorCode('POLLING_ERROR')
      setRequestState('error')
      clearInputs()
    }
  }

  async function handleSubmit() {
    if (!playerName || !team || requestState === 'loading') return

    setRequestState('loading')
    setResult(null)
    setErrorCode(null)
    setPollAttempt(0)
    setElapsedMs(0)

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_PORTFOLIO_API_BASE}/summarize_player_fit`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            player_name: playerName,
            requested_team_name: team,
          }),
        }
      )

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.detail ?? 'UNKNOWN_ERROR')
      }

      const { job_id } = await res.json()

      pollStartRef.current = Date.now()

      stopwatchRef.current = setInterval(() => {
        if (pollStartRef.current) {
          setElapsedMs(Date.now() - pollStartRef.current)
        }
      }, 100)

      pollTimerRef.current = setInterval(() => {
        pollJob(job_id)
      }, POLL_INTERVAL_MS)
    } catch (err) {
      setErrorCode(err instanceof Error ? err.message : 'NETWORK_ERROR')
      setRequestState('error')
    }
  }

  function TeamCombobox() {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            role='combobox'
            className='flex-1 justify-between'
            disabled={requestState === 'loading'}
          >
            {team ?? 'Select FBS team'}
            <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align='start'
          side='top'
          className='p-0 min-w-[var(--radix-popover-trigger-width)] max-w-[var(--radix-popover-trigger-width)]'
        >
          <Command>
            <CommandInput placeholder='Search teams...' />
            <CommandEmpty>No team found.</CommandEmpty>
            <CommandGroup className='max-h-64 overflow-y-auto'>
              {FBS_TEAMS.map(teamName => (
                <CommandItem
                  key={teamName}
                  value={teamName}
                  onSelect={() => setTeam(teamName)}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      team === teamName ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {teamName}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    )
  }

  function PlayerFitSkeleton() {
    return (
      <div className='space-y-6 animate-pulse'>
        {/* Header */}
        <div className='flex items-start justify-between gap-4'>
          <div className='space-y-2'>
            <div className='h-5 w-48 rounded bg-muted' />
            <div className='h-4 w-32 rounded bg-muted' />
          </div>

          <div className='space-y-2 text-right'>
            <div className='h-8 w-12 rounded bg-muted' />
            <div className='h-3 w-16 rounded bg-muted' />
          </div>
        </div>

        {/* Overall Summary */}
        <div className='rounded-lg border bg-muted/30 p-4 space-y-2'>
          <div className='h-4 w-full rounded bg-muted' />
          <div className='h-4 w-[90%] rounded bg-muted' />
          <div className='h-4 w-[80%] rounded bg-muted' />
        </div>

        {/* Detail Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className='space-y-2'>
              <div className='h-4 w-32 rounded bg-muted' />
              <div className='h-3 w-full rounded bg-muted' />
              <div className='h-3 w-[85%] rounded bg-muted' />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <Card className='flex flex-col'>
      <div className='flex-1 p-6 overflow-y-auto'>
        {requestState === 'loading' ? (
          <div className='space-y-6'>
            <div className='text-center'>
              <div className='text-xl font-semibold animate-pulse'>
                {getLoadingVerb(pollAttempt)} {playerName} → {team}
              </div>
              <div className='text-sm text-muted-foreground'>
                Elapsed time: {formatElapsed(elapsedMs)}
              </div>
            </div>
            <PlayerFitSkeleton />
          </div>
        ) : !result ? (
          <div className='h-full flex items-center justify-center text-center'>
            <div className='max-w-md space-y-4'>
              <h4 className='text-xl font-semibold'>
                College Player Fit Evaluation
              </h4>
              <p className='text-muted-foreground leading-relaxed'>
                Please provide any college football player and select a team to
                evaluate how well they would fit within that program using AI.
              </p>
              {requestState === 'error' && (
                <p className='text-sm text-destructive'>Error: {errorCode}</p>
              )}
            </div>
          </div>
        ) : (
          <div className='space-y-6'>
            {/* Header */}
            <div className='flex items-start justify-between gap-4'>
              <div>
                <h4 className='text-xl font-semibold'>{result.player}</h4>
                <p className='text-sm text-muted-foreground'>
                  {result.position} · {result.team}
                </p>
              </div>

              <div className='text-right'>
                <div className='text-3xl font-bold'>{result.fit_score}</div>
                <div className='text-xs text-muted-foreground'>Fit Score</div>
              </div>
            </div>

            {/* Overall Summary */}
            <div className='rounded-lg border bg-muted/30 p-4'>
              <p className='text-sm leading-relaxed'>
                {result.overall_summary}
              </p>
            </div>

            {/* Detail Grid */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <h5 className='text-sm font-semibold mb-1'>Scheme Fit</h5>
                <p className='text-sm text-muted-foreground'>
                  {result.scheme_fit}
                </p>
              </div>

              <div>
                <h5 className='text-sm font-semibold mb-1'>
                  Depth Chart Impact
                </h5>
                <p className='text-sm text-muted-foreground'>
                  {result.depth_chart_impact}
                </p>
              </div>

              <div>
                <h5 className='text-sm font-semibold mb-1'>
                  Development Outlook
                </h5>
                <p className='text-sm text-muted-foreground'>
                  {result.development_outlook}
                </p>
              </div>

              <div>
                <h5 className='text-sm font-semibold mb-1'>Risk Factors</h5>
                {result.risk_factors.length ? (
                  <ul className='list-disc list-inside text-sm text-muted-foreground space-y-1'>
                    {result.risk_factors.map((risk, i) => (
                      <li key={i}>{risk}</li>
                    ))}
                  </ul>
                ) : (
                  <p className='text-sm text-muted-foreground'>
                    None identified
                  </p>
                )}
              </div>
            </div>
            <hr />
            <p className='text-sm text-muted-foreground'>
              Compiled in {formatElapsed(elapsedMs)} seconds
            </p>
          </div>
        )}
      </div>

      <div className='border-t bg-muted/30 p-4'>
        <div className='flex gap-3'>
          <Input
            value={playerName}
            onChange={e => setPlayerName(e.target.value)}
            disabled={requestState === 'loading'}
          />
          <TeamCombobox />
          <Button
            disabled={!playerName || !team || requestState === 'loading'}
            onClick={handleSubmit}
          >
            {requestState === 'loading' ? 'Loading…' : 'Submit'}
          </Button>
        </div>
      </div>
    </Card>
  )
}
