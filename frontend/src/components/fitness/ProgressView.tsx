import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import { getPersonalRecords, formatPRDisplay } from '../../lib/fitnessUtils'
import type { FitnessTrends, PersonalRecord } from '../../types'

interface ProgressViewProps {
  onClose: () => void
}

export default function ProgressView({ onClose }: ProgressViewProps) {
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter'>('month')
  const [trends, setTrends] = useState<FitnessTrends | null>(null)
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedTab, setSelectedTab] = useState<'trends' | 'pr' | 'frequency'>('trends')

  useEffect(() => {
    loadData()
  }, [period])

  const loadData = async () => {
    setLoading(true)
    try {
      // Load trends
      const trendsResponse = await api.getFitnessTrends(period)
      if (trendsResponse.success && trendsResponse.data) {
        setTrends(trendsResponse.data)
      }

      // Load PRs
      const prs = await getPersonalRecords()
      setPersonalRecords(prs)
    } catch (error) {
      console.error('Failed to load progress data:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderTrendChart = (data: any[], label: string) => {
    if (!data || data.length === 0) return null

    const maxValue = Math.max(...data.map(d => d.volume || d.duration || 0))
    const minValue = Math.min(...data.map(d => d.volume || d.duration || 0))
    const range = maxValue - minValue || 1

    return (
      <div className="fitness-trend-chart">
        <h4>{label}</h4>
        <div className="fitness-chart-container">
          <svg className="fitness-chart-svg" viewBox="0 0 300 150" preserveAspectRatio="none">
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map(ratio => (
              <line
                key={`grid-${ratio}`}
                x1="0"
                y1={150 - ratio * 140}
                x2="300"
                y2={150 - ratio * 140}
                stroke="#e0e0e0"
                strokeWidth="1"
                strokeDasharray="4"
              />
            ))}
            {/* Data line */}
            <polyline
              points={data.map((d, i) => {
                const x = (i / (data.length - 1 || 1)) * 280 + 10
                const value = d.volume || d.duration || 0
                const y = 150 - ((value - minValue) / range) * 140 - 5
                return `${x},${y}`
              }).join(' ')}
              fill="none"
              stroke="#FFB5C5"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Data points */}
            {data.map((d, i) => {
              const x = (i / (data.length - 1 || 1)) * 280 + 10
              const value = d.volume || d.duration || 0
              const y = 150 - ((value - minValue) / range) * 140 - 5
              return (
                <circle
                  key={`point-${i}`}
                  cx={x}
                  cy={y}
                  r="5"
                  fill="#FFB5C5"
                  stroke="#fff"
                  strokeWidth="2"
                />
              )
            })}
          </svg>
          <div className="fitness-chart-labels">
            <span>{minValue.toFixed(0)}</span>
            <span>{maxValue.toFixed(0)}</span>
          </div>
        </div>
        <div className="fitness-chart-dates">
          {data.length > 0 && (
            <>
              <span>{new Date(data[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              <span>{new Date(data[data.length - 1].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </>
          )}
        </div>
      </div>
    )
  }

  const renderFrequencyHeatmap = () => {
    if (!trends?.frequency) return null

    const weeks = Math.ceil(trends.frequency.length / 7)
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    return (
      <div className="fitness-frequency-heatmap">
        <h4>Training Frequency</h4>
        <div className="fitness-heatmap-grid">
          {days.map((day, dayIndex) => (
            <div key={day} className="fitness-heatmap-day-label">
              {day}
            </div>
          ))}
          {Array.from({ length: weeks * 7 }).map((_, i) => {
            const dataIndex = i
            const workout = trends.frequency[dataIndex]
            const intensity = workout ? Math.min(workout.count, 4) : 0

            return (
              <div
                key={i}
                className={`fitness-heatmap-cell intensity-${intensity}`}
                title={workout ? `${workout.date}: ${workout.count} workout(s)` : 'No workout'}
              />
            )
          })}
        </div>
        <div className="fitness-heatmap-legend">
          <span>Less</span>
          {['intensity-0', 'intensity-1', 'intensity-2', 'intensity-3', 'intensity-4'].map((intensity, i) => (
            <div key={intensity} className={`fitness-heatmap-legend-cell ${intensity}`} />
          ))}
          <span>More</span>
        </div>
      </div>
    )
  }

  return (
    <div className="fitness-progress-view">
      <div className="fitness-progress-header">
        <h3>Progress</h3>
        <button className="fitness-close-btn" onClick={onClose}>✕</button>
      </div>

      {/* Period selector */}
      <div className="fitness-period-selector">
        {(['week', 'month', 'quarter'] as const).map(p => (
          <button
            key={p}
            className={`fitness-period-btn ${period === p ? 'active' : ''}`}
            onClick={() => setPeriod(p)}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="fitness-progress-tabs">
        <button
          className={`fitness-progress-tab ${selectedTab === 'trends' ? 'active' : ''}`}
          onClick={() => setSelectedTab('trends')}
        >
          📈 Trends
        </button>
        <button
          className={`fitness-progress-tab ${selectedTab === 'pr' ? 'active' : ''}`}
          onClick={() => setSelectedTab('pr')}
        >
          🏆 PRs
        </button>
        <button
          className={`fitness-progress-tab ${selectedTab === 'frequency' ? 'active' : ''}`}
          onClick={() => setSelectedTab('frequency')}
        >
          📅 Calendar
        </button>
      </div>

      {loading ? (
        <div className="fitness-progress-loading">Loading...</div>
      ) : (
        <div className="fitness-progress-content">
          {selectedTab === 'trends' && (
            <div className="fitness-trends-content">
              {trends?.strength_trends && trends.strength_trends.length > 0 ? (
                <div className="fitness-strength-trends">
                  <h4>Strength Progress</h4>
                  {trends.strength_trends.slice(0, 5).map(trend =>
                    renderTrendChart(trend.data, trend.exercise_name)
                  )}
                </div>
              ) : (
                <div className="fitness-progress-empty">
                  <p>No strength data yet</p>
                  <small>Start logging workouts to see trends</small>
                </div>
              )}

              {trends?.cardio_trends && trends.cardio_trends.length > 0 && (
                <div className="fitness-cardio-trends">
                  <h4>Cardio Progress</h4>
                  {trends.cardio_trends.slice(0, 3).map(trend =>
                    renderTrendChart(trend.data, trend.exercise_type)
                  )}
                </div>
              )}
            </div>
          )}

          {selectedTab === 'pr' && (
            <div className="fitness-pr-content">
              {personalRecords.length > 0 ? (
                <div className="fitness-pr-list">
                  {personalRecords.map(pr => (
                    <div key={pr.id} className="fitness-pr-card">
                      <div className="fitness-pr-header">
                        <span className="fitness-pr-name">{pr.exercise_name}</span>
                        <span className="fitness-pr-type">{pr.training_type}</span>
                      </div>
                      <div className="fitness-pr-value">
                        {formatPRDisplay(pr, pr.training_type)}
                      </div>
                      <div className="fitness-pr-date">
                        Set {new Date(pr.achieved_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                      {pr.body_part && (
                        <div className="fitness-pr-bodypart">{pr.body_part}</div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="fitness-progress-empty">
                  <p>No personal records yet</p>
                  <small>Start logging workouts to set PRs</small>
                </div>
              )}
            </div>
          )}

          {selectedTab === 'frequency' && (
            <div className="fitness-frequency-content">
              {renderFrequencyHeatmap()}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
