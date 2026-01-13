// Avatar options for profile selection
export const avatarOptions = [
  {
    id: 'adventurer',
    name: 'Adventurer',
    url: (seed: string) => `https://api.dicebear.com/8.x/adventurer/svg?seed=${seed}`,
    emoji: '🧑‍🚀',
  },
  {
    id: 'avataaars',
    name: 'Avataaars',
    url: (seed: string) => `https://api.dicebear.com/8.x/avataaars/svg?seed=${seed}`,
    emoji: '👤',
  },
  {
    id: 'big-smile',
    name: 'Big Smile',
    url: (seed: string) => `https://api.dicebear.com/8.x/big-smile/svg?seed=${seed}`,
    emoji: '😊',
  },
  {
    id: 'bottts',
    name: 'Bot',
    url: (seed: string) => `https://api.dicebear.com/8.x/bottts/svg?seed=${seed}`,
    emoji: '🤖',
  },
  {
    id: 'fun-emoji',
    name: 'Fun Emoji',
    url: (seed: string) => `https://api.dicebear.com/8.x/fun-emoji/svg?seed=${seed}`,
    emoji: '😄',
  },
  {
    id: 'lorelei',
    name: 'Lorelei',
    url: (seed: string) => `https://api.dicebear.com/8.x/lorelei/svg?seed=${seed}`,
    emoji: '👸',
  },
  {
    id: 'micah',
    name: 'Micah',
    url: (seed: string) => `https://api.dicebear.com/8.x/micah/svg?seed=${seed}`,
    emoji: '🎨',
  },
  {
    id: 'miniavs',
    name: 'Mini Avatars',
    url: (seed: string) => `https://api.dicebear.com/8.x/miniavs/svg?seed=${seed}`,
    emoji: '👶',
  },
  {
    id: 'open-peeps',
    name: 'Open Peeps',
    url: (seed: string) => `https://api.dicebear.com/8.x/open-peeps/svg?seed=${seed}`,
    emoji: '👥',
  },
  {
    id: 'personas',
    name: 'Personas',
    url: (seed: string) => `https://api.dicebear.com/8.x/personas/svg?seed=${seed}`,
    emoji: '🎭',
  },
  {
    id: 'pixel-art',
    name: 'Pixel Art',
    url: (seed: string) => `https://api.dicebear.com/8.x/pixel-art/svg?seed=${seed}`,
    emoji: '🎮',
  },
  {
    id: 'shapes',
    name: 'Shapes',
    url: (seed: string) => `https://api.dicebear.com/8.x/shapes/svg?seed=${seed}`,
    emoji: '🔷',
  },
];

export type AvatarOption = typeof avatarOptions[number];
