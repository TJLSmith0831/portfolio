'use client'

import { useEffect, useRef, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ExternalLink, Loader2, RotateCcw, X } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

/* -------------------------------------------------------------------------- */
/*  Backend contract                                                          */
/*                                                                            */
/*  This demo runs on MOCK data so it works with no backend. To go live,      */
/*  replace `generateBattle` with a call to the SirenSpec pokemon-battle      */
/*  endpoint. Pokemon stats are sourced live from the PokéAPI. The expected   */
/*  response shape is `BattleResult` below — a list of turns each carrying    */
/*  attacker, move, damage dealt, and remaining HP for both Pokemon.          */
/* -------------------------------------------------------------------------- */

interface StatEntry {
  stat: { name: string }
  base_stat: number
}

interface TypeEntry {
  type: { name: string }
}

interface PokemonData {
  name: string
  displayName: string
  sprite: string | null
  hp: number
  attack: number
  defense: number
  speed: number
  types: string[]
}

interface BattleTurn {
  attacker: 1 | 2
  move: string
  damage: number
  hp1After: number
  hp2After: number
}

interface BattleResult {
  turns: BattleTurn[]
  winner: 1 | 2
}

type BattleRunState = 'idle' | 'running' | 'done'

const TURN_DELAY_MS = 1300

const TYPE_MOVES: Record<string, string[]> = {
  fire: ['Flamethrower', 'Fire Blast', 'Ember', 'Heat Wave'],
  water: ['Hydro Pump', 'Surf', 'Bubble Beam', 'Water Gun'],
  grass: ['Solar Beam', 'Vine Whip', 'Razor Leaf', 'Leaf Blade'],
  electric: ['Thunderbolt', 'Thunder', 'Spark', 'Volt Tackle'],
  psychic: ['Psychic', 'Psybeam', 'Confusion', 'Future Sight'],
  normal: ['Tackle', 'Body Slam', 'Hyper Beam', 'Quick Attack'],
  fighting: ['Close Combat', 'Karate Chop', 'Dynamic Punch', 'Focus Punch'],
  rock: ['Rock Slide', 'Stone Edge', 'Rock Blast', 'Rock Throw'],
  ground: ['Earthquake', 'Dig', 'Mud Shot', 'Earth Power'],
  flying: ['Wing Attack', 'Aerial Ace', 'Air Slash', 'Hurricane'],
  bug: ['Bug Buzz', 'X-Scissor', 'Pin Missile', 'Signal Beam'],
  poison: ['Sludge Bomb', 'Poison Jab', 'Acid', 'Venoshock'],
  ghost: ['Shadow Ball', 'Shadow Claw', 'Night Shade', 'Hex'],
  ice: ['Ice Beam', 'Blizzard', 'Frost Breath', 'Ice Shard'],
  dragon: ['Dragon Claw', 'Outrage', 'Draco Meteor', 'Dragon Pulse'],
  steel: ['Iron Head', 'Flash Cannon', 'Metal Burst', 'Steel Wing'],
}

const WORKFLOW_YAML = `version: "0.1"

agents:
  battle_narrator:
    model: "openai:gpt-4.1-mini"
    system: |
      You are an enthusiastic Pokémon battle commentator.
      Given the current battle state (attacker, defender, HP remaining),
      narrate one turn: choose a move, calculate damage dealt,
      and return a short exciting commentary line.
    output_schema:
      attacker_slot: integer   # 1 or 2
      move: string
      damage: integer
      commentary: string

nodes:
  battle:
    type: loop
    max_iterations: 20
    until: "{{ working.hp1 <= 0 or working.hp2 <= 0 }}"
    agent: battle_narrator
    input:
      pokemon1: "{{ inputs.pokemon1 }}"
      pokemon2: "{{ inputs.pokemon2 }}"
      state: "{{ working.battle_state }}"
    writes: working.battle_state

guardrails:
  - injection

budget:
  max_cost_usd: 0.05
  on_exceeded: abort`

/* -------------------------------------------------------------------------- */
/*  PokéAPI helpers                                                           */
/* -------------------------------------------------------------------------- */

async function fetchPokemonData(name: string): Promise<PokemonData | null> {
  try {
    const r = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`)
    if (!r.ok) return null
    const data = await r.json()
    return {
      name: data.name,
      displayName: data.name.charAt(0).toUpperCase() + data.name.slice(1),
      sprite: (data.sprites?.front_default as string | null) ?? null,
      hp:
        (data.stats as StatEntry[]).find(s => s.stat.name === 'hp')
          ?.base_stat ?? 50,
      attack:
        (data.stats as StatEntry[]).find(s => s.stat.name === 'attack')
          ?.base_stat ?? 50,
      defense:
        (data.stats as StatEntry[]).find(s => s.stat.name === 'defense')
          ?.base_stat ?? 50,
      speed:
        (data.stats as StatEntry[]).find(s => s.stat.name === 'speed')
          ?.base_stat ?? 45,
      types: (data.types as TypeEntry[]).map(t => t.type.name),
    }
  } catch {
    return null
  }
}

/* -------------------------------------------------------------------------- */
/*  Mock battle engine                                                        */
/* -------------------------------------------------------------------------- */

function getMove(pokemon: PokemonData): string {
  const type = pokemon.types[0] ?? 'normal'
  const moves = TYPE_MOVES[type] ?? TYPE_MOVES['normal']
  return moves[Math.floor(Math.random() * moves.length)]
}

function calcDamage(atk: PokemonData, def: PokemonData): number {
  const base = Math.max(5, Math.floor((atk.attack / (def.defense + 1)) * 15) + 5)
  const variation = 0.85 + Math.random() * 0.3
  return Math.max(1, Math.round(base * variation))
}

function generateBattle(p1: PokemonData, p2: PokemonData): BattleResult {
  let hp1 = p1.hp
  let hp2 = p2.hp
  const turns: BattleTurn[] = []
  let attacker: 1 | 2 = p1.speed >= p2.speed ? 1 : 2

  while (hp1 > 0 && hp2 > 0 && turns.length < 20) {
    const atk = attacker === 1 ? p1 : p2
    const def = attacker === 1 ? p2 : p1
    const move = getMove(atk)
    const damage = calcDamage(atk, def)

    if (attacker === 1) hp2 = Math.max(0, hp2 - damage)
    else hp1 = Math.max(0, hp1 - damage)

    turns.push({ attacker, move, damage, hp1After: hp1, hp2After: hp2 })
    attacker = attacker === 1 ? 2 : 1
  }

  return { turns, winner: hp2 <= 0 ? 1 : 2 }
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export function SirenSpecAIPokemonBattleDemo() {
  const [pokemonList, setPokemonList] = useState<string[]>([])
  const [listLoading, setListLoading] = useState(true)

  const [p1Name, setP1Name] = useState('pikachu')
  const [p2Name, setP2Name] = useState('charizard')
  const [p1, setP1] = useState<PokemonData | null>(null)
  const [p2, setP2] = useState<PokemonData | null>(null)
  const [p1Loading, setP1Loading] = useState(false)
  const [p2Loading, setP2Loading] = useState(false)

  const [battle, setBattle] = useState<BattleResult | null>(null)
  const [battleRunState, setBattleRunState] = useState<BattleRunState>('idle')
  const [currentTurn, setCurrentTurn] = useState(-1)
  const [yamlOpen, setYamlOpen] = useState(false)

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const logContainerRef = useRef<HTMLDivElement | null>(null)

  // Fetch Pokémon list and pre-load defaults
  useEffect(() => {
    fetch('https://pokeapi.co/api/v2/pokemon?limit=151')
      .then(r => r.json())
      .then((data: { results: { name: string }[] }) => {
        setPokemonList(data.results.map(p => p.name))
      })
      .finally(() => setListLoading(false))

    async function preload() {
      setP1Loading(true)
      setP2Loading(true)
      const [d1, d2] = await Promise.all([
        fetchPokemonData('pikachu'),
        fetchPokemonData('charizard'),
      ])
      setP1(d1)
      setP2(d2)
      setP1Loading(false)
      setP2Loading(false)
    }
    preload()
  }, [])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  useEffect(() => {
    const el = logContainerRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [currentTurn])

  async function handleSelectP1(name: string) {
    setP1Name(name)
    if (!name) {
      setP1(null)
      return
    }
    setP1Loading(true)
    const data = await fetchPokemonData(name)
    setP1(data)
    setP1Loading(false)
  }

  async function handleSelectP2(name: string) {
    setP2Name(name)
    if (!name) {
      setP2(null)
      return
    }
    setP2Loading(true)
    const data = await fetchPokemonData(name)
    setP2(data)
    setP2Loading(false)
  }

  function handleStartBattle() {
    if (!p1 || !p2 || battleRunState === 'running') return

    if (timerRef.current) clearInterval(timerRef.current)

    const result = generateBattle(p1, p2)
    setBattle(result)
    setCurrentTurn(-1)
    setBattleRunState('running')

    let turn = 0
    setTimeout(() => {
      setCurrentTurn(0)
      turn = 1
      timerRef.current = setInterval(() => {
        if (turn >= result.turns.length) {
          clearInterval(timerRef.current!)
          setCurrentTurn(result.turns.length)
          setBattleRunState('done')
        } else {
          setCurrentTurn(turn)
          turn++
        }
      }, TURN_DELAY_MS)
    }, 400)
  }

  function handleReset() {
    if (timerRef.current) clearInterval(timerRef.current)
    setBattle(null)
    setBattleRunState('idle')
    setCurrentTurn(-1)
  }

  const currentHp1 =
    battle && currentTurn >= 0
      ? battle.turns[Math.min(currentTurn, battle.turns.length - 1)].hp1After
      : p1?.hp ?? 0

  const currentHp2 =
    battle && currentTurn >= 0
      ? battle.turns[Math.min(currentTurn, battle.turns.length - 1)].hp2After
      : p2?.hp ?? 0

  const showBattle = battleRunState === 'running' || battleRunState === 'done'
  const running = battleRunState === 'running'
  const canBattle =
    !!p1 && !!p2 && !p1Loading && !p2Loading && p1.name !== p2.name

  const firstAttacker =
    p1 && p2 ? (p1.speed >= p2.speed ? p1.displayName : p2.displayName) : null

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
              <Badge variant='secondary'>loop</Badge>
              <Badge variant='secondary'>structured output</Badge>
              <Badge variant='outline'>openai:gpt-4.1-mini</Badge>
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
              Pick two Pokémon and watch a multi-turn battle unfold. A SirenSpec{' '}
              <span className='font-medium text-foreground'>loop node</span>{' '}
              drives the battle, calling the narrator agent each turn until one
              Pokémon faints. Stats sourced live from{' '}
              <a
                href='https://pokeapi.co'
                target='_blank'
                rel='noopener noreferrer'
                className='underline'
              >
                PokéAPI
              </a>
              .
            </p>
            <button
              onClick={() => setYamlOpen(true)}
              className='flex items-center gap-1.5 text-sm font-medium text-primary hover:underline'
            >
              <ChevronDown className='h-4 w-4' />
              View workflow.yaml
            </button>
          </div>

          {/* Pickers (idle only) */}
          {!showBattle && (
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <PokemonPicker
                slot={1}
                value={p1Name}
                onChange={handleSelectP1}
                pokemon={p1}
                loading={p1Loading}
                list={pokemonList}
                listLoading={listLoading}
                otherName={p2Name}
              />
              <PokemonPicker
                slot={2}
                value={p2Name}
                onChange={handleSelectP2}
                pokemon={p2}
                loading={p2Loading}
                list={pokemonList}
                listLoading={listLoading}
                otherName={p1Name}
              />
            </div>
          )}

          {/* Speed notice (idle, both loaded) */}
          {!showBattle && firstAttacker && canBattle && (
            <p className='text-xs text-muted-foreground'>
              <span className='font-medium text-foreground'>
                {firstAttacker}
              </span>{' '}
              attacks first (higher Speed stat).
            </p>
          )}

          {/* Battle view */}
          {showBattle && battle && p1 && p2 && (
            <div className='space-y-4'>
              {/* HP bars */}
              <div className='grid grid-cols-2 gap-4'>
                <HpBar pokemon={p1} currentHp={currentHp1} />
                <HpBar pokemon={p2} currentHp={currentHp2} />
              </div>

              {/* Battle log */}
              <div
                ref={logContainerRef}
                className='max-h-56 overflow-y-auto rounded-lg border p-3 space-y-1'
              >
                {battle.turns.slice(0, currentTurn + 1).map((turn, i) => {
                  const attacker = turn.attacker === 1 ? p1 : p2
                  return (
                    <div
                      key={i}
                      className={cn(
                        'flex items-center gap-2 text-xs py-1 px-2 rounded',
                        turn.attacker === 1
                          ? 'bg-blue-500/5'
                          : 'bg-orange-500/5'
                      )}
                    >
                      <span className='font-medium shrink-0 w-20 truncate'>
                        {attacker.displayName}
                      </span>
                      <span className='text-muted-foreground shrink-0'>used</span>
                      <span className='font-medium text-primary flex-1'>
                        {turn.move}
                      </span>
                      <span className='text-muted-foreground shrink-0 font-mono'>
                        -{turn.damage} HP
                      </span>
                    </div>
                  )
                })}
                {running && currentTurn >= 0 && (
                  <div className='flex items-center gap-2 py-1 px-2 text-xs text-muted-foreground'>
                    <Loader2 className='h-3 w-3 animate-spin' />
                    Narrating next turn&hellip;
                  </div>
                )}
              </div>

              {/* Winner */}
              {battleRunState === 'done' && (
                <div className='rounded-lg border bg-muted/20 p-4'>
                  <p className='text-sm font-semibold text-center'>
                    {battle.winner === 1
                      ? p1.displayName
                      : p2.displayName}{' '}
                    wins after {battle.turns.length} turns!
                  </p>
                </div>
              )}

              {/* Summary */}
              {battleRunState === 'done' && (
                <div className='flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground border-t pt-3'>
                  <span>{battle.turns.length} turns</span>
                  <span>
                    ~{(battle.turns.length * 300).toLocaleString()} tokens est.
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
                ? 'Battle in progress…'
                : battleRunState === 'done'
                  ? 'Battle complete.'
                  : !p1 || !p2
                    ? 'Pick two Pokémon to battle'
                    : p1.name === p2.name
                      ? 'Pick two different Pokémon'
                      : `${p1.displayName} vs ${p2.displayName} · ready`}
            </p>
            <div className='flex gap-2'>
              {showBattle && (
                <Button
                  variant='outline'
                  onClick={handleReset}
                  disabled={running}
                >
                  <RotateCcw className='h-3.5 w-3.5 mr-1.5' />
                  New battle
                </Button>
              )}
              <Button
                onClick={handleStartBattle}
                disabled={!canBattle || running || showBattle}
              >
                {running ? (
                  <>
                    <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                    Battling&hellip;
                  </>
                ) : (
                  'Start battle'
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

function PokemonPicker({
  slot,
  value,
  onChange,
  pokemon,
  loading,
  list,
  listLoading,
  otherName,
}: {
  slot: 1 | 2
  value: string
  onChange: (name: string) => void
  pokemon: PokemonData | null
  loading: boolean
  list: string[]
  listLoading: boolean
  otherName: string
}) {
  return (
    <div className='space-y-2'>
      <label className='text-sm font-semibold'>Pokémon {slot}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={listLoading}
        className='w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
      >
        <option value=''>Select a Pokémon&hellip;</option>
        {list.map(name => (
          <option key={name} value={name} disabled={name === otherName}>
            {name.charAt(0).toUpperCase() + name.slice(1)}
          </option>
        ))}
      </select>

      {loading && (
        <div className='flex items-center gap-2 text-xs text-muted-foreground h-[72px]'>
          <Loader2 className='h-3 w-3 animate-spin' />
          Loading&hellip;
        </div>
      )}

      {pokemon && !loading && (
        <div className='flex items-center gap-3 rounded-lg border bg-muted/20 p-3'>
          {pokemon.sprite ? (
            <Image
              src={pokemon.sprite}
              alt={pokemon.displayName}
              width={56}
              height={56}
              style={{ imageRendering: 'pixelated' }}
              unoptimized
            />
          ) : (
            <div className='w-14 h-14 rounded bg-muted flex items-center justify-center text-muted-foreground text-xs'>
              ?
            </div>
          )}
          <div className='text-xs space-y-1 min-w-0'>
            <div className='font-semibold'>{pokemon.displayName}</div>
            <div className='flex flex-wrap gap-1'>
              {pokemon.types.map(t => (
                <Badge
                  key={t}
                  variant='secondary'
                  className='text-[10px] py-0 h-4'
                >
                  {t}
                </Badge>
              ))}
            </div>
            <div className='text-muted-foreground font-mono text-[10px]'>
              HP {pokemon.hp} · ATK {pokemon.attack} · DEF {pokemon.defense} ·
              SPD {pokemon.speed}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function HpBar({
  pokemon,
  currentHp,
}: {
  pokemon: PokemonData
  currentHp: number
}) {
  const pct = Math.max(0, Math.min(100, Math.round((currentHp / pokemon.hp) * 100)))
  const barColor =
    pct > 50
      ? 'bg-green-500'
      : pct > 25
        ? 'bg-yellow-500'
        : 'bg-red-500'

  return (
    <div className='space-y-1.5'>
      <div className='flex items-center justify-between text-xs'>
        <div className='flex items-center gap-2 min-w-0'>
          {pokemon.sprite && (
            <Image
              src={pokemon.sprite}
              alt={pokemon.displayName}
              width={22}
              height={22}
              style={{ imageRendering: 'pixelated' }}
              unoptimized
            />
          )}
          <span className='font-medium truncate'>{pokemon.displayName}</span>
        </div>
        <span className='text-muted-foreground font-mono shrink-0 ml-1'>
          {currentHp}/{pokemon.hp}
        </span>
      </div>
      <div className='h-2 rounded-full bg-muted overflow-hidden'>
        <div
          className={cn('h-full rounded-full transition-all duration-500', barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
