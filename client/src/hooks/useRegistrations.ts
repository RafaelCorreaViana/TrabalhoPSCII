import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { registrationsApi } from '../lib/api';

export const useRegistrations = (eventId: string) => {
  return useQuery({
    queryKey: ['registrations', eventId],
    queryFn: () => registrationsApi.getAllByEvent(eventId),
    enabled: !!eventId,
  });
};

export const useUpdateRegistrationStatus = (eventId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      registrationsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registrations', eventId] });
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
    },
  });
};
