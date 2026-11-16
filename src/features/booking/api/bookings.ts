import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, unwrap, type components } from '@/shared/api'

export type ReserveBookingRequest = components['schemas']['ReserveBookingRequest']
export type BookingDetailsDto = components['schemas']['BookingDetailsDto']
export type BookingListItemDto = components['schemas']['BookingListItemDto']
export type RefundPreviewDto = components['schemas']['RefundPreviewDto']

export type BookingStatus = 'PartiallyPaid' | 'Paid' | 'Cancelled' | 'Completed'
export type BookingTab = 'Future' | 'Past' | 'Cancelled'
export type RefundStatus = 'None' | 'Pending' | 'Succeeded' | 'Failed'

export const bookingStatus = (b: { status: unknown }) => String(b.status) as BookingStatus

export function bookingNumber(id: string) {
  return id.slice(0, 8).toUpperCase()
}

export function useReserveBooking() {
  return useMutation({
    mutationFn: (body: ReserveBookingRequest) =>
      unwrap(api.POST('/api/bookings/reserve', { body })),
  })
}

export function useMyBookings(tab?: BookingTab, refetchInterval?: number | false) {
  return useQuery({
    queryKey: ['bookings', 'my', tab ?? 'all'],
    queryFn: () =>
      unwrap(
        api.GET('/api/bookings/my', {
          params: { query: tab ? { status: tab as unknown as number } : {} },
        }),
      ),
    refetchInterval,
  })
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: ['bookings', id],
    queryFn: () => unwrap(api.GET('/api/bookings/{id}', { params: { path: { id } } })),
  })
}

export function usePayBalance(id: string) {
  return useMutation({
    mutationFn: () =>
      unwrap(api.POST('/api/bookings/{id}/pay-balance', { params: { path: { id } } })),
  })
}

export function useRefundPreview(id: string) {
  return useQuery({
    queryKey: ['bookings', id, 'refund-preview'],
    queryFn: () =>
      unwrap(api.GET('/api/bookings/{id}/refund-preview', { params: { path: { id } } })),
  })
}

export function useCancelBooking(id: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: () => unwrap(api.POST('/api/bookings/{id}/cancel', { params: { path: { id } } })),
    onSuccess: () => client.invalidateQueries({ queryKey: ['bookings'] }),
  })
}
