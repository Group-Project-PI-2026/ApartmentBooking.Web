import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, unwrap, type components } from '@/shared/api'

export type CreateOwnerRequest = components['schemas']['CreateOwnerRequestRequest']
export type OwnerRequestDetailsDto = components['schemas']['OwnerRequestDetailsDto']
export type OwnerRequestListItemDto = components['schemas']['OwnerRequestListItemDto']

export type OwnerRequestStatus = 'New' | 'Approved' | 'NeedsClarification' | 'Rejected'

export function requestStatus(value: unknown): OwnerRequestStatus {
  return String(value) as OwnerRequestStatus
}

export function requestNumber(value: number | string): string {
  return `OWN-${String(value).padStart(4, '0')}`
}

export function useDistricts() {
  return useQuery({
    queryKey: ['districts'],
    queryFn: () => unwrap(api.GET('/api/apartments/districts')),
    staleTime: Infinity,
  })
}

export function useMyOwnerRequests() {
  return useQuery({
    queryKey: ['owner-requests', 'my'],
    queryFn: () => unwrap(api.GET('/api/owner-requests/my')),
  })
}

export function useMyOwnerRequest(id: string) {
  return useQuery({
    queryKey: ['owner-requests', 'my', id],
    queryFn: () => unwrap(api.GET('/api/owner-requests/my/{id}', { params: { path: { id } } })),
    enabled: Boolean(id),
  })
}

export function useCreateOwnerRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateOwnerRequest) => unwrap(api.POST('/api/owner-requests', { body })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['owner-requests', 'my'] }),
  })
}
