import { useState } from 'react'
import TemplateSelector from './TemplateSelector'
import CalendarView from './CalendarView'
import ProgressView from './ProgressView'
import type { WorkoutPlan } from '../../types'

interface FitnessDashboardProps {
  trainingType: 'strength' | 'cardio'
  onTemplateSelect: (workout: WorkoutPlan) => void
  onCreateBlank: () => void
  onCalendarSelect: (dateKey: string) => void
  stats?: {
    totalWorkouts: number
    totalStrengthSets: number
    totalCardioMinutes: number
  }
  fitnessDate: Date
  onStatsRefresh?: (period: 'week' | 'month') => void
}

export default function FitnessDashboard({
  trainingType,
  onTemplateSelect,
  onCreateBlank,
  onCalendarSelect,
  stats,
  fitnessDate,
  onStatsRefresh,
}: FitnessDashboardProps) {
  const [view, setView] = useState<'dashboard' | 'templates' | 'calendar' | 'progress'>('dashboard')
  const [statsPeriod, setStatsPeriod] = useState<'week' | 'month'>('week')
  const [selectedStat, setSelectedStat] = useState<string | null>(null)

  const getTodaySuggestion = () => {
    // Use fitnessDate instead of current date
    const dayOfWeek = fitnessDate.getDay()
    const suggestions: Record<number, { title: string; description: string }> = {
      0: { title: 'Rest Day', description: 'Take it easy today or do light cardio' },
      1: { title: 'Chest Day', description: 'Start your week strong with chest exercises' },
      2: { title: 'Back Day', description: 'Build a strong back today' },
      3: { title: 'Leg Day', description: 'Never skip leg day!' },
      4: { title: 'Shoulder Day', description: 'Shoulder focused workout' },
      5: { title: 'Arm Day', description: 'Focus on biceps and triceps' },
      6: { title: 'Active Recovery', description: 'Light cardio or stretching' },
    }
    return suggestions[dayOfWeek] || { title: 'Training Day', description: 'Time to workout!' }
  }

  const handleStatClick = (statType: string) => {
    setSelectedStat(selectedStat === statType ? null : statType)
    // Toggle between week and month when clicking stats
    const newPeriod = statsPeriod === 'week' ? 'month' : 'week'
    setStatsPeriod(newPeriod)
    if (onStatsRefresh) {
      onStatsRefresh(newPeriod)
    }
  }

  const suggestion = getTodaySuggestion()
  const todayKey = new Date().toISOString().split('T')[0]
  const isToday = fitnessDate.toISOString().split('T')[0] === todayKey

  if (view === 'templates') {
    return (
      <TemplateSelector
        trainingType={trainingType}
        onSelectTemplate={onTemplateSelect}
        onClose={() => setView('dashboard')}
        dateKey={fitnessDate.toISOString().split('T')[0]}
      />
    )
  }

  if (view === 'calendar') {
    return (
      <CalendarView
        onDateSelect={(dateKey) => {
          setView('dashboard')
          onCalendarSelect(dateKey)
        }}
        onClose={() => setView('dashboard')}
      />
    )
  }

  if (view === 'progress') {
    return <ProgressView onClose={() => setView('dashboard')} />
  }

  return (
    <div className="fitness-dashboard">
      {/* Welcome Section */}
      <div className="fitness-dashboard-welcome">
        <h2>Hi there! 💪</h2>
        <p className="fitness-dashboard-subtitle">
          {isToday ? "What's your plan for today?" : `Viewing ${fitnessDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`}
        </p>
      </div>

      {/* Weekly Stats */}
      {stats && (
        <div className="fitness-weekly-stats">
          <h3>This {statsPeriod === 'week' ? 'Week' : 'Month'} <span style={{ fontSize: '0.7em', opacity: 0.6 }}>(click to toggle)</span></h3>
          <div className="fitness-stats-row">
            <div
              className={`fitness-stat-card ${selectedStat === 'workouts' ? 'selected' : ''}`}
              onClick={() => handleStatClick('workouts')}
              style={{ cursor: 'pointer', transition: 'transform 0.1s' }}
            >
              <div className="fitness-stat-icon">📊</div>
              <div className="fitness-stat-value">{stats.totalWorkouts}</div>
              <div className="fitness-stat-label">Workouts</div>
            </div>
            <div
              className={`fitness-stat-card ${selectedStat === 'sets' ? 'selected' : ''}`}
              onClick={() => handleStatClick('sets')}
              style={{ cursor: 'pointer', transition: 'transform 0.1s' }}
            >
              <div className="fitness-stat-icon">💪</div>
              <div className="fitness-stat-value">{stats.totalStrengthSets}</div>
              <div className="fitness-stat-label">Sets</div>
            </div>
            <div
              className={`fitness-stat-card ${selectedStat === 'minutes' ? 'selected' : ''}`}
              onClick={() => handleStatClick('minutes')}
              style={{ cursor: 'pointer', transition: 'transform 0.1s' }}
            >
              <div className="fitness-stat-icon">⏱️</div>
              <div className="fitness-stat-value">{stats.totalCardioMinutes}</div>
              <div className="fitness-stat-label">Minutes</div>
            </div>
          </div>
        </div>
      )}

      {/* Today's Suggestion */}
      {isToday && (
        <div className="fitness-suggestion-card">
          <div className="fitness-suggestion-icon">
            {trainingType === 'strength' ? '💪' : '🏃'}
          </div>
          <div className="fitness-suggestion-content">
            <h4>{suggestion.title}</h4>
            <p>{suggestion.description}</p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="fitness-quick-actions">
        <h3>Quick Start</h3>

        <button
          className="fitness-action-card primary"
          onClick={() => setView('templates')}
        >
          <div className="fitness-action-icon">📋</div>
          <div className="fitness-action-content">
            <div className="fitness-action-title">Use Template</div>
            <div className="fitness-action-desc">Start with a pre-built workout</div>
          </div>
          <div className="fitness-action-arrow">→</div>
        </button>

        <button
          className="fitness-action-card secondary"
          onClick={onCreateBlank}
        >
          <div className="fitness-action-icon">✏️</div>
          <div className="fitness-action-content">
            <div className="fitness-action-title">Blank Workout</div>
            <div className="fitness-action-desc">Create from scratch</div>
          </div>
          <div className="fitness-action-arrow">→</div>
        </button>

        <button
          className="fitness-action-card secondary"
          onClick={() => setView('calendar')}
        >
          <div className="fitness-action-icon">📅</div>
          <div className="fitness-action-content">
            <div className="fitness-action-title">View Calendar</div>
            <div className="fitness-action-desc">See workout history</div>
          </div>
          <div className="fitness-action-arrow">→</div>
        </button>

        <button
          className="fitness-action-card secondary"
          onClick={() => setView('progress')}
        >
          <div className="fitness-action-icon">📈</div>
          <div className="fitness-action-content">
            <div className="fitness-action-title">Progress</div>
            <div className="fitness-action-desc">Track your improvement</div>
          </div>
          <div className="fitness-action-arrow">→</div>
        </button>
      </div>

      {/* Recent Workouts Hint */}
      <div className="fitness-recent-hint">
        <p>💡 <strong>Tip:</strong> Use templates to save time! Your last workout data is auto-filled.</p>
      </div>
    </div>
  )
}
