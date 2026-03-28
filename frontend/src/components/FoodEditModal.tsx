import { useState, useEffect } from 'react'
import type { FoodAnalysisResult, NutritionInfo } from '../types'

interface FoodEditModalProps {
  isOpen: boolean
  initialData: FoodAnalysisResult | null
  imagePreview: string | null
  onSave: (data: FoodAnalysisResult) => void
  onCancel: () => void
  isLoading?: boolean
}

const defaultData: FoodAnalysisResult = {
  food_name: '',
  calories: 0,
  protein_g: 0,
  carbs_g: 0,
  fat_g: 0,
  fiber_g: 0,
  sugar_g: 0,
  meal_type: 'snack',
  confidence: 'medium',
  description: ''
}

export default function FoodEditModal({
  isOpen,
  initialData,
  imagePreview,
  onSave,
  onCancel,
  isLoading = false
}: FoodEditModalProps) {
  const [editedData, setEditedData] = useState<FoodAnalysisResult>(defaultData)

  // Update editedData when initialData changes (when modal opens with new data)
  useEffect(() => {
    console.log('FoodEditModal: initialData changed:', initialData)
    if (initialData) {
      setEditedData(initialData)
    } else {
      setEditedData(defaultData)
    }
  }, [initialData])

  const mealTypes = [
    { value: 'breakfast', label: '早餐', icon: '🌅' },
    { value: 'lunch', label: '午餐', icon: '☀️' },
    { value: 'dinner', label: '晚餐', icon: '🌙' },
    { value: 'snack', label: '加餐', icon: '🍎' }
  ]

  const adjustCalories = (amount: number) => {
    setEditedData(prev => ({
      ...prev,
      calories: Math.max(0, prev.calories + amount)
    }))
  }

  const adjustNutrition = (field: keyof NutritionInfo, amount: number) => {
    setEditedData(prev => ({
      ...prev,
      [field]: Math.max(0, (prev[field] || 0) + amount)
    }))
  }

  const handleSave = () => {
    if (!editedData.food_name.trim()) return
    if (editedData.calories <= 0) return
    onSave(editedData)
  }

  if (!isOpen) return null

  return (
    <div
      className="food-edit-modal-overlay"
      onClick={onCancel}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(90, 74, 58, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '16px'
      }}
    >
      <div
        className="food-edit-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#FFFDF9',
          borderRadius: '24px',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 8px 32px rgba(90, 74, 58, 0.2)',
          padding: '20px',
          border: '3px solid #FF9E9E'
        }}
      >
        <div className="food-edit-modal-header">
          <h2>确认食物信息</h2>
          <button
            className="food-edit-modal-close"
            onClick={onCancel}
            disabled={isLoading}
          >
            ✕
          </button>
        </div>

        <div className="food-edit-modal-content">
          {/* Image Preview */}
          {imagePreview && (
            <div className="food-edit-image-preview">
              <img src={imagePreview} alt="Food preview" />
            </div>
          )}

          {/* AI Confidence Indicator */}
          {initialData && (
            <div className={`food-confidence-indicator confidence-${initialData.confidence}`}>
              <span className="confidence-icon">
                {initialData.confidence === 'high' ? '✨' : initialData.confidence === 'medium' ? '👁️' : '❓'}
              </span>
              <span className="confidence-text">
                AI 识别置信度: {initialData.confidence === 'high' ? '高' : initialData.confidence === 'medium' ? '中' : '低'}
              </span>
            </div>
          )}

          {/* Food Name */}
          <div className="food-edit-field">
            <label>食物名称</label>
            <input
              type="text"
              value={editedData.food_name}
              onChange={(e) => setEditedData(prev => ({ ...prev, food_name: e.target.value }))}
              placeholder="输入食物名称"
              className="food-edit-input"
              disabled={isLoading}
            />
          </div>

          {/* Meal Type Selector */}
          <div className="food-edit-field">
            <label>餐次类型</label>
            <div className="meal-type-selector">
              {mealTypes.map(type => (
                <button
                  key={type.value}
                  className={`meal-type-btn ${editedData.meal_type === type.value ? 'active' : ''}`}
                  onClick={() => setEditedData(prev => ({ ...prev, meal_type: type.value as any }))}
                  disabled={isLoading}
                >
                  <span className="meal-type-icon">{type.icon}</span>
                  <span className="meal-type-label">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Calories */}
          <div className="food-edit-field">
            <label>热量 (kcal)</label>
            <div className="calorie-input-group">
              <button
                className="calorie-adjust-btn"
                onClick={() => adjustCalories(-50)}
                disabled={isLoading}
              >
                -50
              </button>
              <input
                type="number"
                value={editedData.calories}
                onChange={(e) => setEditedData(prev => ({ ...prev, calories: parseFloat(e.target.value) || 0 }))}
                className="food-edit-number-input"
                disabled={isLoading}
              />
              <button
                className="calorie-adjust-btn"
                onClick={() => adjustCalories(50)}
                disabled={isLoading}
              >
                +50
              </button>
            </div>
          </div>

          {/* Nutrition Information */}
          <div className="food-edit-section">
            <div className="food-edit-section-title">营养信息 (克)</div>

            <div className="nutrition-grid">
              {/* Protein */}
              <div className="nutrition-item">
                <label>蛋白质</label>
                <div className="nutrition-input-group">
                  <button
                    className="nutrition-adjust-btn"
                    onClick={() => adjustNutrition('protein_g', -1)}
                    disabled={isLoading}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    step="0.1"
                    value={editedData.protein_g}
                    onChange={(e) => setEditedData(prev => ({ ...prev, protein_g: parseFloat(e.target.value) || 0 }))}
                    className="food-edit-number-input small"
                    disabled={isLoading}
                  />
                  <button
                    className="nutrition-adjust-btn"
                    onClick={() => adjustNutrition('protein_g', 1)}
                    disabled={isLoading}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Carbs */}
              <div className="nutrition-item">
                <label>碳水</label>
                <div className="nutrition-input-group">
                  <button
                    className="nutrition-adjust-btn"
                    onClick={() => adjustNutrition('carbs_g', -1)}
                    disabled={isLoading}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    step="0.1"
                    value={editedData.carbs_g}
                    onChange={(e) => setEditedData(prev => ({ ...prev, carbs_g: parseFloat(e.target.value) || 0 }))}
                    className="food-edit-number-input small"
                    disabled={isLoading}
                  />
                  <button
                    className="nutrition-adjust-btn"
                    onClick={() => adjustNutrition('carbs_g', 1)}
                    disabled={isLoading}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Fat */}
              <div className="nutrition-item">
                <label>脂肪</label>
                <div className="nutrition-input-group">
                  <button
                    className="nutrition-adjust-btn"
                    onClick={() => adjustNutrition('fat_g', -1)}
                    disabled={isLoading}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    step="0.1"
                    value={editedData.fat_g}
                    onChange={(e) => setEditedData(prev => ({ ...prev, fat_g: parseFloat(e.target.value) || 0 }))}
                    className="food-edit-number-input small"
                    disabled={isLoading}
                  />
                  <button
                    className="nutrition-adjust-btn"
                    onClick={() => adjustNutrition('fat_g', 1)}
                    disabled={isLoading}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {editedData.description && (
            <div className="food-edit-field">
              <label>描述</label>
              <textarea
                value={editedData.description}
                onChange={(e) => setEditedData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="添加描述..."
                className="food-edit-textarea"
                rows={2}
                disabled={isLoading}
              />
            </div>
          )}
        </div>

        <div className="food-edit-modal-footer">
          <button
            className="food-edit-cancel-btn"
            onClick={onCancel}
            disabled={isLoading}
          >
            取消
          </button>
          <button
            className="food-edit-save-btn"
            onClick={handleSave}
            disabled={isLoading || !editedData.food_name.trim() || editedData.calories <= 0}
          >
            {isLoading ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
    </div>
  )
}
