import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Venue {
  id: string;
  name: string;
  address: string;
  sportType: string;
  capacity?: number;
  description?: string;
  adminId: string;
  createdAt: string;
  admin?: { name: string; email: string };
}

const handleResponse = async (res: Response) => {
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw { response: { data: body } };
  return body;
};

const venuesApi = {
  getAll: () => fetch('/api/venues', { credentials: 'include' }).then(handleResponse),
  getById: (id: string) => fetch(`/api/venues/${id}`, { credentials: 'include' }).then(handleResponse),
  create: (data: Partial<Venue>) => fetch('/api/venues', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handleResponse),
  update: (id: string, data: Partial<Venue>) => fetch(`/api/venues/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handleResponse),
  delete: (id: string) => fetch(`/api/venues/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  }).then(handleResponse),
};

export const useVenues = () => {
  const queryClient = useQueryClient();

  const getVenues = useQuery({
    queryKey: ['venues'],
    queryFn: async () => {
      const data = await venuesApi.getAll();
      return data.venues as Venue[];
    },
  });

  const createVenue = useMutation({
    mutationFn: (venueData: Partial<Venue>) => venuesApi.create(venueData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues'] });
    },
  });

  const updateVenue = useMutation({
    mutationFn: ({ id, ...venueData }: Partial<Venue> & { id: string }) =>
      venuesApi.update(id, venueData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues'] });
    },
  });

  const deleteVenue = useMutation({
    mutationFn: (id: string) => venuesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues'] });
    },
  });

  return { getVenues, createVenue, updateVenue, deleteVenue };
};

export const useVenueById = (id: string) => {
  return useQuery({
    queryKey: ['venues', id],
    queryFn: async () => {
      const data = await venuesApi.getById(id);
      return data.venue as Venue;
    },
    enabled: !!id,
  });
};
