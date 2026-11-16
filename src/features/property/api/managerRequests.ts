import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, unwrap, type components } from '@/shared/api'
import type { OwnerRequestStatus } from './ownerRequests'

export type ApproveOwnerRequest = components['schemas']['ApproveOwnerRequestRequest']

export interface ManagerRequestsQuery {
  search: string
  status: OwnerRequestStatus | ''
  page: number
  pageSize: number
}

const key = ['manager', 'owner-requests'] as const

function searchTerm(value: string) {
  const term = value.trim()
  const number = /^own-?0*(\d+)$/i.exec(term)
  return number ? number[1] : term
}

export function useManagerRequests({ search, status, page, pageSize }: ManagerRequestsQuery) {
  const query = {
    Page: page,
    PageSize: pageSize,
    ...(search.trim() && { Search: searchTerm(search) }),
    ...(status && { Status: status as unknown as number }),
  }
  return useQuery({
    queryKey: [...key, query],
    queryFn: () => unwrap(api.GET('/api/management/owner-requests', { params: { query } })),
    placeholderData: keepPreviousData,
  })
}

export function useManagerRequest(id: string) {
  return useQuery({
    queryKey: [...key, id],
    queryFn: () =>
      unwrap(api.GET('/api/management/owner-requests/{id}', { params: { path: { id } } })),
    enabled: Boolean(id),
  })
}

type Decision =
  | { action: 'approve'; body: ApproveOwnerRequest }
  | { action: 'reject' | 'clarify'; message: string }

export function useDecideRequest(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (decision: Decision) => {
      const params = { path: { id } }
      switch (decision.action) {
        case 'approve':
          return unwrap(
            api.POST('/api/management/owner-requests/{id}/approve', {
              params,
              body: decision.body,
            }),
          )
        case 'reject':
          return unwrap(
            api.POST('/api/management/owner-requests/{id}/reject', {
              params,
              body: { message: decision.message },
            }),
          )
        case 'clarify':
          return unwrap(
            api.POST('/api/management/owner-requests/{id}/clarify', {
              params,
              body: { message: decision.message },
            }),
          )
      }
    },
    onSuccess: (updated) => {
      queryClient.setQueryData([...key, id], updated)
      return queryClient.invalidateQueries({ queryKey: key })
    },
  })
}
