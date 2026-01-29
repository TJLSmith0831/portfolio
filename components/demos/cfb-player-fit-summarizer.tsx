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

export function CfbPlayerFitSummarizerDemo() {
  const [playerName, setPlayerName] = useState('')
  const [team, setTeam] = useState<string | null>(null)

  const handleSubmit = () => {
    // Placeholder for future API / agent call
    console.log({
      playerName,
      team,
    })
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

  return (
    <Card className='h-full flex flex-col'>
      {/* Instructions */}
      <div className='flex-1 p-6 flex items-center justify-center text-center'>
        <div className='max-w-md space-y-4'>
          <h4 className='text-xl font-semibold'>
            College Player Fit Evaluation
          </h4>
          <p className='text-muted-foreground leading-relaxed'>
            Please provide any college football player and select a team to
            evaluate how well they would fit within that program using AI.
          </p>
        </div>
      </div>

      {/* Controls */}
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
            disabled={!playerName || !team}
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </div>
      </div>
    </Card>
  )
}
