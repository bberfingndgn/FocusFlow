'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../client';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export interface UseDocResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * React hook to subscribe to a single Supabase document in real-time.
 * 
 * @template T The type of the document
 * @param tableName The name of the Supabase table
 * @param id The ID of the document
 * @param enabled Whether the query should run (default: true)
 * @returns Object with data, isLoading, error
 */
export function useDoc<T = any>(
  tableName: string | null,
  id: string | null,
  enabled: boolean = true
): UseDocResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!tableName || !id || !enabled) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Fetch initial data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query = supabase.from(tableName as any).select('*').eq('id', id).single();
    void Promise.resolve(query).then(({ data: docData, error: fetchError }) => {
      if (fetchError) {
        if (fetchError.code !== 'PGRST116') setError(fetchError);
        setData(null);
        setIsLoading(false);
        return;
      }
      setData(docData as T);
      setIsLoading(false);
    }).catch(() => {
      setData(null);
      setIsLoading(false);
    });

    // Subscribe to real-time changes
    const channel = supabase
      .channel(`${tableName}-${id}-changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: tableName,
          filter: `id=eq.${id}`,
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            setData(payload.new as T);
          } else if (payload.eventType === 'DELETE') {
            setData(null);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tableName, id, enabled]);

  return { data, isLoading, error };
}
