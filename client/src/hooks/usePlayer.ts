import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { playerApi } from '../lib/api';

export const usePublicEvents = (params?: { sport?: string; search?: string }) => {
  return useQuery({
    queryKey: ['public-events', params],
    queryFn: () => playerApi.getEvents(params),
  });
};

export const usePublicEvent = (id: string) => {
  return useQuery({
    queryKey: ['public-event', id],
    queryFn: () => playerApi.getEventById(id),
    enabled: !!id,
  });
};

export const usePlayerDashboard = () => {
  return useQuery({
    queryKey: ['player-dashboard'],
    queryFn: playerApi.getDashboard,
  });
};

export const usePlayerTeams = () => {
  return useQuery({
    queryKey: ['player-teams'],
    queryFn: playerApi.getTeams,
  });
};

export const usePlayerMatches = () => {
  return useQuery({
    queryKey: ['player-matches'],
    queryFn: playerApi.getMatches,
  });
};

export const useRegisterForEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) => playerApi.register(eventId),
    onSuccess: (_, eventId) => {
      queryClient.invalidateQueries({ queryKey: ['public-event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['player-dashboard'] });
    },
  });
};

export const useCancelRegistration = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) => playerApi.cancelRegistration(eventId),
    onSuccess: (_, eventId) => {
      queryClient.invalidateQueries({ queryKey: ['public-event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['player-dashboard'] });
    },
  });
};
