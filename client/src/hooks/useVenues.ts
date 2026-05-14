import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export interface Venue {
  id: string;
  name: string;
  address: string;
  sportTypes: string[];
  hourlyRate: number;
  description?: string;
  imageUrl?: string;
  adminId: string;
  createdAt: string;
  updatedAt: string;
}

export const useVenues = () => {
  const queryClient = useQueryClient();

  const getVenues = useQuery({
    queryKey: ['venues'],
    queryFn: async () => {
      const { data } = await api.get('/venues');
      return data.venues as Venue[];
    },
  });

  const getVenueById = (id: string) => useQuery({
    queryKey: ['venues', id],
    queryFn: async () => {
      const { data } = await api.get(`/venues/${id}`);
      return data.venue as Venue;
    },
    enabled: !!id,
  });

  const createVenue = useMutation({
    mutationFn: async (venueData: Partial<Venue>) => {
      const { data } = await api.post('/venues', venueData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues'] });
    },
  });

  return {
    getVenues,
    getVenueById,
    createVenue,
  };
};
