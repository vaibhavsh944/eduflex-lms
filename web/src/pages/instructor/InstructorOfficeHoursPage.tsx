import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { format, addMinutes, startOfWeek, addDays } from 'date-fns'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { Save, Calendar, Clock, Users } from 'lucide-react'
import type { OfficeHourSlot } from '@/lib/types'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const START_HOUR = 8
const END_HOUR = 20
const SLOT_MINUTES = 30

function generateTimeSlots(): string[] {
  const slots: string[] = []
  for (let h = START_HOUR; h < END_HOUR; h++) {
    slots.push(`${h.toString().padStart(2, '0')}:00`)
    slots.push(`${h.toString().padStart(2, '0')}:30`)
  }
  return slots
}

const TIME_SLOTS = generateTimeSlots()

export function InstructorOfficeHoursPage() {
  const { user } = useAuth()
  const { courseId } = useParams<{ courseId: string }>()
  const [availability, setAvailability] = useState<Record<string, Set<string>>>({})
  const [saving, setSaving] = useState(false)

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })

  const { data: existingSlots, isLoading: slotsLoading } = useQuery({
    queryKey: ['office-hours', courseId],
    queryFn: async () => {
      const { data } = await supabase
        .from('office_hour_slots')
        .select('*')
        .eq('instructor_id', user?.id)
        .eq('is_recurring', true)
      return (data ?? [])
    },
    enabled: !!user?.id,
  })

  useEffect(() => {
    if (!existingSlots) return
    const mapped: Record<string, Set<string>> = {}
    existingSlots.forEach((slot) => {
      if (slot.day_of_week !== null) {
        const dayName = DAYS[slot.day_of_week]
        if (!mapped[dayName]) mapped[dayName] = new Set()
        const timeStr = format(new Date(slot.starts_at), 'HH:mm')
        mapped[dayName].add(timeStr)
      }
    })
    setAvailability(mapped)
  }, [existingSlots])

  const toggleSlot = (day: string, time: string) => {
    setAvailability((prev) => {
      const updated = { ...prev }
      const daySet = updated[day] ? new Set<string>(updated[day]) : new Set<string>()
      if (daySet.has(time)) {
        daySet.delete(time)
      } else {
        daySet.add(time)
      }
      if (daySet.size === 0) {
        delete updated[day]
      } else {
        updated[day] = daySet
      }
      return updated
    })
  }

  const saveAvailability = async () => {
    if (!user?.id) return
    setSaving(true)

    const { error: deleteError } = await supabase
      .from('office_hour_slots')
      .delete()
      .eq('instructor_id', user.id)
      .eq('is_recurring', true)

    if (deleteError) {
      toast.error('Failed to clear existing slots')
      setSaving(false)
      return
    }

    const records: Omit<OfficeHourSlot, 'id' | 'created_at'>[] = []

    Object.entries(availability).forEach(([day, times]) => {
      const dayIndex = DAYS.indexOf(day)
      times.forEach((time) => {
        const [h, m] = time.split(':').map(Number)
        const baseDate = addDays(weekStart, dayIndex)
        const startsAt = new Date(baseDate)
        startsAt.setHours(h, m, 0, 0)
        const endsAt = addMinutes(startsAt, SLOT_MINUTES)

        records.push({
          instructor_id: user.id,
          course_id: courseId ?? null,
          starts_at: startsAt.toISOString(),
          ends_at: endsAt.toISOString(),
          is_booked: false,
          student_id: null,
          meeting_url: null,
          is_recurring: true,
          day_of_week: dayIndex,
        })
      })
    })

    if (records.length > 0) {
      const { error } = await supabase.from('office_hour_slots').insert(records)
      if (error) {
        toast.error('Failed to save availability')
        setSaving(false)
        return
      }
    }

    toast.success('Office hours saved!')
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Office Hours"
        description="Set your weekly availability for student bookings."
        actions={
          <Button onClick={saveAvailability} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Weekly Availability</CardTitle>
        </CardHeader>
        <CardContent>
          {slotsLoading ? (
            <Skeleton className="h-96 w-full" />
          ) : (
            <div className="overflow-x-auto">
              <div className="grid grid-cols-8 gap-1 min-w-[700px]">
                <div className="text-xs font-medium text-muted-foreground p-2">Time</div>
                {DAYS.map((day) => (
                  <div key={day} className="text-center text-xs font-medium text-muted-foreground p-2">
                    {day.slice(0, 3)}
                  </div>
                ))}

                {TIME_SLOTS.map((time) => (
                  <>
                    <div key={`time-${time}`} className="flex items-center justify-end pr-2 text-xs text-muted-foreground">
                      {time}
                    </div>
                    {DAYS.map((day) => {
                      const isSelected = availability[day]?.has(time)
                      return (
                        <button
                          key={`${day}-${time}`}
                          type="button"
                          onClick={() => toggleSlot(day, time)}
                          className={cn(
                            'h-6 rounded-sm border text-[10px] transition-colors',
                            isSelected
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'border-transparent hover:bg-muted'
                          )}
                        />
                      )
                    })}
                  </>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <BookedSessions instructorId={user?.id} />
    </div>
  )
}

function BookedSessions({ instructorId }: { instructorId?: string }) {
  const { data: bookedSlots, isLoading } = useQuery({
    queryKey: ['booked-office-hours', instructorId],
    queryFn: async () => {
      const { data } = await supabase
        .from('office_hour_slots')
        .select('*')
        .eq('instructor_id', instructorId)
        .eq('is_booked', true)
        .gt('starts_at', new Date().toISOString())
        .order('starts_at', { ascending: true })
      return (data ?? [])
    },
    enabled: !!instructorId,
  })

  if (isLoading) return <Skeleton className="h-32 w-full" />

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Upcoming Booked Sessions
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!bookedSlots || bookedSlots.length === 0 ? (
          <p className="text-sm text-muted-foreground">No upcoming bookings.</p>
        ) : (
          <div className="space-y-3">
            {bookedSlots.map((slot) => (
              <div key={slot.id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      {format(new Date(slot.starts_at), 'MMM d, yyyy')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(slot.starts_at), 'h:mm a')} - {format(new Date(slot.ends_at), 'h:mm a')}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">Booked</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
