import { useMutation, useQueryClient } from '@tanstack/react-query';
import { matchesApi } from '../lib/api';

export const useCreateMatch = (eventId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => matchesApi.create(eventId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
    },
  });
};

export const useUpdateMatch = (eventId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => matchesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
    },
  });
};

export const useDeleteMatch = (eventId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: matchesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
    },
  });
};
