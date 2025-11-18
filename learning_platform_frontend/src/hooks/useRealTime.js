/**
 * Supabase Realtime presence + broadcast hook.
 * - Creates a channel for a given roomId: `room:${roomId}`
 * - Tracks presence state for participants
 * - Exposes isConnected/isConnecting flags, lastError and sendSignal for broadcast signaling
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
 * @returns {{
 *  participants: Array<{ user_id: string, joined_at: string }>,
 *  isConnected: boolean,
 *  isConnecting: boolean,
 *  lastError: string | null,
 *  sendSignal: (signal: any)=>Promise<boolean>,
 *  envOk: boolean
 * }}
 */
export function useRealTime({ roomId, onSignal, userId }) {
  /** This is a public function. */
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [lastError, setLastError] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]); // capped events log
  const channelRef = useRef(null);
  const presenceKey = useMemo(() => {
    const stableUserId = userId || `guest-${Math.random().toString(36).slice(2, 8)}`;
    return stableUserId;
  }, [userId]);

  const envOk = supabaseEnvStatus.hasUrl && supabaseEnvStatus.hasAnonKey;

  const pushEvent = useCallback((evt) => {
    // Keep last 50 events
    setRecentEvents((prev) => {
      const next = [{ ...evt, at: new Date().toISOString() }, ...prev];
      return next.slice(0, 50);
    });
  }, []);

  const reconnect = useCallback(() => {
    try {
      // Unsubscribe and allow effect to recreate on next tick
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
      // Force state transitions; effect will re-run due to roomId/envOk deps
      setIsConnecting(true);
      setIsConnected(false);
      setLastError(null);
    } catch (e) {
      logger.warn?.('[useRealTime] reconnect error', e);
    }
  }, []);

  const resendPresenceTrack = useCallback(async () => {
    if (!channelRef.current) return false;
    try {
      await channelRef.current.track({
        user_id: presenceKey,
        joined_at: new Date().toISOString(),
      });
      pushEvent({ type: 'presence', event: 'track', info: { user_id: presenceKey } });
      return true;
    } catch (e) {
      setLastError(String(e?.message || e));
      logger.error?.('[useRealTime] resendPresenceTrack error', e);
      return false;
    }
  }, [presenceKey, pushEvent]);

  useEffect(() => {
    if (!envOk) {
      setIsConnected(false);
      setIsConnecting(false);
      setLastError('Supabase environment not configured');
      setParticipants([]);
      return;
    }
    if (!roomId) {
      logger.warn?.('[useRealTime] No roomId provided');
      setIsConnected(false);
      setIsConnecting(false);
      setLastError('Missing roomId');
      setParticipants([]);
      return;
    }

    setIsConnecting(true);
    setIsConnected(false);
    setLastError(null);

    // Create channel for the room
    const channel = supabase.channel(`room:${roomId}`, {
      config: {
        presence: {
          key: presenceKey,
        },
      },
    });

    channelRef.current = channel;

    // Presence handlers
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      const entries = Object.entries(state || {});
      const mapped = entries.flatMap(([key, metas]) =>
        metas.map((meta) => ({
          user_id: meta?.user_id || key,
          joined_at: meta?.joined_at || meta?.online_at || new Date().toISOString(),
        })),
      );
      setParticipants(mapped);
      pushEvent({ type: 'presence', event: 'sync', info: { count: mapped.length } });
    });
    channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
      pushEvent({
        type: 'presence',
        event: 'join',
        info: { key, count: newPresences?.length || 1 },
      });
    });
    channel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      pushEvent({
        type: 'presence',
        event: 'leave',
        info: { key, count: leftPresences?.length || 1 },
      });
    });

    // Listen for broadcast signals for WebRTC or other signaling
    channel.on('broadcast', { event: 'signal' }, (payload) => {
      try {
        const signal = payload?.payload;
        pushEvent({ type: 'broadcast', event: 'signal', info: { sample: !!signal?.sample } });
        if (onSignal) {
          onSignal(signal);
        }
      } catch (e) {
        logger.error?.('[useRealTime] onSignal handler error', e);
      }
    });

    // Subscribe to channel
    channel.subscribe(async (status) => {
      pushEvent({ type: 'status', event: String(status) });
      if (status === 'SUBSCRIBED') {
        setIsConnected(true);
        setIsConnecting(false);
        try {
          await channel.track({
            user_id: presenceKey,
            joined_at: new Date().toISOString(),
          });
          pushEvent({ type: 'presence', event: 'track', info: { user_id: presenceKey } });
        } catch (e) {
          logger.error?.('[useRealTime] presence track error', e);
          setLastError(String(e?.message || e));
        }
      } else if (status === 'CHANNEL_ERROR') {
        setIsConnecting(false);
        setIsConnected(false);
        setLastError('Realtime channel error');
      } else if (status === 'TIMED_OUT') {
        setIsConnecting(false);
        setIsConnected(false);
        setLastError('Realtime channel timed out');
      } else if (status === 'CLOSED') {
        setIsConnecting(false);
        setIsConnected(false);
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
      setIsConnecting(false);
      setParticipants([]);
    };
  }, [envOk, roomId, presenceKey, onSignal, pushEvent]);

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
        pushEvent({ type: 'broadcast', event: 'send', info: { ok: res === 'ok' } });
        return res === 'ok';
      } catch (e) {
        logger.error?.('[useRealTime] sendSignal error', e);
        setLastError(String(e?.message || e));
        pushEvent({ type: 'broadcast', event: 'send', info: { ok: false } });
        return false;
      }
    },
    [pushEvent],
  );

  // PUBLIC_INTERFACE
  const sendBroadcast = sendSignal;

  return {
    participants,
    isConnected,
    isConnecting,
    lastError,
    sendSignal,
    sendBroadcast,
    envOk,
    recentEvents,
    reconnect,
    resendPresenceTrack,
    roomId,
    presenceKey,
  };
}

export default useRealTime;
