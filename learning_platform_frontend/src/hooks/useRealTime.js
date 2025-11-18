/**
 * Supabase Realtime presence + broadcast hook.
 * - Creates a channel for a given roomId: `room:${roomId}`
 * - Tracks presence state for participants
 * - Exposes isConnected flag and sendSignal for broadcast signaling
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase, supabaseEnvStatus } from '../lib/supabase';
import { logger } from '../services/logger';

/**
 * PUBLIC_INTERFACE
 * useRealTime
 * Hook to manage realtime presence and broadcast in a classroom room.
 *
 * @param {Object} params
 * @param {string|number} params.roomId - Room ID used to create the realtime channel
 * @param {(signal: any) => void} [params.onSignal] - Optional callback to receive incoming broadcast signals
 * @param {string} [params.userId] - Optional stable user identifier to include in presence (defaults to 'guest-<random>')
 * @returns {{ participants: Array<{ user_id: string, joined_at: string }>, isConnected: boolean, sendSignal: (signal: any)=>Promise<boolean>, envOk: boolean }}
 */
export function useRealTime({ roomId, onSignal, userId }) {
  /** This is a public function. */
  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState([]);
  const channelRef = useRef(null);
  const presenceKey = useMemo(() => {
    const stableUserId = userId || `guest-${Math.random().toString(36).slice(2, 8)}`;
    return stableUserId;
  }, [userId]);

  const envOk = supabaseEnvStatus.hasUrl && supabaseEnvStatus.hasAnonKey;

  useEffect(() => {
    if (!envOk) {
      setIsConnected(false);
      setParticipants([]);
      return;
    }
    if (!roomId) {
      logger.warn?.('[useRealTime] No roomId provided');
      setIsConnected(false);
      setParticipants([]);
      return;
    }

    // Create channel for the room
    const channel = supabase.channel(`room:${roomId}`, {
      config: {
        presence: {
          key: presenceKey,
        },
      },
    });

    channelRef.current = channel;

    // Subscribe to presence sync to refresh participant list
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      // presenceState returns an object with presenceKey -> array of metas
      // We map into a flat participants list
      const entries = Object.entries(state || {});
      const mapped = entries.flatMap(([key, metas]) =>
        metas.map((meta) => ({
          user_id: meta?.user_id || key,
          joined_at: meta?.joined_at || meta?.online_at || new Date().toISOString(),
        })),
      );
      setParticipants(mapped);
    });

    // Listen for broadcast signals for WebRTC or other signaling
    channel.on('broadcast', { event: 'signal' }, (payload) => {
      try {
        const signal = payload?.payload;
        if (onSignal) {
          onSignal(signal);
        }
      } catch (e) {
        logger.error?.('[useRealTime] onSignal handler error', e);
      }
    });

    // Subscribe to channel
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        setIsConnected(true);
        try {
          // Track our presence
          await channel.track({
            user_id: presenceKey,
            joined_at: new Date().toISOString(),
          });
        } catch (e) {
          logger.error?.('[useRealTime] presence track error', e);
        }
      }
    });

    return () => {
      // Cleanup: Unsubscribe and reset state
      try {
        channel.unsubscribe();
      } catch (e) {
        logger.warn?.('[useRealTime] channel unsubscribe error', e);
      }
      if (channelRef.current === channel) {
        channelRef.current = null;
      }
      setIsConnected(false);
      setParticipants([]);
    };
  }, [envOk, roomId, presenceKey, onSignal]);

  const sendSignal = useCallback(
    async (signal) => {
      if (!channelRef.current) {
        return false;
      }
      try {
        const res = await channelRef.current.send({
          type: 'broadcast',
          event: 'signal',
          payload: signal,
        });
        return res === 'ok';
      } catch (e) {
        logger.error?.('[useRealTime] sendSignal error', e);
        return false;
      }
    },
    [],
  );

  return { participants, isConnected, sendSignal, envOk };
}

export default useRealTime;
