import { AnimalCompanion } from '../types';

export const ANIMAL_COMPANIONS: AnimalCompanion[] = [
  {
    id: 'pet_dog',
    name: 'Buster',
    species: 'dog',
    color: '#d97706', // Golden brown
    secondaryColor: '#ffffff',
    personality: 'Hyper-loyal retriever who wags tail excitedly and barks joyfully on victories.',
    unlocked: true,
    scale: 0.65
  },
  {
    id: 'pet_cat',
    name: 'Whiskers',
    species: 'cat',
    color: '#475569', // Blue-gray
    secondaryColor: '#f8fafc',
    personality: 'Curious, elegant park cat with nimble leaps and inquisitive head tilts.',
    unlocked: true,
    scale: 0.5
  },
  {
    id: 'pet_fox',
    name: 'Rusty',
    species: 'fox',
    color: '#ea580c', // Bright orange
    secondaryColor: '#f8fafc',
    personality: 'Clever woodland fox with bushy tail, quick pounces, and alert ears.',
    unlocked: true,
    scale: 0.58
  },
  {
    id: 'pet_panda',
    name: 'Bamboo',
    species: 'panda',
    color: '#f8fafc', // White & Black
    secondaryColor: '#18181b',
    personality: 'Chubby, lovable panda that rolls forward during sprints and sits peacefully.',
    unlocked: true,
    scale: 0.72
  },
  {
    id: 'pet_rabbit',
    name: 'Hops',
    species: 'rabbit',
    color: '#e2e8f0', // Soft pearl white
    secondaryColor: '#f472b6', // Pink inner ears
    personality: 'Speedy bunny that hops alongside you and twitches nose at jump pads.',
    unlocked: true,
    scale: 0.45
  },
  {
    id: 'pet_bird',
    name: 'Chirpy',
    species: 'bird',
    color: '#06b6d4', // Bright cyan
    secondaryColor: '#facc15', // Yellow beak
    personality: 'Tiny feathered companion that flutters right over your shoulder.',
    unlocked: true,
    scale: 0.35
  },
  {
    id: 'pet_wolf',
    name: 'Shadow',
    species: 'wolf',
    color: '#334155', // Charcoal slate
    secondaryColor: '#cbd5e1',
    personality: 'Sleek, heroic cartoon wolf that howls triumphantly when you win the DIDY CUP.',
    unlocked: false,
    scale: 0.68
  }
];
