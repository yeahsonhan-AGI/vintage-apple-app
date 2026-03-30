import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import { SYSTEM_WORKOUT_TEMPLATES } from '../../lib/workoutTemplates'
import { getBodyPartColor } from '../../lib/fitnessUtils'
import type { WorkoutTemplate } from '../../types'

interface TemplateSelectorProps {
  trainingType: 'strength' | 'cardio'
  onSelectTemplate: (template: WorkoutTemplate) => void
  onClose: () => void
  dateKey: string
}

export default function TemplateSelector({
  trainingType,
  onSelectTemplate,
  onClose,
  dateKey,
}: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState<WorkoutTemplate | null>(null)

  useEffect(() => {
    loadTemplates()
  }, [trainingType])

  const loadTemplates = async () => {
    console.log('=== loadTemplates called ===')
    console.log('Training type:', trainingType)
    setLoading(true)

    // Always start with system templates
    console.log('Loading system templates...')
    const systemTemplates = SYSTEM_WORKOUT_TEMPLATES.filter(
      t => t.training_type === trainingType
    ).map(t => ({
      ...t,
      id: `system-${t.name.toLowerCase().replace(/\s+/g, '-')}`,
      user_id: undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }))

    console.log('System templates loaded:', systemTemplates.length)
    console.log('System templates:', systemTemplates)
    setTemplates(systemTemplates)

    // Try to load custom templates from API (in background)
    try {
      console.log('Fetching custom templates from API...')
      const response = await api.getTemplates(trainingType)
      console.log('API response:', response)

      if (response.success && response.data?.templates) {
        const customTemplates = response.data.templates.filter((t: any) => !t.is_system)
        console.log('Custom templates:', customTemplates.length)
        if (customTemplates.length > 0) {
          // Combine system and custom templates
          setTemplates([...systemTemplates, ...customTemplates])
        }
      }
    } catch (error) {
      console.log('Using system templates only (API not available or DB not set up yet)', error)
    } finally {
      console.log('Setting loading to false')
      setLoading(false)
    }
  }

  const handleSelectTemplate = async (template: WorkoutTemplate) => {
    console.log('=== handleSelectTemplate called ===')
    console.log('Template:', template.name)
    setSelectedTemplate(template)

    // Check if this is a system template (starts with 'system-')
    if (template.id.startsWith('system-')) {
      console.log('Processing system template...')
      // Create workout from system template locally
      try {
        const response = await api.createWorkoutPlan({
          date_key: dateKey,
          training_type: template.training_type,
        })

        console.log('createWorkoutPlan response:', response)

        // Handle both response formats: { success: true, data: {workoutPlan: {...}} } or { success: true, data: {...} }
        const workoutPlan = response.data?.workoutPlan || response.data
        if (response.success && workoutPlan) {
          const exercises = template.template_exercises || []
          console.log('Creating', exercises.length, 'exercises...')

          // Create each exercise and collect responses
          const createdExercises: any[] = []
          for (const exercise of exercises) {
            if (template.training_type === 'strength') {
              const exResponse = await api.createStrengthExercise({
                workout_plan_id: workoutPlan.id,
                body_part: exercise.body_part || '',
                exercise_name: exercise.exercise_name,
                equipment: exercise.equipment || '',
                sets: exercise.sets || 3,
                reps: exercise.reps || 10,
                weight: exercise.weight,
              })
              // Handle both response formats
              const createdExercise = exResponse.data?.exercise || exResponse.data
              if (exResponse.success && createdExercise) {
                createdExercises.push(createdExercise)
              }
            } else {
              const exResponse = await api.createCardioExercise({
                workout_plan_id: workoutPlan.id,
                exercise_type: exercise.exercise_type || exercise.exercise_name,
                duration_minutes: exercise.duration_minutes || 30,
                distance_km: exercise.distance_km,
                calories_burned: exercise.calories_burned,
                intensity_level: exercise.intensity_level,
              })
              // Handle both response formats
              const createdExercise = exResponse.data?.exercise || exResponse.data
              if (exResponse.success && createdExercise) {
                createdExercises.push(createdExercise)
              }
            }
          }

          console.log('Created exercises:', createdExercises.length)

          // Manually build the workout plan with exercises instead of relying on getWorkoutPlans
          const updatedPlan = {
            ...workoutPlan,
            exercises: {
              strength: template.training_type === 'strength' ? createdExercises : [],
              cardio: template.training_type === 'cardio' ? createdExercises : [],
            }
          }

          console.log('Calling onSelectTemplate with plan:', updatedPlan)
          onSelectTemplate(updatedPlan)
          onClose()
        } else {
          console.error('Failed to create workout plan:', response)
        }
      } catch (error) {
        console.error('Failed to create workout from system template:', error)
      }
    } else {
      console.log('Processing custom template...')
      // Try API for custom templates
      try {
        const response = await api.createWorkoutFromTemplate(template.id, dateKey)

        // Handle both response formats
        const workoutPlan = response.data?.workout_plan || response.data
        if (response.success && workoutPlan) {
          onSelectTemplate(workoutPlan)
          onClose()
        }
      } catch (error) {
        console.error('Failed to create workout from template:', error)
      }
    }
  }

  if (loading) {
    return (
      <div className="fitness-template-selector">
        <div className="fitness-template-header">
          <h3>Choose a Template</h3>
          <button className="fitness-close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="fitness-template-loading">Loading templates...</div>
      </div>
    )
  }

  return (
    <div className="fitness-template-selector">
      <div className="fitness-template-header">
        <h3>Choose a Template</h3>
        <button className="fitness-close-btn" onClick={onClose}>✕</button>
      </div>

      <div className="fitness-template-list">
        {templates.map((template) => {
          const exerciseCount = template.template_exercises?.length || 0
          const bodyPart = template.template_exercises?.[0]?.body_part || 'default'
          const bgColor = getBodyPartColor(bodyPart)

          return (
            <button
              key={template.id}
              className={`fitness-template-card ${selectedTemplate?.id === template.id ? 'selected' : ''}`}
              onClick={() => handleSelectTemplate(template)}
              disabled={selectedTemplate?.id === template.id}
              style={{ borderColor: selectedTemplate?.id === template.id ? bgColor : undefined }}
            >
              <div className="fitness-template-icon" style={{ background: bgColor }}>
                {trainingType === 'strength' ? '💪' : '🏃'}
              </div>
              <div className="fitness-template-info">
                <div className="fitness-template-name">{template.name}</div>
                <div className="fitness-template-desc">{template.description}</div>
                <div className="fitness-template-meta">
                  {exerciseCount} exercise{exerciseCount !== 1 ? 's' : ''}
                  {template.is_system && <span className="fitness-template-badge">System</span>}
                </div>
              </div>
              <div className="fitness-template-arrow">→</div>
            </button>
          )
        })}

        {templates.length === 0 && (
          <div className="fitness-template-empty">
            <p>No templates available for {trainingType} training</p>
          </div>
        )}
      </div>
    </div>
  )
}
