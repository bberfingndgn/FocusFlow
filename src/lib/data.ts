import { type Achievement, type GrownFlower } from '@/lib/types';
import { Timer, Zap, Sun, Award, Mountain, Heart, MousePointerClick, Star } from 'lucide-react';

export const achievements: Achievement[] = [
  {
    id: '1',
    title: 'First Bloom',
    description: 'Complete your first study session.',
    milestoneHours: 25 / 60,
    unlocked: true,
    Icon: Timer,
  },
  {
    id: '2',
    title: 'Study Sprout',
    description: 'Accumulate 1 hour of focused study time.',
    milestoneHours: 1,
    unlocked: false,
    Icon: Zap,
  },
  {
    id: '3',
    title: 'Dedicated Gardener',
    description: 'Accumulate 5 hours of focused study time.',
    milestoneHours: 5,
    unlocked: false,
    Icon: Sun,
    reward: {
        type: 'flower',
        item: 'lavender'
    }
  },
  {
    id: '4',
    title: 'Focus Master',
    description: 'Accumulate 10 hours of focused study time.',
    milestoneHours: 10,
    unlocked: false,
    Icon: Award,
  },
  {
    id: '5',
    title: 'Bloom Expert',
    description: 'Grow your first complete flower.',
    milestoneHours: 4, 
    unlocked: false,
    Icon: Mountain,
  },
  {
    id: 'companion-friend',
    title: 'Companion Friend',
    description: 'Click on your companion 10 times.',
    milestoneHours: 0, // This is not time-based
    unlocked: false,
    Icon: Heart,
    hidden: true,
  },
  {
    id: 'perfect-timing',
    title: 'Perfect Timing',
    description: 'Finish a study session exactly on time.',
    milestoneHours: 0,
    unlocked: false,
    Icon: Star,
    hidden: true,
  },
];

export const grownFlowers: GrownFlower[] = [
  {
    id: 'math-flower-1',
    subject: 'Mathematics',
    flowerTypeId: 'sunflower',
    grownAt: new Date('2024-05-20'),
  },
  {
    id: 'english-flower-1',
    subject: 'English',
    flowerTypeId: 'daisy',
    grownAt: new Date('2024-05-22'),
  },
    {
    id: 'science-flower-1',
    subject: 'Science',
    flowerTypeId: 'rose',
    grownAt: new Date('2024-05-21'),
  },
  {
    id: 'history-flower-1',
    subject: 'Social Studies',
    flowerTypeId: 'tulip',
    grownAt: new Date('2024-05-23'),
  },
];
