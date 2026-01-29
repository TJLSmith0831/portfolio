'use client'

import { useState } from 'react'
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

const FBS_TEAMS: string[] = cfb_teams.FBS.flatMap(
  conference => conference.teams
).sort((a, b) => a.localeCompare(b))

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

export function CfbPlayerFitSummarizerDemo() {
  const [playerName, setPlayerName] = useState('')
  const [team, setTeam] = useState<string | null>(null)
  const [requestState, setRequestState] = useState<RequestState>('idle')
  const [result, setResult] = useState<PlayerFitSummary | null>(null)
  const [errorCode, setErrorCode] = useState<string | null>(null)

  async function handleSubmit() {
    if (!playerName || !team || requestState === 'loading') return

    setRequestState('loading')
    setErrorCode(null)
    setResult(null)

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
        let code = 'UNKNOWN_ERROR'
        try {
          const body = await res.json()
          code = body.detail ?? code
        } catch {
          /* non-JSON response */
        }
        throw new Error(code)
      }

      const data = await res.json()
      setResult(data.summary)
      setRequestState('success')
    } catch (err) {
      if (err instanceof Error) {
        setErrorCode(err.message)
      } else {
        setErrorCode('NETWORK_ERROR')
      }
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
    <Card className='h-full flex flex-col'>
      {/* Main Content */}
      <div className='flex-1 p-6 overflow-y-auto'>
        {requestState === 'loading' ? (
          /* ---------- Loading Skeleton ---------- */
          <PlayerFitSkeleton />
        ) : !result ? (
          /* ---------- Instructions ---------- */
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
          /* ---------- Result Output ---------- */
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
          </div>
        )}
      </div>

      {/* Controls (Always Visible) */}
      <div className='border-t bg-muted/30 p-4'>
        <div className='flex flex-col md:flex-row gap-3'>
          <Input
            placeholder='Player name'
            value={playerName}
            onChange={e => setPlayerName(e.target.value)}
            className='flex-1'
          />

          <TeamCombobox />

          <Button
            className='md:w-32'
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
