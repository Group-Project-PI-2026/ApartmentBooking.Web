import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fromIso, todayIso } from '@/shared/lib/date'
import { managerMock, type DateBlock, type ManagerBooking } from './managerMock'

export type {
  BookingSource,
  DateBlock,
  HistoryEntry,
  ManagerApartment,
  ManagerBooking,
  ManagerBookingStatus,
  ManagerPaymentState,
  SyncState,
} from './managerMock'

const key = ['manager'] as const

export function useManagerApartments() {
  return useQuery({ queryKey: [...key, 'apartments'], queryFn: managerMock.apartments })
}

export function useManagerBookings() {
  return useQuery({ queryKey: [...key, 'bookings'], queryFn: managerMock.bookings })
}

export function useManagerBooking(id: string) {
  return useQuery({ queryKey: [...key, 'bookings', id], queryFn: () => managerMock.booking(id) })
}

export function useDateBlocks() {
  return useQuery({ queryKey: [...key, 'blocks'], queryFn: managerMock.blocks })
}

export function useSyncState() {
  return useQuery({ queryKey: [...key, 'sync'], queryFn: managerMock.sync })
}

function useInvalidate() {
  const client = useQueryClient()
  return () => client.invalidateQueries({ queryKey: key })
}

export function useRetrySync() {
  const invalidate = useInvalidate()
  return useMutation({ mutationFn: managerMock.retrySync, onSuccess: invalidate })
}

export function useAddBlock() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (block: Omit<DateBlock, 'id'>) => managerMock.addBlock(block),
    onSuccess: invalidate,
  })
}

export function useUpdateBooking(id: string) {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: ({ patch, action }: { patch: Partial<ManagerBooking>; action: string }) =>
      managerMock.update(id, patch, action),
    onSuccess: invalidate,
  })
}

export function refundFor(booking: ManagerBooking, today = todayIso()) {
  const total = booking.total ?? 0
  const paid = booking.paid ?? 0
  const hoursLeft = (fromIso(booking.checkIn).getTime() - fromIso(today).getTime()) / 3_600_000
  const penaltyPercent = hoursLeft > 24 * 7 ? 0 : hoursLeft > 24 ? 10 : 100
  const penalty = penaltyPercent === 100 ? paid : Math.round((total * penaltyPercent) / 100)
  return { total, paid, penaltyPercent, penalty, refund: Math.max(paid - penalty, 0) }
}
