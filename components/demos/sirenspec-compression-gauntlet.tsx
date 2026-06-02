'use client'

import { useEffect, useRef, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Check,
  ChevronDown,
  ExternalLink,
  Loader2,
  RotateCcw,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

/* -------------------------------------------------------------------------- */
/*  Backend contract                                                          */
/*                                                                            */
/*  This demo runs on MOCK data so it works with no backend. To go live,      */
/*  replace `generateRounds` with a call to the SirenSpec compression-        */
/*  gauntlet endpoint. The expected response shape is `RoundResult[]` below   */
/*  — each round carries its input text, compressed output, and word counts.  */
/* -------------------------------------------------------------------------- */

type RoundStatus = 'pending' | 'running' | 'done'
type RunState = 'idle' | 'running' | 'done'

interface RoundResult {
  input: string
  output: string
  inputWords: number
  outputWords: number
}

const SAMPLE_TEXT =
  'The Apollo program, conducted by NASA between 1961 and 1972, stands as one of ' +
  "humanity's most ambitious scientific and engineering endeavors. Launched in the context " +
  'of the Cold War Space Race against the Soviet Union, the program sought to demonstrate ' +
  'American technological prowess by achieving crewed lunar landings. President Kennedy\'s ' +
  '1961 declaration to land a man on the Moon before the end of the decade galvanized an ' +
  'entire generation of engineers, scientists, and astronauts. The program employed over ' +
  '400,000 people and cost approximately $25.4 billion, equivalent to roughly $257 billion ' +
  "in today's dollars. Apollo 11 successfully landed astronauts Neil Armstrong and Buzz " +
  "Aldrin on the Moon's Sea of Tranquility on July 20, 1969, with Armstrong's first steps " +
  'becoming one of the most-watched television events in history. In total, six missions ' +
  'successfully landed on the Moon, returning 842 pounds of lunar samples that continue to ' +
  'inform scientific research today. The program also drove major advances in computing, ' +
  'materials science, and telecommunications that shaped modern technology. Apollo 13 ' +
  'famously survived a life-threatening oxygen tank rupture through improvised engineering, ' +
  'becoming a defining moment of human ingenuity under pressure.'

const ROUND_DELAY_MS = 1400

const WORKFLOW_YAML = `
version: "0.1"

# Compression Gauntlet — passes a document through four summarizer agents,
# each halving the length. Demonstrates the length guardrail under sustained
# pressure and tracks how many rounds of compression a text can survive
# before meaning collapses.

agents:
  summarizer:
    model: "openai:gpt-4o-mini"
    system: |
      You are a ruthless editor. You will receive a passage of text.
      Rewrite it at exactly half the word count of the input — no more, no less.
      Preserve the most important facts and relationships. Drop examples, qualifiers,
      and elaboration first. Never add new information.
    guardrails:
      - length

nodes:
  round_1:
    agent: summarizer
    writes: working.round_1

  round_2:
    agent: summarizer
    writes: working.round_2

  round_3:
    agent: summarizer
    writes: working.round_3

  round_4:
    agent: summarizer
    writes: output.final

edges:
  - from: round_1
    to: round_2
  - from: round_2
    to: round_3
  - from: round_3
    to: round_4

guardrails:
  - injection
  - length
`;

/* -------------------------------------------------------------------------- */
/*  Mock compression                                                          */
/* -------------------------------------------------------------------------- */

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function mockCompress(text: string): string {
  const sentences =
    text
      .match(/[^.!?]+[.!?]*/g)
      ?.map(s => s.trim())
      .filter(Boolean) ?? []

  if (sentences.length <= 1) {
    const words = text.trim().split(/\s+/)
    const keep = Math.max(3, Math.ceil(words.length / 2))
    return (
      words.slice(0, keep).join(' ') + (words.length > keep ? '…' : '')
    )
  }

  const keepCount = Math.max(1, Math.ceil(sentences.length / 2))
  if (keepCount >= sentences.length) {
    const words = text.trim().split(/\s+/)
    const keep = Math.max(3, Math.ceil(words.length / 2))
    return (
      words.slice(0, keep).join(' ') + (words.length > keep ? '…' : '')
    )
  }

  const step = sentences.length / keepCount
  return Array.from({ length: keepCount }, (_, i) =>
    sentences[Math.min(Math.floor(i * step), sentences.length - 1)]
  ).join(' ')
}

function generateRounds(inputText: string): RoundResult[] {
  const results: RoundResult[] = []
  let current = inputText
  for (let i = 0; i < 4; i++) {
    const compressed = mockCompress(current)
    results.push({
      input: current,
      output: compressed,
      inputWords: countWords(current),
      outputWords: countWords(compressed),
    })
    current = compressed
  }
  return results
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export function SirenSpecCompressionGauntletDemo() {
  const [inputText, setInputText] = useState(SAMPLE_TEXT)
  const [runState, setRunState] = useState<RunState>('idle')
  const [rounds, setRounds] = useState<RoundResult[]>([])
  const [activeRound, setActiveRound] = useState(-1)
  const [expandedRounds, setExpandedRounds] = useState<Set<number>>(new Set())
  const [yamlOpen, setYamlOpen] = useState(false)

  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  function handleRun() {
    const text = inputText.trim()
    if (!text || runState === 'running') return

    if (timerRef.current) clearInterval(timerRef.current)

    const generated = generateRounds(text)
    setRounds(generated)
    setActiveRound(0)
    setExpandedRounds(new Set())
    setRunState('running')

    let round = 1
    timerRef.current = setInterval(() => {
      if (round >= 4) {
        clearInterval(timerRef.current!)
        setActiveRound(4)
        setRunState('done')
      } else {
        setActiveRound(round)
        round++
      }
    }, ROUND_DELAY_MS)
  }

  function handleReset() {
    if (timerRef.current) clearInterval(timerRef.current)
    setRunState('idle')
    setRounds([])
    setActiveRound(-1)
    setExpandedRounds(new Set())
  }

  function toggleRound(index: number) {
    setExpandedRounds(prev => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  function roundStatus(index: number): RoundStatus {
    if (activeRound > index) return 'done'
    if (activeRound === index) return 'running'
    return 'pending'
  }

  const showResults = runState === 'running' || runState === 'done'
  const running = runState === 'running'

  return (
    <>
      {/* YAML overlay */}
      {yamlOpen && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4'
          onClick={() => setYamlOpen(false)}
        >
          <div
            className='relative flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border bg-background shadow-xl'
            onClick={e => e.stopPropagation()}
          >
            <div className='flex items-center justify-between border-b px-4 py-3'>
              <span className='font-mono text-sm font-semibold'>
                workflow.yaml
              </span>
              <button
                onClick={() => setYamlOpen(false)}
                className='text-muted-foreground hover:text-foreground transition-colors'
              >
                <X className='h-4 w-4' />
              </button>
            </div>
            <pre className='flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed'>
              <code>{WORKFLOW_YAML}</code>
            </pre>
          </div>
        </div>
      )}

      <Card className='flex flex-col'>
        <div className='flex-1 space-y-5 overflow-y-auto p-4 md:p-6'>
          {/* Header */}
          <div className='space-y-3'>
            <div className='flex flex-wrap items-center gap-2'>
              <Badge variant='secondary'>sequential</Badge>
              <Badge variant='secondary'>guardrail:length</Badge>
              <Badge variant='outline'>anthropic:claude-haiku-4-5</Badge>
              <a
                href='https://github.com/sirenspec/sirenspec'
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground'
              >
                <ExternalLink className='h-3 w-3' />
                GitHub
              </a>
            </div>
            <p className='text-sm leading-relaxed text-muted-foreground'>
              A document is pushed through four sequential{' '}
              <span className='font-medium text-foreground'>
                compression rounds
              </span>
              , each targeting 50% word reduction. The{' '}
              <span className='font-medium text-foreground'>
                length guardrail
              </span>{' '}
              fires when the model overshoots, surfacing constraint violations
              in the trace. Meaning collapse is gradual — then sudden.
            </p>
            <button
              onClick={() => setYamlOpen(true)}
              className='flex items-center gap-1.5 text-sm font-medium text-primary hover:underline'
            >
              <ChevronDown className='h-4 w-4' />
              View workflow.yaml
            </button>
          </div>

          {/* Input passage (idle only) */}
          {!showResults && (
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <label className='text-sm font-semibold'>Input passage</label>
                <div className='flex items-center gap-2'>
                  <span className='text-xs text-muted-foreground'>
                    {countWords(inputText)} words
                  </span>
                  <Button
                    size='sm'
                    variant='ghost'
                    onClick={() => setInputText(SAMPLE_TEXT)}
                    className='h-7 text-xs'
                  >
                    <RotateCcw className='h-3 w-3 mr-1' />
                    Sample
                  </Button>
                </div>
              </div>
              <textarea
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                rows={6}
                placeholder='Paste any passage (150+ words)…'
                className='w-full resize-y rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
              />
              {countWords(inputText) < 50 && inputText.trim() && (
                <p className='text-xs text-amber-600 dark:text-amber-500'>
                  Tip: a longer passage (~150+ words) shows more dramatic
                  compression.
                </p>
              )}
            </div>
          )}

          {/* Rounds */}
          {showResults && (
            <div className='space-y-3'>
              <h4 className='text-sm font-semibold'>Compression rounds</h4>
              <div className='space-y-2'>
                {rounds.map((round, i) => {
                  const status = roundStatus(i)
                  const isExpanded = expandedRounds.has(i)
                  const ratio =
                    round.inputWords > 0
                      ? Math.round(
                          (1 - round.outputWords / round.inputWords) * 100
                        )
                      : 0

                  return (
                    <div
                      key={i}
                      className='rounded-lg border overflow-hidden'
                    >
                      {/* Round header — always visible, clickable when done */}
                      <button
                        onClick={() => status === 'done' && toggleRound(i)}
                        className={cn(
                          'flex w-full items-center gap-3 px-3 py-2.5 text-xs text-left',
                          status === 'done' && 'hover:bg-muted/30 transition-colors'
                        )}
                      >
                        <span className='font-mono font-medium text-muted-foreground shrink-0 w-14'>
                          round_{i + 1}
                        </span>
                        <div className='flex items-center gap-2 flex-1 flex-wrap'>
                          {status === 'done' && (
                            <>
                              <span className='text-muted-foreground'>
                                {round.inputWords}w
                              </span>
                              <span className='text-muted-foreground'>
                                &rarr;
                              </span>
                              <span className='font-medium'>
                                {round.outputWords}w
                              </span>
                              <Badge
                                variant='outline'
                                className='text-[10px] py-0 h-4'
                              >
                                {ratio}% cut
                              </Badge>
                            </>
                          )}
                          {status === 'running' && (
                            <span className='text-muted-foreground'>
                              compressing {round.inputWords} words&hellip;
                            </span>
                          )}
                          {status === 'pending' && (
                            <span className='text-muted-foreground'>
                              {round.inputWords}w &mdash; queued
                            </span>
                          )}
                        </div>
                        <PhasePill status={status} />
                        {status === 'done' && (
                          <ChevronDown
                            className={cn(
                              'h-3.5 w-3.5 text-muted-foreground transition-transform shrink-0',
                              isExpanded && 'rotate-180'
                            )}
                          />
                        )}
                      </button>

                      {/* Expanded output text */}
                      {status === 'done' && isExpanded && (
                        <div className='border-t bg-muted/20 px-3 pb-3 pt-2'>
                          <p
                            className={cn(
                              'text-sm leading-relaxed',
                              i >= 2 && 'text-muted-foreground italic'
                            )}
                          >
                            {round.output}
                          </p>
                        </div>
                      )}
                      {status === 'running' && (
                        <div className='border-t bg-muted/20 px-3 pb-3 pt-2'>
                          <SkeletonLines lines={i === 0 ? 3 : i === 1 ? 2 : 1} />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Summary */}
              {runState === 'done' && rounds.length > 0 && (
                <div className='rounded-lg border bg-muted/10 px-4 py-3 flex flex-wrap gap-x-6 gap-y-1 text-xs'>
                  <span>
                    <span className='font-medium'>{rounds[0].inputWords}</span>{' '}
                    &rarr;{' '}
                    <span className='font-medium'>
                      {rounds[rounds.length - 1].outputWords}
                    </span>{' '}
                    words
                  </span>
                  <span>
                    <span className='font-medium'>
                      {Math.round(
                        (1 -
                          rounds[rounds.length - 1].outputWords /
                            rounds[0].inputWords) *
                          100
                      )}
                      %
                    </span>{' '}
                    total compression
                  </span>
                  <span>
                    ~{(rounds[0].inputWords * 4 * 1.5).toLocaleString()} tokens
                    est.
                  </span>
                  <span className='text-amber-600 dark:text-amber-500'>
                    mock data &mdash; backend not yet wired
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action bar */}
        <div className='border-t bg-muted/30 p-4'>
          <div className='flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between'>
            <p className='text-xs text-muted-foreground'>
              {running
                ? 'Running compression gauntlet…'
                : runState === 'done'
                  ? 'Gauntlet complete.'
                  : `${countWords(inputText)} words ready · 4 passes · claude-haiku-4-5`}
            </p>
            <div className='flex gap-2'>
              {showResults && (
                <Button
                  variant='outline'
                  onClick={handleReset}
                  disabled={running}
                >
                  Edit passage
                </Button>
              )}
              <Button
                onClick={handleRun}
                disabled={running || !inputText.trim()}
              >
                {running ? (
                  <>
                    <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                    Running&hellip;
                  </>
                ) : runState === 'done' ? (
                  'Run again'
                ) : (
                  'Run gauntlet'
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </>
  )
}

/* -------------------------------------------------------------------------- */
/*  Sub-components                                                            */
/* -------------------------------------------------------------------------- */

function PhasePill({ status }: { status: RoundStatus }) {
  if (status === 'done') {
    return (
      <span className='inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-500'>
        <Check className='h-3 w-3' />
        done
      </span>
    )
  }
  if (status === 'running') {
    return (
      <span className='inline-flex items-center gap-1 text-xs text-primary'>
        <Loader2 className='h-3 w-3 animate-spin' />
        running
      </span>
    )
  }
  return (
    <span className='inline-flex items-center gap-1 text-xs text-muted-foreground'>
      queued
    </span>
  )
}

function SkeletonLines({ lines }: { lines: number }) {
  return (
    <div className='space-y-2 animate-pulse'>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className='h-3 rounded bg-muted'
          style={{ width: `${90 - i * 10}%` }}
        />
      ))}
    </div>
  )
}
