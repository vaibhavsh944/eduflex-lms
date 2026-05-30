import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { format, startOfWeek, addDays, addMinutes, parseISO } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { CalendarDays, Clock, Users, X } from 'lucide-react'
import type { OfficeHourSlot } from '@/lib/types'

const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function StudentOfficeHoursPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const [selectedSlot, setSelectedSlot] = useState<OfficeHourSlot | null>(null)
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false)
  const [isBooking, setIsBooking] = useState(false)

  const { data: availableSlots, isLoading } = useQuery({
    queryKey: ['office-hours', 'available', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('office_hour_slots')
        .select('*')
        .eq('course_id', courseId)
        .eq('is_booked', false)
        .gt('starts_at', new Date().toISOString())
        .order('starts_at', { ascending: true })

      if (error) throw error
      return (data ?? [])
    },
    enabled: !!courseId,
  })

  const { data: myBookings } = useQuery({
    queryKey: ['office-hours', 'my-bookings', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('office_hour_slots')
        .select('*')
        .eq('student_id', user?.id)
        .gt('starts_at', new Date().toISOString())
        .order('starts_at', { ascending: true })

      if (error) throw error
      return (data ?? [])
    },
    enabled: !!user?.id,
  })

  const handleBook = async () => {
    if (!selectedSlot || !user) return
    setIsBooking(true)

    const meetingUrl = `https://meet.eduflow.com/oh-${selectedSlot.id}`

    const { error } = await supabase
      .from('office_hour_slots')
      .update({
        is_booked: true,
        student_id: user.id,
        meeting_url: meetingUrl,
      })
      .eq('id', selectedSlot.id)

    if (error) {
      toast.error('Failed to book slot')
      setIsBooking(false)
      return
    }

    toast.success('Office hour booked!')
    queryClient.invalidateQueries({ queryKey: ['office-hours', 'available', courseId] })
    queryClient.invalidateQueries({ queryKey: ['office-hours', 'my-bookings', user?.id] })
    setBookingDialogOpen(false)
    setSelectedSlot(null)
    setIsBooking(false)
  }

  const handleCancel = async (slotId: string) => {
    const { error } = await supabase
      .from('office_hour_slots')
      .update({
        is_booked: false,
        student_id: null,
        meeting_url: null,
      })
      .eq('id', slotId)

    if (error) {
      toast.error('Failed to cancel booking')
      return
    }

    toast.success('Booking cancelled')
    queryClient.invalidateQueries({ queryKey: ['office-hours', 'available', courseId] })
    queryClient.invalidateQueries({ queryKey: ['office-hours', 'my-bookings', user?.id] })
  }

  const groupedByDay: Record<string, OfficeHourSlot[]> = {}
  availableSlots?.forEach((slot) => {
    const dateStr = format(new Date(slot.starts_at), 'yyyy-MM-dd')
    if (!groupedByDay[dateStr]) groupedByDay[dateStr] = []
    groupedByDay[dateStr].push(slot)
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Office Hours</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Book a one-on-one session with your instructor.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Available Slots</CardTitle>
          <CardDescription>Click a time slot to book it.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !availableSlots || availableSlots.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <CalendarDays className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No available office hours right now. Check back later!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedByDay).map(([dateStr, slots]) => (
                <div key={dateStr}>
                  <h4 className="mb-2 text-sm font-medium">
                    {format(parseISO(dateStr), 'EEEE, MMM d')}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {slots.map((slot) => (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => { setSelectedSlot(slot); setBookingDialogOpen(true) }}
                        className="rounded-md border px-3 py-2 text-sm hover:bg-muted transition-colors"
                      >
                        <Clock className="mr-1 inline h-3 w-3" />
                        {format(new Date(slot.starts_at), 'h:mm a')} -{' '}
                        {format(new Date(slot.ends_at), 'h:mm a')}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">My Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          {!myBookings || myBookings.length === 0 ? (
            <p className="text-sm text-muted-foreground">You have no upcoming bookings.</p>
          ) : (
            <div className="space-y-3">
              {myBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        {format(new Date(booking.starts_at), 'MMM d, yyyy')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(booking.starts_at), 'h:mm a')} -{' '}
                        {format(new Date(booking.ends_at), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => handleCancel(booking.id)}
                  >
                    <X className="mr-1 h-3 w-3" />
                    Cancel
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Book Office Hours</DialogTitle>
            <DialogDescription>
              Confirm your booking with the instructor.
            </DialogDescription>
          </DialogHeader>

          {selectedSlot && (
            <div className="space-y-3 py-4">
              <div className="flex items-center gap-2 text-sm">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <span>{format(new Date(selectedSlot.starts_at), 'EEEE, MMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  {format(new Date(selectedSlot.starts_at), 'h:mm a')} -{' '}
                  {format(new Date(selectedSlot.ends_at), 'h:mm a')}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                A meeting link will be generated upon confirmation.
              </p>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setBookingDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBook} disabled={isBooking}>
              {isBooking ? 'Booking...' : 'Confirm Booking'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
