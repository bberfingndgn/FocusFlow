'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../client';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export interface UseCollectionResult<T> {
  data: T[] | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * React hook to subscribe to a Supabase table collection in real-time.
 * 
 * @template T The type of items in the collection
 * @param tableName The name of the Supabase table
 * @param filters Optional filters (e.g., { column: 'user_id', value: userId })
 * @param enabled Whether the query should run (default: true)
 * @returns Object with data, isLoading, error
 */
export function useCollection<T = any>(
  tableName: string | null,
  filters?: { column: string; value: any }[],
  enabled: boolean = true
): UseCollectionResult<T> {
  const [data, setData] = useState<T[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!tableName || !enabled) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Build query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = supabase.from(tableName as any).select('*');

    // Apply filters
    if (filters && filters.length > 0) {
      filters.forEach(({ column, value }) => {
        if (value !== null && value !== undefined) {
          query = query.eq(column, value);
        }
      });
    }

    // Fetch initial data
    void Promise.resolve(query).then(({ data: initialData, error: fetchError }) => {
      if (fetchError) {
        setError(fetchError);
        setData(null);
        setIsLoading(false);
        return;
      }
      setData(initialData as T[]);
      setIsLoading(false);
    }).catch(() => {
      setData(null);
      setIsLoading(false);
    });

    // Subscribe to real-time changes (optional - can be disabled for better performance)
    let channel: ReturnType<typeof supabase.channel> | null = null;
    
    // Only subscribe if filters are provided (to avoid too many subscriptions)
    if (filters && filters.length > 0) {
      const filterString = filters.map(({ column, value }) => `${column}=eq.${value}`).join('&');
      channel = supabase
        .channel(`${tableName}-changes-${filterString}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: tableName,
            filter: filterString,
          },
          (payload: RealtimePostgresChangesPayload<any>) => {
            if (payload.eventType === 'INSERT') {
              setData((prev) => [...(prev || []), payload.new as T]);
            } else if (payload.eventType === 'UPDATE') {
              setData((prev) =>
                prev?.map((item: any) =>
                  item.id === payload.new.id ? (payload.new as T) : item
                ) || null
              );
            } else if (payload.eventType === 'DELETE') {
              setData((prev) =>
                prev?.filter((item: any) => item.id !== payload.old.id) || null
              );
            }
          }
        )
        .subscribe();
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [tableName, enabled, JSON.stringify(filters)]);

  return { data, isLoading, error };
}
