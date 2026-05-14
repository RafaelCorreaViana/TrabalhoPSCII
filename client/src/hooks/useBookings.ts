import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

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

const handleResponse = async (res: Response) => {
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw { response: { data: body } };
  return body;
};

export const useBookings = (venueId?: string) => {
  const queryClient = useQueryClient();

  const getVenueBookings = useQuery({
    queryKey: ['bookings', venueId],
    queryFn: async () => {
      const data = await fetch(`/api/venues/${venueId}/bookings`, { credentials: 'include' }).then(handleResponse);
      return data.bookings as Booking[];
    },
    enabled: !!venueId,
  });

  const createBooking = useMutation({
    mutationFn: async ({ venueId, startTime, endTime, matchId }: {
      venueId: string; startTime: string; endTime: string; matchId?: string;
    }) => {
      return fetch(`/api/venues/${venueId}/bookings`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startTime, endTime, matchId }),
      }).then(handleResponse);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings', venueId] });
    },
  });

  const updateBookingStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Booking['status'] }) => {
      return fetch(`/api/bookings/${id}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      }).then(handleResponse);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });

  return { getVenueBookings, createBooking, updateBookingStatus };
};
