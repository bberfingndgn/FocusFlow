'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { type GrownFlower } from '@/lib/types';
import { Calendar, Book } from 'lucide-react';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { SUBJECT_EMOJIS, SUBJECT_BADGE_COLORS } from '@/lib/constants';

interface GrownFlowerCardProps {
  flower: GrownFlower;
}

export function GrownFlowerCard({ flower }: GrownFlowerCardProps) {
  const formattedDate = flower.grownAt instanceof Date
    ? flower.grownAt.toLocaleDateString()
    : new Date(flower.grownAt).toLocaleDateString();

  return (
    <Link href={`/subjects/${encodeURIComponent(flower.subject)}`} className="block group">
      <Card className="overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 h-full">
        <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[200px]">
          <div className="text-7xl mb-4">
            {SUBJECT_EMOJIS[flower.subject] ?? "🌸"}
          </div>
          <div className="text-center space-y-3 w-full">
            <Badge variant="outline" className={cn("font-medium text-base px-3 py-1", SUBJECT_BADGE_COLORS[flower.subject] ?? 'border-gray-300')}>
              <Book className="w-4 h-4 mr-1.5" />
              {flower.subject}
            </Badge>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span suppressHydrationWarning>Grown on {formattedDate}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
