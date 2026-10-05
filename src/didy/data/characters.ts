import { RegularShowCharacter } from '../types';

export const REGULAR_SHOW_CHARACTERS: RegularShowCharacter[] = [
  {
    id: 'mordecai',
    name: 'Mordecai',
    species: 'Blue Jay',
    catchphrase: "Oooooohhhhh!",
    color: '#2563eb', // Vibrant blue
    accentColor: '#ffffff',
    height: 2.1,
    speed: 7.2,
    jumpForce: 8.5,
    description: 'Slender, athletic blue jay with a laid-back attitude, signature white chest stripe, and high leap.',
    unlocked: true,
    emoteName: 'Classic Oooooh!'
  },
  {
    id: 'rigby',
    name: 'Rigby',
    species: 'Raccoon',
    catchphrase: "STOP TALKING!",
    color: '#854d0e', // Raccoon brown
    accentColor: '#3f200c',
    height: 1.4,
    speed: 8.0, // Faster scamper!
    jumpForce: 7.8,
    description: 'Hyperactive, crafty brown raccoon with striped bushy tail. Low center of gravity and fast sprint speed.',
    unlocked: true,
    emoteName: 'Hamboning Dance'
  },
  {
    id: 'skips',
    name: 'Skips',
    species: 'Immortal Yeti',
    catchphrase: "I've seen this before...",
    color: '#f8fafc', // Pure white fur
    accentColor: '#64748b', // Denim gray pants
    height: 2.2,
    speed: 6.8,
    jumpForce: 9.2,
    description: 'Ancient, hyper-strong yeti who skips everywhere. Unmatched jump power and cosmic wisdom.',
    unlocked: true,
    emoteName: 'Mystic Yeti Hop'
  },
  {
    id: 'muscle_man',
    name: 'Muscle Man',
    species: 'Humanoid',
    catchphrase: "You know who else wins the DIDY CUP? MY MOM!",
    color: '#65a30d', // Green skin
    accentColor: '#475569', // Gray sweater
    height: 1.7,
    speed: 7.0,
    jumpForce: 8.0,
    description: 'Green, rowdy prankster with flowing dark hair and boundless hype. High tackle impact and wild victory moves.',
    unlocked: true,
    emoteName: 'Shirt Spin Whirlwind'
  },
  {
    id: 'hifive_ghost',
    name: 'Hi-Five Ghost',
    species: 'Ghost',
    catchphrase: "Up top, bro!",
    color: '#a5f3fc', // Translucent neon cyan
    accentColor: '#ffffff',
    height: 1.6,
    speed: 7.4,
    jumpForce: 8.8,
    description: 'Floating celestial spirit with a single hand growing from his head. Smooth floating glides and high-fives.',
    unlocked: true,
    emoteName: 'Supreme High Five'
  },
  {
    id: 'benson',
    name: 'Benson',
    species: 'Gumball Machine',
    catchphrase: "GET BACK TO WORK OR YOU'RE FIRED!",
    color: '#dc2626', // Red metal body
    accentColor: '#38bdf8', // Glass dome with rainbow gumballs
    height: 1.85,
    speed: 7.5,
    jumpForce: 8.2,
    description: 'Fiery park manager with a glass globe head filled with colorful bouncing gumballs. Driven by sheer rage and discipline.',
    unlocked: true,
    emoteName: 'Gumball Rage Flare'
  },
  {
    id: 'pops',
    name: 'Pops',
    species: 'Lollipop Gentleman',
    catchphrase: "Good show! Jolly good show!",
    color: '#fed7aa', // Light candy peach
    accentColor: '#18181b', // Black tuxedo & top hat
    height: 1.8,
    speed: 6.6,
    jumpForce: 8.4,
    description: 'Eccentric, gentlemanly lollipop figure with curling mustache, classy top hat, and gentle childlike joy.',
    unlocked: true,
    emoteName: 'Jolly Laugh Clap'
  },
  {
    id: 'margaret',
    name: 'Margaret',
    species: 'Red Robin',
    catchphrase: "Looking sharp, boys!",
    color: '#e11d48', // Crimson red robin
    accentColor: '#ffffff',
    height: 1.9,
    speed: 7.6,
    jumpForce: 8.6,
    description: 'Energetic red robin with great aerial grace and nimble park navigation skills.',
    unlocked: false,
    unlockRequirement: 'Win 2 DIDY CUP matches',
    emoteName: 'Robin Wing Wave'
  },
  {
    id: 'eileen',
    name: 'Eileen',
    species: 'Mole',
    catchphrase: "Science says we got this!",
    color: '#78350f', // Brown mole
    accentColor: '#fbbf24', // Yellow nerd glasses
    height: 1.5,
    speed: 7.3,
    jumpForce: 7.9,
    description: 'Clever mole with thick iconic glasses and inventive gadgets to uncover hidden secrets.',
    unlocked: false,
    unlockRequirement: 'Collect 1,000 Park Points',
    emoteName: 'Adjust Glasses Spark'
  }
];
