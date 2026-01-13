'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { type GrownFlower } from '@/lib/types';
import { type ImagePlaceholder } from '@/lib/placeholder-images';
import { Calendar, Book } from 'lucide-react';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { Skeleton } from '../ui/skeleton';

interface GrownFlowerCardProps {
  flower: GrownFlower;
  flowerData: ImagePlaceholder;
}

const subjectColors: Record<string, string> = {
  "Mathematics": "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-700",
  "Science": "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/50 dark:text-purple-200 dark:border-purple-700",
  "Social Studies": "bg-pink-100 text-pink-800 border-pink-300 dark:bg-pink-900/50 dark:text-pink-200 dark:border-pink-700",
  "English": "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-200 dark:border-yellow-700",
}

export function GrownFlowerCard({ flower, flowerData }: GrownFlowerCardProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const formattedDate = isMounted ? flower.grownAt.toLocaleDateString() : '';

  const subjectEmojis: Record<string, string> = {
    "Mathematics": "➕",
    "Science": "🧪",
    "Social Studies": "🌍",
    "English": "📖",
  };

  return (
    <Link href={`/subjects/${encodeURIComponent(flower.subject)}`} className="block group">
      <Card className="overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 h-full">
        <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[200px]">
          <div className="text-7xl mb-4">
            {subjectEmojis[flower.subject] || "🌸"}
          </div>
          <div className="text-center space-y-3 w-full">
            <Badge variant="outline" className={cn("font-medium text-base px-3 py-1", subjectColors[flower.subject] || 'border-gray-300')}>
                <Book className="w-4 h-4 mr-1.5" />
                {flower.subject}
            </Badge>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              {isMounted ? (
                <span>Grown on {formattedDate}</span>
              ) : (
                <Skeleton className="h-4 w-24" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
