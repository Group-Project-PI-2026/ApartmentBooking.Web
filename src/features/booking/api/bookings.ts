import { useMutation } from '@tanstack/react-query'
import { api, unwrap, type components } from '@/shared/api'

export type ReserveBookingRequest = components['schemas']['ReserveBookingRequest']

export function useReserveBooking() {
  return useMutation({
    mutationFn: (body: ReserveBookingRequest) =>
      unwrap(api.POST('/api/bookings/reserve', { body })),
  })
}
