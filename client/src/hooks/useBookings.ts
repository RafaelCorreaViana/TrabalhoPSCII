import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export interface Booking {
  id: string;
  venueId: string;
  bookedById: string;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED';
  matchId?: string;
  bookedBy?: { id: string; name: string; email: string };
  match?: { event?: { name: string } };
}

export const useBookings = (venueId?: string) => {
  const queryClient = useQueryClient();

  const getVenueBookings = useQuery({
    queryKey: ['bookings', venueId],
    queryFn: async () => {
      const { data } = await api.get(`/venues/${venueId}/bookings`);
      return data.bookings as Booking[];
    },
    enabled: !!venueId,
  });

  const createBooking = useMutation({
    mutationFn: async ({ venueId, data }: { venueId: string, data: Partial<Booking> }) => {
      const response = await api.post(`/venues/${venueId}/bookings`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bookings', variables.venueId] });
    },
  });

  const updateBookingStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Booking['status'] }) => {
      const { data } = await api.patch(`/bookings/${id}/status`, { status });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });

  return {
    getVenueBookings,
    createBooking,
    updateBookingStatus,
  };
};
