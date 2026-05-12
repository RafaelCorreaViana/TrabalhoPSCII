import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';

let socket: Socket | null = null;

export const useSocket = (userId?: string) => {
  const queryClient = useQueryClient();
  const connected = useRef(false);

  useEffect(() => {
    if (!userId || connected.current) return;

    socket = io('/', {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      connected.current = true;
      console.log('[Socket.IO] Connected:', socket?.id);
    });

    // Ao receber nova notificação, invalidar o cache
    socket.on('notification:new', (data: { title: string; message: string; type: string }) => {
      console.log('[Socket.IO] notification:new:', data);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['player-dashboard'] });
    });

    socket.on('disconnect', () => {
      connected.current = false;
      console.log('[Socket.IO] Disconnected');
    });

    return () => {
      socket?.disconnect();
      socket = null;
      connected.current = false;
    };
  }, [userId, queryClient]);

  return socket;
};
