import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import { formatDateKey, formatDateKeyDisplay } from '../../lib/fitnessUtils'
import type { FitnessCalendar, WorkoutPlan } from '../../types'

interface CalendarViewProps {
  onDateSelect: (dateKey: string) => void
  onClose: () => void
}

export default function CalendarView({ onDateSelect, onClose }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarData, setCalendarData] = useState<FitnessCalendar[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutPlan | null>(null)
  const [loading, setLoading] = useState(false)

  const currentMonth = currentDate.getMonth() + 1
  const currentYear = currentDate.getFullYear()

  useEffect(() => {
    loadCalendarData()
  }, [currentMonth, currentYear])

  const loadCalendarData = async () => {
    setLoading(true)
    try {
      const response = await api.getFitnessCalendar(currentMonth, currentYear)

      if (response.success && response.data?.calendar) {
        setCalendarData(response.data.calendar)
      }
    } catch (error) {
      console.error('Failed to load calendar data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDateClick = async (dateKey: string) => {
    setSelectedDate(dateKey)

    try {
      const response = await api.getWorkoutByDate(dateKey)

      if (response.success && response.data?.workouts && response.data.workouts.length > 0) {
        setSelectedWorkout(response.data.workouts[0])
      } else {
        setSelectedWorkout(null)
      }
    } catch (error) {
      console.error('Failed to load workout details:', error)
    }
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
    setSelectedDate(null)
    setSelectedWorkout(null)
  }

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    return { firstDay, daysInMonth }
  }

  const getWorkoutsForDate = (dateKey: string) => {
    return calendarData.filter(w => w.date_key === dateKey)
  }

  const { firstDay, daysInMonth } = getDaysInMonth()
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December']

  return (
    <div className="fitness-calendar-view">
      <div className="fitness-calendar-header">
        <button className="fitness-calendar-nav" onClick={() => navigateMonth('prev')}>
          ‹
        </button>
        <h3>{monthNames[currentMonth - 1]} {currentYear}</h3>
        <button className="fitness-calendar-nav" onClick={() => navigateMonth('next')}>
          ›
        </button>
        <button className="fitness-close-btn" onClick={onClose}>✕</button>
      </div>

      <div className="fitness-calendar-grid">
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="fitness-calendar-day-header">
            {day}
          </div>
        ))}

        {/* Empty cells for days before the first day of the month */}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="fitness-calendar-day empty" />
        ))}

        {/* Days of the month */}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1
          const dateKey = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const workouts = getWorkoutsForDate(dateKey)
          const hasWorkout = workouts.length > 0
          const hasCompleted = workouts.some(w => w.completed_at)
          const isSelected = selectedDate === dateKey
          const isToday = dateKey === formatDateKey(new Date())

          return (
            <button
              key={day}
              className={`fitness-calendar-day ${hasWorkout ? 'has-workout' : ''} ${hasCompleted ? 'completed' : ''} ${isSelected ? 'selected' : ''} ${isToday ? 'is-today' : ''}`}
              onClick={() => handleDateClick(dateKey)}
            >
              <span className="fitness-calendar-day-number">{day}</span>
              {hasWorkout && (
                <div className="fitness-calendar-indicators">
                  {workouts.map(w => (
                    <div
                      key={w.id}
                      className={`fitness-calendar-indicator ${w.training_type} ${w.completed_at ? 'completed' : ''}`}
                      title={`${w.training_type} - ${w.completed_at ? 'Completed' : 'In progress'}`}
                    />
                  ))}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Workout detail panel */}
      {selectedDate && (
        <div className="fitness-calendar-detail">
          <h4>{formatDateKeyDisplay(selectedDate)}</h4>
          {selectedWorkout ? (
            <div className="fitness-calendar-workout-detail">
              <div className="fitness-calendar-workout-type">
                {selectedWorkout.training_type === 'strength' ? '💪 Strength' : '🏃 Cardio'}
                {selectedWorkout.completed_at && <span className="completed-badge">Completed</span>}
              </div>
              {selectedWorkout.exercises?.strength && selectedWorkout.exercises.strength.length > 0 && (
                <div className="fitness-calendar-exercises">
                  {selectedWorkout.exercises.strength.map((ex: any) => (
                    <div key={ex.id} className="fitness-calendar-exercise">
                      <span className="exercise-name">{ex.exercise_name}</span>
                      <span className="exercise-stats">{ex.sets}×{ex.reps}{ex.weight ? ` @ ${ex.weight}kg` : ''}</span>
                    </div>
                  ))}
                </div>
              )}
              {selectedWorkout.exercises?.cardio && selectedWorkout.exercises.cardio.length > 0 && (
                <div className="fitness-calendar-exercises">
                  {selectedWorkout.exercises.cardio.map((ex: any) => (
                    <div key={ex.id} className="fitness-calendar-exercise">
                      <span className="exercise-name">{ex.exercise_type}</span>
                      <span className="exercise-stats">{ex.duration_minutes} min</span>
                    </div>
                  ))}
                </div>
              )}
              <button
                className="fitness-calendar-view-btn"
                onClick={() => onDateSelect(selectedDate)}
              >
                View in Workout
              </button>
            </div>
          ) : (
            <div className="fitness-calendar-no-workout">
              <p>No workout recorded</p>
              <button
                className="fitness-calendar-create-btn"
                onClick={() => onDateSelect(selectedDate)}
              >
                + Add Workout
              </button>
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="fitness-calendar-legend">
        <div className="legend-item">
          <div className="legend-dot strength" />
          <span>Strength</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot cardio" />
          <span>Cardio</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot completed" />
          <span>Completed</span>
        </div>
      </div>
    </div>
  )
}
