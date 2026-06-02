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
  Plus,
  RotateCcw,
  Trash2,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

/* -------------------------------------------------------------------------- */
/*  Backend contract                                                          */
/*                                                                            */
/*  This demo currently runs on MOCK data so it works with no backend. To go  */
/*  live, replace `runGradingFactoryMock` with a call to the SirenSpec        */
/*  grading-factory endpoint. The expected response shape is `GradingResult`  */
/*  below — each paper carries its three parallel agent outputs (editor,      */
/*  ai_detector, grader), a synthesized per-paper report, and the run ends    */
/*  with a compiled markdown gradebook plus a token/cost/duration summary.    */
/* -------------------------------------------------------------------------- */

type AgentId = 'editor' | 'ai_detector' | 'grader'

interface AgentOutput {
  id: AgentId
  output: string
}

interface PaperResult {
  index: number
  paper: string
  agents: AgentOutput[]
  grade: string
  integrity: 'LIKELY_HUMAN' | 'UNCERTAIN' | 'LIKELY_AI'
  feedback: string
}

interface GradebookRow {
  index: number
  grade: string
  feedback: string
}

interface GradingResult {
  papers: PaperResult[]
  gradebook: GradebookRow[]
  summary: {
    totalTokens: number
    estimatedUsd: number
    durationMs: number
  }
}

type RunState = 'idle' | 'running' | 'done' | 'error'
type StageStatus = 'pending' | 'running' | 'done'

const AGENT_LABELS: Record<AgentId, string> = {
  editor: 'Editor',
  ai_detector: 'AI Detector',
  grader: 'Grader',
}

const AGENT_DESCRIPTIONS: Record<AgentId, string> = {
  editor: 'Clarity, structure & grammar',
  ai_detector: 'Academic integrity check',
  grader: 'Letter grade & rationale',
}

const SAMPLE_PAPERS = [
  'The mitochondria is the powerhouse of the cell. It produces ATP through oxidative phosphorylation, converting nutrients into usable energy. Without it, eukaryotic life as we know it could not exist.',
  'Climate change is a big problem. Lots of scientists agree. We should do something about it before it gets worse. Many countries have started to take action but more needs to be done.',
  'Shakespeare wrote many plays and poems. His work has influenced literature for centuries. Romeo and Juliet is about two young lovers whose families are enemies. It ends tragically when both die.',
]

const WORKFLOW_YAML = `version: "0.1"

agents:
  gradebook_compiler:
    model: "openai:gpt-4o-mini"
    system: |
      You are an academic administrator compiling a final gradebook.
      Produce a clean markdown table, one row per paper:
      | # | Grade | Key Feedback |
      Reports: {{ grade_papers.output }}

nodes:
  grade_papers:
    type: factory
    for_each: "{{ inputs.message }}"   # one swarm per paper
    concurrency: 3
    on_failure: continue
    writes: working.grade_reports
    swarm:
      concurrency: 3
      agents:
        - id: editor
          provider: openai
          model: gpt-4o-mini
          prompt: "Review paper {{ index }} of {{ total }}: {{ item }}"
        - id: ai_detector
          provider: openai
          model: gpt-4o-mini
          prompt: "Assess AI likelihood for paper {{ index }}: {{ item }}"
        - id: grader
          provider: openai
          model: gpt-4o-mini
          prompt: "Grade paper {{ index }} of {{ total }}: {{ item }}"
      synthesis:
        provider: openai
        model: gpt-4o-mini
        prompt: |
          Produce a grade report for paper {{ index }} of {{ total }}.
          Editor: {{ grade_papers.agents.editor.output }}
          AI check: {{ grade_papers.agents.ai_detector.output }}
          Grade: {{ grade_papers.agents.grader.output }}

  compile_gradebook:
    agent: gradebook_compiler
    writes: output.gradebook

edges:
  - from: grade_papers
    to: compile_gradebook

budget:
  max_cost_usd: 0.10
  on_exceeded: abort

guardrails:
  - injection`

const STAGE_INTERVAL_MS = 1100

/* -------------------------------------------------------------------------- */
/*  Mock execution                                                            */
/* -------------------------------------------------------------------------- */

function mockGradeForPaper(paper: string, index: number): PaperResult {
  const words = paper.trim().split(/\s+/).length
  const vague = /\b(big problem|lots of|something|more needs|many)\b/i.test(
    paper
  )
  const precise =
    /\b(ATP|oxidative phosphorylation|eukaryotic|photosynthesis|hypothesis)\b/i.test(
      paper
    )

  let grade = 'B'
  let integrity: PaperResult['integrity'] = 'LIKELY_HUMAN'
  if (precise && words > 25) {
    grade = 'A'
    integrity = 'UNCERTAIN'
  } else if (vague) {
    grade = 'C'
    integrity = 'LIKELY_HUMAN'
  }

  const editor =
    grade === 'A'
      ? 'Tight, well-sequenced prose with precise terminology. Could add a transitional sentence between the mechanism and its significance.'
      : vague
        ? 'Reads as a first draft — claims are asserted without evidence and sentences repeat the same idea. Tighten the thesis and cut filler phrasing.'
        : 'Clear and readable, but the structure is list-like. Connect the sentences into a single argument and vary sentence length.'

  const detector =
    integrity === 'UNCERTAIN'
      ? 'UNCERTAIN — phrasing is unusually polished for the length, but no definitive markers of generation.'
      : 'LIKELY_HUMAN — natural hedging and uneven detail are consistent with student writing.'

  const grader =
    grade === 'A'
      ? 'A — accurate, specific, and demonstrates real understanding of the mechanism.'
      : grade === 'C'
        ? 'C — on-topic but superficial; lacks evidence and specific detail.'
        : 'B — solid summary with correct facts, but limited depth or analysis.'

  const feedback =
    grade === 'A'
      ? 'Accurate and specific; add one connective sentence for flow.'
      : grade === 'C'
        ? 'On-topic but vague — needs evidence and a sharper thesis.'
        : 'Correct and clear, but list-like; deepen the analysis.'

  return {
    index,
    paper,
    agents: [
      { id: 'editor', output: editor },
      { id: 'ai_detector', output: detector },
      { id: 'grader', output: grader },
    ],
    grade,
    integrity,
    feedback,
  }
}

function buildMockResult(papers: string[]): GradingResult {
  const results = papers.map((p, i) => mockGradeForPaper(p, i))
  const totalTokens = papers.length * 480 + 260
  return {
    papers: results,
    gradebook: results.map(r => ({
      index: r.index,
      grade: r.grade,
      feedback: r.feedback,
    })),
    summary: {
      totalTokens,
      estimatedUsd: Number((totalTokens * 0.0000006).toFixed(4)),
      durationMs: papers.length * STAGE_INTERVAL_MS * 2 + STAGE_INTERVAL_MS,
    },
  }
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export function SirenSpecGradingFactoryDemo() {
  const [papers, setPapers] = useState<string[]>(SAMPLE_PAPERS)
  const [runState, setRunState] = useState<RunState>('idle')
  const [result, setResult] = useState<GradingResult | null>(null)
  const [donePhases, setDonePhases] = useState(0)
  const [yamlOpen, setYamlOpen] = useState(false)
  const [papersOpen, setPapersOpen] = useState(true)
  const [expandedSwarms, setExpandedSwarms] = useState<Set<number>>(new Set())

  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const gradebookOrder = papers.length * 2

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  function stageStatus(order: number): StageStatus {
    if (donePhases > order) return 'done'
    if (donePhases === order) return 'running'
    return 'pending'
  }

  function updatePaper(index: number, value: string) {
    setPapers(prev => prev.map((p, i) => (i === index ? value : p)))
  }

  function addPaper() {
    if (papers.length >= 4) return
    setPapers(prev => [...prev, ''])
  }

  function removePaper(index: number) {
    setPapers(prev => prev.filter((_, i) => i !== index))
  }

  function resetSamples() {
    setPapers(SAMPLE_PAPERS)
  }

  function toggleSwarm(index: number) {
    setExpandedSwarms(prev => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  function handleRun() {
    const cleaned = papers.map(p => p.trim()).filter(Boolean)
    if (cleaned.length === 0 || runState === 'running') return

    if (timerRef.current) clearInterval(timerRef.current)

    setPapers(cleaned)
    setResult(buildMockResult(cleaned))
    setDonePhases(0)
    setRunState('running')
    setPapersOpen(false)
    setExpandedSwarms(new Set())

    const phaseCount = cleaned.length * 2 + 1
    timerRef.current = setInterval(() => {
      setDonePhases(prev => {
        const next = prev + 1
        if (next >= phaseCount) {
          if (timerRef.current) clearInterval(timerRef.current)
          setRunState('done')
        }
        return next
      })
    }, STAGE_INTERVAL_MS)
  }

  const running = runState === 'running'
  const showResults = runState === 'running' || runState === 'done'

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
              <Badge variant='secondary'>factory</Badge>
              <Badge variant='secondary'>swarm</Badge>
              <Badge variant='secondary'>synthesis</Badge>
              <Badge variant='outline'>openai:gpt-4o-mini</Badge>
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
              A professor submits N papers. The{' '}
              <span className='font-medium text-foreground'>factory</span>{' '}
              spawns one{' '}
              <span className='font-medium text-foreground'>swarm</span> per
              paper — an editor, AI detector, and grader run in parallel, then a
              synthesis step folds their verdicts into a grade report. A final
              agent compiles every report into a gradebook.
            </p>
            <button
              onClick={() => setYamlOpen(true)}
              className='flex items-center gap-1.5 text-sm font-medium text-primary hover:underline'
            >
              <ChevronDown className='h-4 w-4' />
              View workflow.yaml
            </button>
          </div>

          {/* Papers (collapsible) */}
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <button
                onClick={() => setPapersOpen(v => !v)}
                className='flex items-center gap-2 text-sm font-semibold hover:text-foreground/80 transition-colors'
              >
                <ChevronDown
                  className={cn(
                    'h-4 w-4 text-muted-foreground transition-transform',
                    papersOpen && 'rotate-180'
                  )}
                />
                Papers ({papers.filter(p => p.trim()).length})
              </button>
              {papersOpen && runState === 'idle' && (
                <div className='flex gap-2'>
                  <Button
                    size='sm'
                    variant='ghost'
                    onClick={resetSamples}
                    className='h-8 text-xs'
                  >
                    <RotateCcw className='h-3 w-3 mr-1' />
                    Samples
                  </Button>
                  <Button
                    size='sm'
                    variant='ghost'
                    onClick={addPaper}
                    disabled={papers.length >= 4}
                    className='h-8 text-xs'
                  >
                    <Plus className='h-3 w-3 mr-1' />
                    Add
                  </Button>
                </div>
              )}
            </div>

            {papersOpen && (
              <div className='space-y-3'>
                {papers.map((paper, i) => (
                  <div key={i} className='flex gap-2 items-start'>
                    <span className='mt-2 text-xs font-mono text-muted-foreground w-5 shrink-0'>
                      {i + 1}
                    </span>
                    {runState === 'idle' ? (
                      <>
                        <textarea
                          value={paper}
                          onChange={e => updatePaper(i, e.target.value)}
                          rows={3}
                          placeholder='Paste a student paper…'
                          className='flex-1 resize-y rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
                        />
                        {papers.length > 1 && (
                          <Button
                            size='icon'
                            variant='ghost'
                            onClick={() => removePaper(i)}
                            className='mt-1 h-7 w-7 shrink-0 text-muted-foreground'
                          >
                            <Trash2 className='h-3.5 w-3.5' />
                          </Button>
                        )}
                      </>
                    ) : (
                      <p className='flex-1 pt-1 text-xs text-muted-foreground line-clamp-2'>
                        {paper}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Live execution — accordion swarm rows */}
          {showResults && result && (
            <div className='space-y-3'>
              <h4 className='text-sm font-semibold'>
                grade_papers → output
              </h4>

              <div className='space-y-2'>
                {result.papers.map(paper => {
                  const agentStatus = stageStatus(paper.index * 2)
                  const synthStatus = stageStatus(paper.index * 2 + 1)
                  const isExpanded = expandedSwarms.has(paper.index)

                  return (
                    <div key={paper.index} className='rounded-lg border overflow-hidden'>
                      {/* Swarm header row — always visible */}
                      <button
                        onClick={() => toggleSwarm(paper.index)}
                        className='flex w-full items-center gap-3 px-3 py-2.5 text-xs hover:bg-muted/30 transition-colors'
                      >
                        <span className='font-mono font-medium text-muted-foreground shrink-0 w-14 text-left'>
                          Swarm {paper.index + 1}
                        </span>
                        <div className='flex items-center gap-1.5 flex-wrap flex-1'>
                          <AgentPill label='Editor' status={agentStatus} />
                          <AgentPill label='AI Detector' status={agentStatus} />
                          <AgentPill label='Grader' status={agentStatus} />
                          <span className='text-muted-foreground'>→</span>
                          <AgentPill label='Synthesis' status={synthStatus} />
                        </div>
                        {synthStatus === 'done' && (
                          <span className='font-mono font-semibold text-sm shrink-0'>
                            {paper.grade}
                          </span>
                        )}
                        <ChevronDown
                          className={cn(
                            'h-3.5 w-3.5 text-muted-foreground transition-transform shrink-0',
                            isExpanded && 'rotate-180'
                          )}
                        />
                      </button>

                      {/* Expanded content */}
                      {isExpanded && (
                        <div className='border-t bg-muted/20 px-3 pb-3 pt-3 space-y-3'>
                          <p className='text-xs text-muted-foreground italic line-clamp-2'>
                            {paper.paper}
                          </p>

                          {/* Agent outputs */}
                          <div className='grid grid-cols-1 sm:grid-cols-3 gap-2'>
                            {paper.agents.map(agent => (
                              <div
                                key={agent.id}
                                className={cn(
                                  'rounded-md border p-2.5 transition-opacity',
                                  agentStatus === 'pending' && 'opacity-50'
                                )}
                              >
                                <div className='flex items-center justify-between gap-1 mb-1'>
                                  <span className='text-[10px] font-semibold'>
                                    {AGENT_LABELS[agent.id]}
                                  </span>
                                  {agentStatus === 'running' && (
                                    <Loader2 className='h-2.5 w-2.5 animate-spin text-primary' />
                                  )}
                                  {agentStatus === 'done' && (
                                    <Check className='h-2.5 w-2.5 text-emerald-600 dark:text-emerald-500' />
                                  )}
                                </div>
                                <p className='text-[10px] uppercase tracking-wide text-muted-foreground mb-1.5'>
                                  {AGENT_DESCRIPTIONS[agent.id]}
                                </p>
                                {agentStatus === 'done' ? (
                                  <p className='text-xs text-muted-foreground leading-relaxed'>
                                    {agent.output}
                                  </p>
                                ) : (
                                  <SkeletonLines lines={3} />
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Synthesis */}
                          <div className='rounded-md border bg-background p-2.5'>
                            <div className='flex items-center gap-2 mb-1.5'>
                              <span className='text-[10px] font-semibold uppercase tracking-wide text-muted-foreground'>
                                Synthesis → grade report
                              </span>
                              <PhasePill status={synthStatus} />
                            </div>
                            {synthStatus === 'done' ? (
                              <div className='space-y-1 text-xs'>
                                <div className='flex flex-wrap gap-x-4 gap-y-0.5'>
                                  <span>
                                    <span className='font-semibold'>
                                      Grade:
                                    </span>{' '}
                                    {paper.grade}
                                  </span>
                                  <span>
                                    <span className='font-semibold'>
                                      Integrity:
                                    </span>{' '}
                                    {paper.integrity}
                                  </span>
                                </div>
                                <p className='text-muted-foreground'>
                                  {paper.feedback}
                                </p>
                              </div>
                            ) : (
                              <SkeletonLines lines={2} />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Gradebook */}
              <Card className='p-4'>
                <div className='flex items-center gap-2 mb-3'>
                  <h4 className='text-sm font-semibold'>
                    compile_gradebook → output.gradebook
                  </h4>
                  <PhasePill status={stageStatus(gradebookOrder)} />
                </div>
                {stageStatus(gradebookOrder) === 'done' ? (
                  <div className='overflow-x-auto'>
                    <table className='w-full text-sm border-collapse'>
                      <thead>
                        <tr className='border-b text-left'>
                          <th className='py-2 pr-4 font-semibold'>#</th>
                          <th className='py-2 pr-4 font-semibold'>Grade</th>
                          <th className='py-2 font-semibold'>Key Feedback</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.gradebook.map(row => (
                          <tr key={row.index} className='border-b last:border-0'>
                            <td className='py-2 pr-4 font-mono text-muted-foreground'>
                              {row.index + 1}
                            </td>
                            <td className='py-2 pr-4 font-semibold'>
                              {row.grade}
                            </td>
                            <td className='py-2 text-muted-foreground'>
                              {row.feedback}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <SkeletonLines lines={papers.length} />
                )}
              </Card>

              {/* Summary */}
              {runState === 'done' && (
                <div className='flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground border-t pt-3'>
                  <span>
                    {result.summary.totalTokens.toLocaleString()} tokens
                  </span>
                  <span>~${result.summary.estimatedUsd.toFixed(4)} est. cost</span>
                  <span>budget cap $0.10</span>
                  <span className='text-amber-600 dark:text-amber-500'>
                    mock data — backend not yet wired
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
                ? 'Running grading factory…'
                : runState === 'done'
                  ? 'Run complete.'
                  : `${papers.filter(p => p.trim()).length} paper(s) ready · concurrency 3`}
            </p>
            <div className='flex gap-2'>
              {showResults && (
                <Button
                  variant='outline'
                  onClick={() => {
                    setRunState('idle')
                    setResult(null)
                    setDonePhases(0)
                    setPapersOpen(true)
                    setExpandedSwarms(new Set())
                  }}
                  disabled={running}
                >
                  Edit papers
                </Button>
              )}
              <Button
                onClick={handleRun}
                disabled={running || papers.every(p => !p.trim())}
              >
                {running ? (
                  <>
                    <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                    Grading…
                  </>
                ) : (
                  'Grade papers'
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

function PhasePill({ status }: { status: StageStatus }) {
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

function AgentPill({
  label,
  status,
}: {
  label: string
  status: StageStatus
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium',
        status === 'done' &&
          'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        status === 'running' && 'bg-primary/10 text-primary',
        status === 'pending' && 'bg-muted text-muted-foreground'
      )}
    >
      {status === 'running' && (
        <Loader2 className='h-2.5 w-2.5 animate-spin' />
      )}
      {status === 'done' && <Check className='h-2.5 w-2.5' />}
      {label}
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
