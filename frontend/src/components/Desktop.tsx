import { useState, useEffect, useRef } from 'react'
import { api } from '../lib/api'
import type { FoodAnalysisResult, WorkoutPlan } from '../types'
import { ChestIcon, BackIcon, LegsIcon, ShouldersIcon, ArmsIcon, CoreIcon, EmptyStrengthIcon, EmptyCardioIcon, StrengthTypeIcon, CardioTypeIcon } from './FitnessIcons'
import { MoreIcon, NotesIcon, YouTubeIcon, CalendarIcon, IconsIcon, FitnessIcon } from './DockIcons'
import { FoodIcon, EmptyFoodIcon, FireIcon, CameraAddIcon } from './DockIcons'
import FoodEditModal from './FoodEditModal'
import FitnessDashboard from './fitness/FitnessDashboard'
import TemplateSelector from './fitness/TemplateSelector'
import CalendarView from './fitness/CalendarView'
import ProgressView from './fitness/ProgressView'
import { formatDateKey } from '../lib/fitnessUtils'

interface DesktopProps {
  user: { id: string; email: string } | null
  onSignOut: () => void
}

interface Note {
  id: string
  title: string
  content: string
  created_at: string
  updated_at: string
}

interface Todo {
  id: string
  title: string
  completed: boolean
  created_at: string
}

interface FoodLog {
  id: string
  meal_name: string
  calories: number
  category: string
  image: string
  meal_type: string
  created_at: string
}

export default function Desktop({ user, onSignOut }: DesktopProps) {
  console.log('Desktop rendered with user:', user)

  // Verify token exists on mount
  useEffect(() => {
    const token = localStorage.getItem('token')
    console.log('Desktop mount - token exists:', !!token)
    if (!token) {
      console.error('No token found in localStorage!')
      console.log('All localStorage:', { ...localStorage })
    }
  }, [])

  const [activeApp, setActiveApp] = useState<string | null>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // Music state
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Notes state
  const [notes, setNotes] = useState<Note[]>([])
  const [currentNote, setCurrentNote] = useState<Note | null>(null)
  const [noteTitle, setNoteTitle] = useState('')
  const [noteContent, setNoteContent] = useState('')

  // Calendar/Todos state
  const [selectedDate] = useState(new Date())
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodoTitle, setNewTodoTitle] = useState('')

  // Food tracker state
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([])
  const [selectedFoodDate, setSelectedFoodDate] = useState(new Date())
  const [showFoodCamera, setShowFoodCamera] = useState(false)

  // AI Food Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<FoodAnalysisResult | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  // YouTube state - Fetch channel thumbnails
  const [channelUrl, setChannelUrl] = useState('')
  const [channelVideos, setChannelVideos] = useState<Array<{id: string, title: string, thumbnail: string}>>([])
  const [selectedThumbnail, setSelectedThumbnail] = useState<{id: string, title: string, thumbnail: string} | null>(null)
  const [showDownloadModal, setShowDownloadModal] = useState(false)
  const [isLoadingVideos, setIsLoadingVideos] = useState(false)

  // Icons state - GLM image generation
  const [iconPrompt, setIconPrompt] = useState('')
  const [generatedIcon, setGeneratedIcon] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  // Fitness state
  const [fitnessDate, setFitnessDate] = useState(new Date())
  const [_workoutPlans, setWorkoutPlans] = useState<any[]>([])
  const [fitnessStats, setFitnessStats] = useState<any>(null)
  const [fitnessTrainingType, setFitnessTrainingType] = useState<'strength' | 'cardio'>('strength')
  const [selectedBodyPart, setSelectedBodyPart] = useState<string | null>(null)
  const [currentWorkoutPlan, setCurrentWorkoutPlan] = useState<WorkoutPlan | null>(null)
  const [fitnessView, setFitnessView] = useState<'dashboard' | 'workout' | 'summary' | 'templates' | 'calendar' | 'progress'>('dashboard')

  // Exercise form state
  const [strengthExercise, setStrengthExercise] = useState({
    exercise_name: '',
    equipment: '',
    sets: 3,
    reps: 10,
    weight: '',
    notes: '',
  })
  const [cardioExercise, setCardioExercise] = useState({
    exercise_type: 'running',
    duration_minutes: 30,
    distance_km: '',
    calories_burned: '',
    intensity_level: 'medium',
    notes: '',
  })

  // Floating notes, lyrics, and icons
  const [floatingElements, setFloatingElements] = useState<Array<{id: number, type: 'note' | 'word' | 'icon', content: string, colorClass?: string}>>([])

  const musicPlayerRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const userMenuRef = useRef<HTMLDivElement>(null)

  // Initialize audio
  useEffect(() => {
    // Create audio element for background music using local file
    audioRef.current = new Audio('/sounds/audio_380799053549734_watermark.mp3')
    audioRef.current.loop = true
    audioRef.current.volume = 0.3

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  // Floating elements generator when music is playing - Seattle Chill Vibes
  useEffect(() => {
    if (!isPlaying) {
      setFloatingElements([])
      return
    }

    console.log('Music is playing, starting floating elements...')

    const words = [
      'chill', 'vibes', 'peace', 'calm', 'dream', 'flow', 'zen', 'relax',
      'cozy', 'drift', 'serenity', 'breeze', 'mist', 'harmony', 'gentle',
      'seattle', 'rain', 'coffee', 'evergreen', 'puget', 'sound'
    ]
    const notes = ['🎵', '🎶', '🎼', '♩', '♪', '♫', '♬', '♭', '♮', '♯', '𝅘𝅥𝅯', '𝅘𝅥𝅰', '𝅘𝅥𝅱']

    // Create first element immediately
    const createElement = () => {
      const random = Math.random()
      let type: 'note' | 'word' | 'icon'
      let content: string
      let colorClass: string = ''

      if (random < 0.3) {
        type = 'note'
        content = notes[Math.floor(Math.random() * notes.length)]
      } else if (random < 0.7) {
        type = 'word'
        content = words[Math.floor(Math.random() * words.length)]
      } else {
        type = 'icon'
        const icons = [
          '<svg viewBox="0 0 24 24"><path d="M3 18v-6a9 9 0 0 1 18 0v6" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
          '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
          '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="2" fill="currentColor"/></svg>'
        ]
        content = icons[Math.floor(Math.random() * icons.length)]
        colorClass = `icon-color-${Math.floor(Math.random() * 3)}`
      }

      const newElement = {
        id: Date.now() + Math.random(),
        type,
        content,
        colorClass
      }

      console.log('Creating floating element:', newElement)
      setFloatingElements(prev => [...prev.slice(-10), newElement])

      setTimeout(() => {
        setFloatingElements(prev => prev.filter(el => el.id !== newElement.id))
      }, 5000)
    }

    createElement()
    const interval = setInterval(createElement, 800)

    return () => clearInterval(interval)
  }, [isPlaying])

  // Get floating origin based on Logo position (音符从人物前面跳出来)
  const getFloatingOrigin = () => {
    if (typeof window === 'undefined') return { left: '50%', top: '50%' }

    const rect = logoRef.current?.getBoundingClientRect()
    if (!rect) return { left: '50%', top: '50%' }

    return {
      left: `${rect.left + rect.width / 2}px`,
      top: `${rect.top + rect.height / 3}px`
    }
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Toggle music playback
  const toggleMusic = async () => {
    if (!audioRef.current) return

    console.log('Toggle music, current playing state:', isPlaying)

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
      console.log('Music paused')
    } else {
      try {
        await audioRef.current.play()
        setIsPlaying(true)
        console.log('Music started playing!')
      } catch (error) {
        console.error('Audio playback failed:', error)
        showToast('Could not play audio', 'error')
      }
    }
  }

  // Load data when apps open
  useEffect(() => {
    console.log('activeApp changed to:', activeApp)
    if (activeApp === 'notes') {
      console.log('Loading notes...')
      loadNotes()
    } else if (activeApp === 'calendar') {
      console.log('Loading todos...')
      loadTodos()
    } else if (activeApp === 'camera') {
      console.log('Loading food logs...')
      loadFoodLogs()
    } else if (activeApp === 'fitness') {
      console.log('Loading workout plans...')
      loadWorkoutPlans()
      loadFitnessStats()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeApp])

  // Load food logs when date changes
  useEffect(() => {
    if (activeApp === 'camera') {
      loadFoodLogs()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFoodDate])

  // YouTube Channel - Extract channel ID from URL and load recent videos
  const extractChannelId = (url: string): string | null => {
    // Handle different YouTube URL formats
    const patterns = [
      /youtube\.com\/channel\/([UC[a-zA-Z0-9_-]{22})/,
      /youtube\.com\/c\/([^/?]+)/,
      /youtube\.com\/user\/([^/?]+)/,
      /youtube\.com\/@([^/?]+)/,
    ]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) {
        return match[1]
      }
    }

    // If it's already a channel ID
    if (url.startsWith('UC') && url.length === 24) {
      return url
    }

    return null
  }

  const loadChannelVideos = async () => {
    if (!channelUrl.trim()) {
      showToast('Please enter a YouTube channel URL', 'error')
      return
    }

    setIsLoadingVideos(true)
    setChannelVideos([])

    try {
      const extractedId = extractChannelId(channelUrl)

      if (!extractedId) {
        showToast('Invalid YouTube channel URL', 'error')
        setIsLoadingVideos(false)
        return
      }

      const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY

      if (API_KEY) {
        // Use YouTube Data API v3 (requires API key)
        await loadWithYouTubeAPI(extractedId, API_KEY)
      } else {
        // Fallback: Try alternative method
        await loadWithAlternativeMethod(extractedId)
      }
    } catch (error) {
      console.error('Failed to load channel videos:', error)
      showToast('Failed to load videos. YouTube API key recommended.', 'error')
    } finally {
      setIsLoadingVideos(false)
    }
  }

  const loadWithYouTubeAPI = async (channelId: string, apiKey: string) => {
    // First, get channel ID from custom handle
    let actualChannelId = channelId

    if (!channelId.startsWith('UC')) {
      // Need to resolve custom handle to channel ID
      try {
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(channelId)}&type=channel&key=${apiKey}`
        const response = await fetch(searchUrl)
        const data = await response.json()

        if (data.items && data.items[0]) {
          actualChannelId = data.items[0].id.channelId
        }
      } catch (error) {
        console.error('Failed to resolve channel ID:', error)
      }
    }

    // Get channel's uploads playlist ID
    const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${actualChannelId}&key=${apiKey}`
    const channelResponse = await fetch(channelUrl)
    const channelData = await channelResponse.json()

    if (channelData.items && channelData.items[0]) {
      const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads

      // Get videos from uploads playlist
      const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=12&key=${apiKey}`
      const playlistResponse = await fetch(playlistUrl)
      const playlistData = await playlistResponse.json()

      if (playlistData.items) {
        const videos: Array<{id: string, title: string, thumbnail: string}> = []

        playlistData.items.forEach((item: any) => {
          const videoId = item.snippet.resourceId?.videoId
          const title = item.snippet.title
          const thumbnail = item.snippet.thumbnails?.maxres?.url ||
                          item.snippet.thumbnails?.high?.url ||
                          item.snippet.thumbnails?.medium?.url ||
                          item.snippet.thumbnails?.default?.url ||
                          `https://img.youtube.com/vi/${videoId}/default.jpg`

          if (videoId) {
            videos.push({ id: videoId, title, thumbnail })
          }
        })

        if (videos.length > 0) {
          setChannelVideos(videos)
          showToast(`Loaded ${videos.length} videos!`)
        } else {
          showToast('No videos found for this channel', 'error')
        }
      }
    }
  }

  const loadWithAlternativeMethod = async (_channelId: string) => {
    // Alternative: Use a different approach
    // Since CORS is an issue, show helpful message
    showToast('YouTube API key required for this feature. See .env file for instructions.', 'error')

    // Show sample videos as fallback
    setChannelVideos([
      { id: 'dQw4w9WgXcQ', title: 'Sample Video 1 (API key needed)', thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg' },
      { id: 'jNQXAC9IVRw', title: 'Sample Video 2 (API key needed)', thumbnail: 'https://img.youtube.com/vi/jNQXAC9IVRw/maxresdefault.jpg' },
    ])
  }

  const handleThumbnailClick = (video: {id: string, title: string, thumbnail: string}) => {
    setSelectedThumbnail(video)
    setShowDownloadModal(true)
  }

  const downloadThumbnail = async () => {
    if (!selectedThumbnail) return

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

    try {
      // For mobile, direct download often works better
      if (isMobile) {
        // Create a direct download link
        const link = document.createElement('a')
        link.href = selectedThumbnail.thumbnail
        link.download = `youtube-thumbnail-${selectedThumbnail.id}.jpg`
        link.target = '_blank'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        setShowDownloadModal(false)
        showToast('Opening image... Long press to save on mobile')
        return
      }

      // For desktop, try fetch as blob first
      const response = await fetch(selectedThumbnail.thumbnail)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)

      // Create download link
      const link = document.createElement('a')
      link.href = url
      link.download = `youtube-thumbnail-${selectedThumbnail.id}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Clean up
      window.URL.revokeObjectURL(url)
      setShowDownloadModal(false)
      showToast('Thumbnail downloaded!')
    } catch (error) {
      console.error('Download failed:', error)
      // Better fallback: Try canvas approach
      try {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.src = selectedThumbnail.thumbnail

        await new Promise((resolve, reject) => {
          img.onload = resolve
          img.onerror = reject
        })

        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0)

        canvas.toBlob((blob) => {
          if (blob) {
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `youtube-thumbnail-${selectedThumbnail.id}.jpg`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
            setShowDownloadModal(false)
            showToast('Thumbnail downloaded!')
          }
        })
      } catch (canvasError) {
        // Final fallback: Open in new tab with better message
        setShowDownloadModal(false)
        if (isMobile) {
          showToast('Opening image... Long press and save image')
        } else {
          showToast('Opening image... Right-click and "Save image as"')
        }
        window.open(selectedThumbnail.thumbnail, '_blank')
      }
    }
  }

  // Icons - Generate with GLM model
  const generateIcon = async () => {
    if (!iconPrompt.trim()) {
      showToast('Please enter a prompt', 'error')
      return
    }

    setIsGenerating(true)

    try {
      // GLM-4V Image Generation API
      const API_KEY = import.meta.env.VITE_GLM_API_KEY || ''
      if (!API_KEY) {
        throw new Error('GLM API Key not configured')
      }

      const API_URL = 'https://open.bigmodel.cn/api/paas/v4/images/generations'

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: 'cogview-3',
          prompt: `${iconPrompt}, transparent background, no background, icon style, simple design, Q-version, cute`,
          size: '1024x1024',
          n: 1
        })
      })

      const data = await response.json()

      if (data.data && data.data[0] && data.data[0].url) {
        setGeneratedIcon(data.data[0].url)
        showToast('Icon generated!')
      } else {
        throw new Error('No image generated')
      }
    } catch (error) {
      console.error('Icon generation failed:', error)
      showToast('Generation failed. Please check API key.', 'error')
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadGeneratedIcon = async () => {
    if (!generatedIcon) return

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

    try {
      // For mobile, direct download often works better
      if (isMobile) {
        // Create a direct download link
        const link = document.createElement('a')
        link.href = generatedIcon
        link.download = `q-draw-icon-${Date.now()}.png`
        link.target = '_blank'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        showToast('Opening image... Long press to save on mobile')
        return
      }

      // For desktop, try fetch as blob first
      const response = await fetch(generatedIcon)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)

      // Create download link
      const link = document.createElement('a')
      link.href = url
      link.download = `q-draw-icon-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Clean up
      window.URL.revokeObjectURL(url)
      showToast('Icon downloaded!')
    } catch (error) {
      console.error('Download failed:', error)
      // Better fallback: Try canvas approach
      try {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.src = generatedIcon

        await new Promise((resolve, reject) => {
          img.onload = resolve
          img.onerror = reject
        })

        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0)

        canvas.toBlob((blob) => {
          if (blob) {
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `q-draw-icon-${Date.now()}.png`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
            showToast('Icon downloaded!')
          }
        })
      } catch (canvasError) {
        // Final fallback: Open in new tab with better message
        if (isMobile) {
          showToast('Opening image... Long press and save image')
        } else {
          showToast('Opening image... Right-click and "Save image as"')
        }
        window.open(generatedIcon, '_blank')
      }
    }
  }

  // Notes functions
  const loadNotes = async () => {
    const response = await api.getNotes()
    if (response.success && response.data) {
      const notes = Array.isArray(response.data) ? response.data : []
      setNotes(notes)
    }
  }

  const createNote = async () => {
    const response = await api.createNote({
      title: noteTitle || 'Untitled Note',
      content: noteContent
    })
    if (response.success) {
      loadNotes()
      setNoteTitle('')
      setNoteContent('')
      showToast('Note created!')
    }
  }

  const updateNote = async () => {
    if (!currentNote) return
    const response = await api.updateNote(currentNote.id, {
      title: noteTitle,
      content: noteContent
    })
    if (response.success) {
      loadNotes()
      showToast('Note updated!')
    }
  }

  const deleteNote = async (id: string) => {
    const response = await api.deleteNote(id)
    if (response.success) {
      loadNotes()
      showToast('Note deleted')
    }
  }

  // Calendar/Todos functions
  const loadTodos = async () => {
    const dateKey = formatDateKey(selectedDate)
    const response = await api.getTodos(dateKey)
    if (response.success && response.data) {
      const todos = Array.isArray(response.data) ? response.data : []
      setTodos(todos)
    }
  }

  const createTodo = async () => {
    if (!newTodoTitle.trim()) return
    const dateKey = formatDateKey(selectedDate)
    const response = await api.createTodo({
      date_key: dateKey,
      title: newTodoTitle
    })
    if (response.success) {
      loadTodos()
      setNewTodoTitle('')
      showToast('Todo added!')
    }
  }

  const toggleTodo = async (id: string, completed: boolean) => {
    const response = await api.updateTodo(id, { completed: !completed })
    if (response.success) {
      loadTodos()
    }
  }

  const deleteTodo = async (id: string) => {
    const response = await api.deleteTodo(id)
    if (response.success) {
      loadTodos()
      showToast('Todo deleted')
    }
  }

  // Food tracker functions
  const loadFoodLogs = async () => {
    console.log('Loading food logs for date:', formatDateKey(selectedFoodDate))
    const dateKey = formatDateKey(selectedFoodDate)
    const response = await api.getFoodLogs(dateKey)

    console.log('Food logs response:', response)

    if (response.success && response.data) {
      // response.data is now directly the array from backend
      const logs = Array.isArray(response.data) ? response.data : []
      setFoodLogs(logs)
      console.log('Food logs loaded:', logs.length, 'items')
    } else {
      console.log('Failed to load food logs:', response.error)
      setFoodLogs([])
    }
  }

  const handleFoodImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      const base64 = event.target?.result as string

      // Store the image preview for the edit modal
      setImagePreview(base64)
      setShowFoodCamera(false)

      // Start AI analysis
      setIsAnalyzing(true)
      setAnalysisResult(null)

      try {
        const response = await api.analyzeFood(base64)
        console.log('AI Analysis response:', response)

        if (response.success && response.data) {
          // Backend returns { success: true, data: { food_name, calories, ... } }
          const analysisData = response.data as any
          console.log('Setting analysis result:', analysisData)
          setAnalysisResult(analysisData)
          setShowEditModal(true)
          console.log('Edit modal should be shown now, showEditModal:', true)
        } else {
          // AI analysis failed, show edit modal with default values
          console.error('AI analysis failed:', response.error)
          setAnalysisResult({
            food_name: 'Unknown Food',
            calories: 200,
            protein_g: 0,
            carbs_g: 0,
            fat_g: 0,
            fiber_g: 0,
            sugar_g: 0,
            meal_type: 'snack',
            confidence: 'low',
            description: 'Please enter food details manually'
          })
          setShowEditModal(true)
          showToast('AI analysis unavailable. Please enter details manually.', 'error')
        }
      } catch (error) {
        console.error('AI analysis error:', error)
        // Show edit modal with default values on error
        setAnalysisResult({
          food_name: 'Unknown Food',
          calories: 200,
          protein_g: 0,
          carbs_g: 0,
          fat_g: 0,
          fiber_g: 0,
          sugar_g: 0,
          meal_type: 'snack',
          confidence: 'low',
          description: 'Please enter food details manually'
        })
        setShowEditModal(true)
        showToast('Could not analyze food. Please enter details manually.', 'error')
      } finally {
        setIsAnalyzing(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleFoodEditSave = async (data: FoodAnalysisResult) => {
    console.log('[handleFoodEditSave] Saving food log:', data)
    const dateKey = formatDateKey(selectedFoodDate)

    const response = await api.createFoodLog({
      date_key: dateKey,
      meal_name: data.food_name,
      calories: data.calories,
      category: 'meal',
      image: imagePreview || '',
      meal_type: data.meal_type
    })

    console.log('[handleFoodEditSave] Save response:', response)

    if (response.success) {
      console.log('[handleFoodEditSave] Save successful, reloading food logs...')
      await loadFoodLogs()
      setShowEditModal(false)
      setImagePreview(null)
      setAnalysisResult(null)
      showToast('Food logged successfully!')
    } else {
      console.error('[handleFoodEditSave] Save failed:', response.error)
      showToast('Failed to save food log', 'error')
    }
  }

  const handleFoodEditCancel = () => {
    setShowEditModal(false)
    setImagePreview(null)
    setAnalysisResult(null)
  }

  // Body part labels with colors
  const BODY_PART_LABELS: Record<string, { label: string; color: string }> = {
    chest: { label: 'Chest', color: 'var(--q-coral)' },
    back: { label: 'Back', color: 'var(--q-blue)' },
    legs: { label: 'Legs', color: 'var(--q-mint)' },
    shoulders: { label: 'Shoulders', color: 'var(--q-lavender)' },
    arms: { label: 'Arms', color: 'var(--q-peach)' },
    core: { label: 'Core', color: 'var(--q-yellow)' }
  }

  // Fitness functions
  const completeWorkout = async () => {
    if (currentWorkoutPlan) {
      // Mark workout as completed
      await api.completeWorkout(currentWorkoutPlan.id)
    }
    setFitnessView('summary')
    showToast('🎉 Training completed! Great job!')
  }

  const backToTraining = () => {
    setFitnessView('dashboard')
    setCurrentWorkoutPlan(null)
    setSelectedBodyPart(null)
  }

  const handleTemplateSelect = (workout: WorkoutPlan) => {
    setCurrentWorkoutPlan(workout)
    setFitnessView('workout')
    showToast(`Workout loaded from template!`)
  }

  const handleCreateBlank = async () => {
    console.log('=== handleCreateBlank called ===')
    console.log('Current fitnessView:', fitnessView)
    console.log('Current workout plan:', currentWorkoutPlan)
    await createFitnessWorkout()
  }

  const handleCalendarSelect = async (dateKey: string) => {
    const newDate = new Date(dateKey)
    setFitnessDate(newDate)

    // Load workouts for the selected date
    const response = await api.getWorkoutPlans(dateKey)
    if (response.success && response.data) {
      const plans = Array.isArray(response.data) ? response.data : []
      const existingPlan = plans.find((p: any) => p?.training_type === fitnessTrainingType && p?.date_key === dateKey)
      if (existingPlan) {
        setCurrentWorkoutPlan(existingPlan)
        setFitnessView('workout')
      } else {
        setFitnessView('dashboard')
      }
    }
  }

  const loadWorkoutPlans = async () => {
    const dateKey = formatDateKey(fitnessDate)
    const response = await api.getWorkoutPlans(dateKey)

    console.log('loadWorkoutPlans - response:', response)

    if (response.success && response.data) {
      try {
        // Backend returns { success: true, data: [...] } - data is directly an array
        const plans = Array.isArray(response.data) ? response.data : []
        console.log('Loaded plans:', plans.length, 'for date:', dateKey)
        console.log('Plans:', plans)
        setWorkoutPlans(plans)

        // First, try to find a plan for today's date with matching training type
        let existingPlan = plans.find((p: any) => p?.training_type === fitnessTrainingType && p?.date_key === dateKey)

        // If no plan for today, find the most recent plan of this training type
        if (!existingPlan && plans.length > 0) {
          const sameTypePlans = plans.filter((p: any) => p?.training_type === fitnessTrainingType)
          if (sameTypePlans.length > 0) {
            // Sort by date descending and get the first (most recent)
            sameTypePlans.sort((a: any, b: any) => new Date(b.date_key).getTime() - new Date(a.date_key).getTime())
            existingPlan = sameTypePlans[0]
            console.log('Using most recent plan from:', existingPlan.date_key)
          }
        }

        console.log('Selected plan for', fitnessTrainingType, ':', existingPlan)
        // Only update currentWorkoutPlan if:
        // 1. We found a plan, OR
        // 2. Current workout plan doesn't match the current date/training type
        // This prevents overriding a newly created plan that hasn't been synced to database yet
        if (existingPlan) {
          setCurrentWorkoutPlan(existingPlan)
        } else if (!currentWorkoutPlan || currentWorkoutPlan.date_key !== dateKey || currentWorkoutPlan.training_type !== fitnessTrainingType) {
          setCurrentWorkoutPlan(null)
        }
      } catch (e) {
        console.error('Failed to parse workout plans:', e)
        setWorkoutPlans([])
        // Don't clear currentWorkoutPlan if there's an error - it might be a valid new plan
      }
    } else {
      console.log('loadWorkoutPlans - no success or data')
      setWorkoutPlans([])
      // Don't clear currentWorkoutPlan if there's an error
    }
  }

  const loadFitnessStats = async (period: 'week' | 'month' = 'week') => {
    const response = await api.getFitnessStats(period)
    console.log('loadFitnessStats - response:', response)
    if (response.success && response.data) {
      try {
        // Backend returns { success: true, data: {...} } - data is directly the stats object
        const stats = typeof response.data === 'object' && !Array.isArray(response.data) ? response.data : null
        console.log('Loaded stats:', stats)
        setFitnessStats(stats)
      } catch (e) {
        console.error('Failed to parse stats:', e)
      }
    }
  }

  const createFitnessWorkout = async () => {
    console.log('=== Creating Fitness Workout ===')
    console.log('Training type:', fitnessTrainingType)
    console.log('Date:', fitnessDate)

    const dateKey = formatDateKey(fitnessDate)
    console.log('Date key:', dateKey)

    const response = await api.createWorkoutPlan({
      date_key: dateKey,
      training_type: fitnessTrainingType,
    })

    console.log('API Response:', response)
    console.log('Response success:', response.success)
    console.log('Response data:', response.data)
    console.log('Has data:', !!response.data)
    console.log('Condition check:', response.success, '&&', !!response.data, '=', response.success && !!response.data)

    if (response.success && response.data) {
      try {
        // Handle both response formats: { success: true, data: {workoutPlan: {...}} } or { success: true, data: {...} }
        const newPlan = response.data.workoutPlan || response.data
        console.log('New workout plan:', newPlan)
        console.log('Plan ID:', newPlan?.id)
        console.log('Plan structure:', JSON.stringify(newPlan, null, 2))
        setCurrentWorkoutPlan(newPlan || null)
        // Don't call loadWorkoutPlans() here to avoid overriding the new plan
        // loadWorkoutPlans() will be called by useEffect when needed
        showToast(`${fitnessTrainingType === 'strength' ? 'Strength' : 'Cardio'} workout created!`)
        // Switch to workout view after plan is set
        console.log('Setting fitnessView to workout')
        setFitnessView('workout')
      } catch (e) {
        console.error('Failed to parse workout plan:', e)
      }
    } else {
      console.error('Failed to create workout plan:', response.error)
      showToast(`Failed to create workout: ${response.error || 'Unknown error'}`, 'error')
    }
  }

  const addStrengthExercise = async () => {
    if (!currentWorkoutPlan || !selectedBodyPart) {
      showToast('Please create a workout and select a body part', 'error')
      return
    }
    if (!strengthExercise.exercise_name || !strengthExercise.equipment) {
      showToast('Please fill in exercise name and equipment', 'error')
      return
    }

    const response = await api.createStrengthExercise({
      workout_plan_id: currentWorkoutPlan.id,
      body_part: selectedBodyPart,
      exercise_name: strengthExercise.exercise_name,
      equipment: strengthExercise.equipment,
      sets: strengthExercise.sets,
      reps: strengthExercise.reps,
      weight: strengthExercise.weight ? parseFloat(strengthExercise.weight) : undefined,
      notes: strengthExercise.notes || undefined,
    })

    if (response.success) {
      // Manually update currentWorkoutPlan instead of relying on loadWorkoutPlans
      const newExercise = response.data?.exercise || response.data
      if (newExercise && currentWorkoutPlan) {
        setCurrentWorkoutPlan({
          ...currentWorkoutPlan,
          exercises: {
            ...currentWorkoutPlan.exercises,
            strength: [
              ...(currentWorkoutPlan.exercises?.strength || []),
              newExercise
            ]
          }
        })
      }
      setStrengthExercise({
        exercise_name: '',
        equipment: '',
        sets: 3,
        reps: 10,
        weight: '',
        notes: '',
      })
      // Keep body part selected for quick adding of more exercises
      showToast('✅ Exercise added! Add more or complete training')
    }
  }

  const addCardioExercise = async () => {
    if (!currentWorkoutPlan) {
      showToast('Please create a workout first', 'error')
      return
    }
    if (!cardioExercise.duration_minutes || cardioExercise.duration_minutes <= 0) {
      showToast('Please enter duration', 'error')
      return
    }

    const response = await api.createCardioExercise({
      workout_plan_id: currentWorkoutPlan.id,
      exercise_type: cardioExercise.exercise_type,
      duration_minutes: cardioExercise.duration_minutes,
      distance_km: cardioExercise.distance_km ? parseFloat(cardioExercise.distance_km) : undefined,
      calories_burned: cardioExercise.calories_burned ? parseInt(cardioExercise.calories_burned) : undefined,
      intensity_level: cardioExercise.intensity_level,
      notes: cardioExercise.notes || undefined,
    })

    if (response.success) {
      // Manually update currentWorkoutPlan instead of relying on loadWorkoutPlans
      const newExercise = response.data?.exercise || response.data
      if (newExercise && currentWorkoutPlan) {
        setCurrentWorkoutPlan({
          ...currentWorkoutPlan,
          exercises: {
            ...currentWorkoutPlan.exercises,
            cardio: [
              ...(currentWorkoutPlan.exercises?.cardio || []),
              newExercise
            ]
          }
        })
      }
      setCardioExercise({
        exercise_type: 'running',
        duration_minutes: 30,
        distance_km: '',
        calories_burned: '',
        intensity_level: 'medium',
        notes: '',
      })
      showToast('✅ Cardio added! Add more or complete training')
    }
  }

  const deleteStrengthExercise = async (exerciseId: string) => {
    const response = await api.deleteStrengthExercise(exerciseId)
    if (response.success && currentWorkoutPlan) {
      // Manually update currentWorkoutPlan instead of relying on loadWorkoutPlans
      setCurrentWorkoutPlan({
        ...currentWorkoutPlan,
        exercises: {
          ...currentWorkoutPlan.exercises,
          strength: currentWorkoutPlan.exercises?.strength?.filter((ex: any) => ex.id !== exerciseId) || []
        }
      })
      showToast('Exercise deleted')
    }
  }

  const deleteCardioExercise = async (exerciseId: string) => {
    const response = await api.deleteCardioExercise(exerciseId)
    if (response.success && currentWorkoutPlan) {
      // Manually update currentWorkoutPlan instead of relying on loadWorkoutPlans
      setCurrentWorkoutPlan({
        ...currentWorkoutPlan,
        exercises: {
          ...currentWorkoutPlan.exercises,
          cardio: currentWorkoutPlan.exercises?.cardio?.filter((ex: any) => ex.id !== exerciseId) || []
        }
      })
      showToast('Exercise deleted')
    }
  }

  const handleFitnessDateChange = (direction: 'prev' | 'next') => {
    const newDate = new Date(fitnessDate)
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 1)
    } else {
      newDate.setDate(newDate.getDate() + 1)
    }
    setFitnessDate(newDate)
    setCurrentWorkoutPlan(null)
  }

  // Refresh workout plans when date or training type changes
  useEffect(() => {
    if (activeApp === 'fitness') {
      loadWorkoutPlans()
    }
  }, [fitnessDate, fitnessTrainingType])

  // Helper functions
  const formatDateKey = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    return { firstDay, daysInMonth }
  }

  const getTotalCalories = () => {
    return foodLogs.reduce((sum, log) => sum + log.calories, 0)
  }

  return (
    <div className="desktop">
      {/* Floating Notes & Lyrics - 从音乐播放器当前位置跳出 */}
      {(isPlaying || floatingElements.length > 0) && (
        <>
          <div className="floating-notes">
            {floatingElements.filter(e => e.type === 'note').map((element, index) => (
              <div
                key={element.id}
                className="floating-note"
                style={{
                  ...getFloatingOrigin(),
                  animationDelay: `${index * 0.6}s`
                }}
              >
                {element.content}
              </div>
            ))}
          </div>
          <div className="floating-lyrics">
            {floatingElements.filter(e => e.type === 'word').map((element, index) => (
              <div
                key={element.id}
                className="floating-lyric"
                style={{
                  ...getFloatingOrigin(),
                  animationDelay: `${index * 0.6}s`
                }}
              >
                {element.content}
              </div>
            ))}
          </div>
          {/* Floating Icons - 美好Icon */}
          <div className="floating-icons">
            {floatingElements.filter(e => e.type === 'icon').map((element, index) => (
              <div
                key={element.id}
                className={`floating-icon ${element.colorClass || ''}`}
                style={{
                  ...getFloatingOrigin(),
                  animationDelay: `${index * 0.6}s`
                }}
                dangerouslySetInnerHTML={{ __html: element.content }}
              />
            ))}
          </div>
        </>
      )}

      {/* Desktop Logo - 带跳动动画 */}
      <div className="desktop-logo" ref={logoRef}>
        <div className="logo-glow"></div>
        <div className="desktop-logo-title">Yason's APP</div>
        <img src="/photos/logo.png" alt="Logo" className="desktop-logo-image" />
      </div>

      {/* User Menu */}
      <div className="user-menu-container" ref={userMenuRef}>
        <button className="user-avatar-btn" onClick={() => setShowUserMenu(!showUserMenu)}>
          <span className="user-avatar-emoji">👤</span>
        </button>
        {showUserMenu && (
          <div className="user-menu-dropdown">
            <div className="user-menu-header">
              <div className="user-menu-email">{user?.email}</div>
            </div>
            <div className="user-menu-divider"></div>
            <button className="user-menu-item" onClick={onSignOut}>
              <span>🚪</span> Sign Out
            </button>
          </div>
        )}
      </div>

      {/* Music Player - 主屏幕左下角位置 */}
      <div
        ref={musicPlayerRef}
        className="music-player-simple"
      >
        <button
          className={`music-btn-simple ${isPlaying ? 'playing' : ''}`}
          onClick={toggleMusic}
          aria-label={isPlaying ? 'Pause music' : 'Play music'}
        />
      </div>

      {/* Mini App Overlay */}
      {activeApp && (
        <div className="mini-app-overlay" onClick={() => setActiveApp(null)}>
          <div className="mini-app-content" onClick={(e) => e.stopPropagation()}>
            <button className="mini-app-close" onClick={() => setActiveApp(null)}>
              ✕
            </button>

            {/* More App */}
            {activeApp === 'more' && (
              <div className="more-app">
                <h2 className="more-title">More Apps ✨</h2>
                <div className="more-grid">
                  <div className="more-item" onClick={() => { setActiveApp('youtube'); }}>
                    <YouTubeIcon size={64} />
                    <span className="more-item-label">Thumbnail</span>
                  </div>
                  <div className="more-item" onClick={() => { setActiveApp('icons'); }}>
                    <IconsIcon size={64} />
                    <span className="more-item-label">Icons</span>
                  </div>
                </div>
              </div>
            )}

            {/* Notes App */}
            {activeApp === 'notes' && (
              <div className="notes-app">
                <div className="notes-sidebar">
                  <button className="notes-new-btn" onClick={() => { setCurrentNote(null); setNoteTitle(''); setNoteContent(''); }}>
                    ✨ New Note
                  </button>
                  <div className="notes-list">
                    {notes.map(note => (
                      <div
                        key={note.id}
                        className={`notes-item ${currentNote?.id === note.id ? 'active' : ''}`}
                        onClick={() => { setCurrentNote(note); setNoteTitle(note.title); setNoteContent(note.content); }}
                      >
                        <div className="notes-item-title">{note.title}</div>
                        <div className="notes-item-date">
                          {new Date(note.updated_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="notes-editor">
                  <input
                    type="text"
                    className="notes-title-input"
                    placeholder="Note title..."
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                  />
                  <textarea
                    className="notes-content-input"
                    placeholder="Start writing..."
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                  />
                  <div className="notes-actions">
                    <button
                      className="notes-save-btn"
                      onClick={currentNote ? updateNote : createNote}
                    >
                      💾 Save
                    </button>
                    {currentNote && (
                      <button
                        className="notes-delete-btn"
                        onClick={() => deleteNote(currentNote.id)}
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* YouTube App - Channel Thumbnails */}
            {activeApp === 'youtube' && (
              <div className="youtube-app">
                <h2 className="youtube-title">📺 Channel Thumbnails</h2>
                <p className="youtube-subtitle">Enter a YouTube channel URL to load thumbnails</p>
                <div className="youtube-url-input-group">
                  <input
                    type="text"
                    className="youtube-url-input"
                    placeholder="Paste channel URL... (e.g., youtube.com/@username)"
                    value={channelUrl}
                    onChange={(e) => setChannelUrl(e.target.value)}
                    onKeyPress={(e) => { if (e.key === 'Enter') loadChannelVideos() }}
                  />
                  <button
                    className={`youtube-load-btn ${isLoadingVideos ? 'loading' : ''}`}
                    onClick={loadChannelVideos}
                    disabled={isLoadingVideos}
                  >
                    {isLoadingVideos ? '⏳ Loading...' : '▶ Load'}
                  </button>
                </div>
                {channelVideos.length === 0 && !isLoadingVideos && (
                  <div className="youtube-empty">
                    <div className="youtube-empty-icon">📺</div>
                    <div className="youtube-empty-text">Enter a channel URL above to get started</div>
                    <div className="youtube-hint">
                      <strong>Supported formats:</strong><br/>
                      • youtube.com/@username<br/>
                      • youtube.com/c/channelname<br/>
                      • youtube.com/channel/UC...<br/>
                      • youtube.com/user/username<br/><br/>
                      <em>💡 For best results, add YouTube API key to .env file</em><br/>
                      <small>Get API key: console.cloud.google.com → YouTube Data API v3</small>
                    </div>
                  </div>
                )}
                {isLoadingVideos && (
                  <div className="youtube-loading">
                    <div className="youtube-loading-spinner">📺</div>
                    <div className="youtube-loading-text">Loading channel videos...</div>
                  </div>
                )}
                {channelVideos.length > 0 && (
                  <>
                    <div className="youtube-results-info">
                      Found {channelVideos.length} videos
                    </div>
                    <div className="youtube-thumbnails-grid">
                      {channelVideos.map((video) => (
                        <div
                          key={video.id}
                          className="youtube-thumbnail-card"
                          onClick={() => handleThumbnailClick(video)}
                        >
                          <img src={video.thumbnail} alt={video.title} className="youtube-thumbnail-img" />
                          <div className="youtube-thumbnail-title">{video.title}</div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {showDownloadModal && selectedThumbnail && (
                  <div className="download-modal" onClick={() => setShowDownloadModal(false)}>
                    <div className="download-modal-content" onClick={(e) => e.stopPropagation()}>
                      <h3>Download Thumbnail?</h3>
                      <img src={selectedThumbnail.thumbnail} alt="Thumbnail preview" className="download-preview-img" />
                      <p className="download-title">{selectedThumbnail.title}</p>
                      <div className="download-modal-actions">
                        <button className="download-modal-btn confirm" onClick={downloadThumbnail}>
                          Download 📥
                        </button>
                        <button className="download-modal-btn cancel" onClick={() => setShowDownloadModal(false)}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Camera/Food App */}
            {activeApp === 'camera' && (
              <div className="food-tracker-app">
                <div className="food-header">
                  <button className="food-date-nav" onClick={() => { const newDate = new Date(selectedFoodDate); newDate.setDate(newDate.getDate() - 1); setSelectedFoodDate(newDate); }}>
                    ‹
                  </button>
                  <div className="food-date">
                    {selectedFoodDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <button className="food-date-nav" onClick={() => { const newDate = new Date(selectedFoodDate); newDate.setDate(newDate.getDate() + 1); setSelectedFoodDate(newDate); }}>
                    ›
                  </button>
                </div>
                <div className="food-calories">
                  <div className="food-calories-number">{getTotalCalories()}</div>
                  <div className="food-calories-label">
                    kcal today <FireIcon size={20} className="inline-icon" />
                  </div>
                </div>
                <div className="food-list">
                  {foodLogs.length === 0 ? (
                    <div className="food-empty">
                      <EmptyFoodIcon size={80} className="food-empty-icon" />
                      <div className="food-empty-text">No meals logged today!</div>
                    </div>
                  ) : (
                    foodLogs.map(log => (
                      <div key={log.id} className="food-item">
                        <img src={log.image} alt={log.meal_name} className="food-image" />
                        <div className="food-info">
                          <div className="food-name">{log.meal_name}</div>
                          <div className="food-calories-data">
                            <FireIcon size={16} className="inline-icon" /> {log.calories} kcal
                          </div>
                        </div>
                        <button
                          className="food-delete"
                          onClick={() => { api.deleteFoodLog(log.id); loadFoodLogs(); }}
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                </div>
                <button className="food-add-btn" onClick={() => setShowFoodCamera(true)}>
                  <CameraAddIcon size={32} />
                </button>
                {showFoodCamera && (
                  <div className="food-camera-modal">
                    <div className="food-camera-content">
                      <h3>Snap your meal! <CameraAddIcon size={24} className="inline-icon" /></h3>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFoodImageUpload}
                        className="food-camera-input"
                      />
                      <button
                        className="food-camera-trigger-btn"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        📸 Choose Photo
                      </button>
                      <button className="food-camera-cancel" onClick={() => setShowFoodCamera(false)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* AI Analysis Loading State */}
                {isAnalyzing && (
                  <div className="ai-analysis-loading">
                    <div className="ai-loading-content">
                      <div className="ai-robot-icon">🤖</div>
                      <div className="ai-loading-text">AI 正在分析您的食物...</div>
                      <div className="ai-loading-spinner"></div>
                      <div className="ai-loading-hint">请稍候，预计需要 3-5 秒</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Calendar App */}
            {activeApp === 'calendar' && (
              <div className="calendar-app">
                <h2 className="calendar-title">Calendar & To-Do</h2>
                <div className="calendar-grid">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="calendar-day-header">{day}</div>
                  ))}
                  {[...Array(getDaysInMonth(selectedDate).firstDay)].map((_, i) => (
                    <div key={`empty-${i}`} className="calendar-day empty"></div>
                  ))}
                  {[...Array(getDaysInMonth(selectedDate).daysInMonth)].map((_, i) => {
                    const day = i + 1
                    return (
                      <div key={day} className="calendar-day">
                        {day}
                      </div>
                    )
                  })}
                </div>
                <div className="todo-section">
                  <h3>Today's Tasks</h3>
                  <div className="todo-input-group">
                    <input
                      type="text"
                      className="todo-input"
                      placeholder="Add a new task..."
                      value={newTodoTitle}
                      onChange={(e) => setNewTodoTitle(e.target.value)}
                      onKeyPress={(e) => { if (e.key === 'Enter') createTodo() }}
                    />
                    <button className="todo-add-btn" onClick={createTodo}>
                      +
                    </button>
                  </div>
                  <div className="todo-list">
                    {todos.map(todo => (
                      <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                        <input
                          type="checkbox"
                          checked={todo.completed}
                          onChange={() => toggleTodo(todo.id, todo.completed)}
                          className="todo-checkbox"
                        />
                        <span className="todo-text">{todo.title}</span>
                        <button
                          className="todo-delete"
                          onClick={() => deleteTodo(todo.id)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Icons App - GLM Image Generator */}
            {activeApp === 'icons' && (
              <div className="icons-app">
                <h2 className="icons-title">🎨 AI Icon Generator</h2>
                <p className="icons-subtitle">Generate transparent background icons with GLM</p>
                <div className="icon-input-group">
                  <input
                    type="text"
                    className="icon-prompt-input"
                    placeholder="Describe your icon... (e.g., 'cute cat', 'magic wand')"
                    value={iconPrompt}
                    onChange={(e) => setIconPrompt(e.target.value)}
                    onKeyPress={(e) => { if (e.key === 'Enter') generateIcon() }}
                  />
                  <button
                    className={`icon-generate-btn ${isGenerating ? 'generating' : ''}`}
                    onClick={generateIcon}
                    disabled={isGenerating}
                  >
                    {isGenerating ? '✨ Generating...' : '✨ Generate'}
                  </button>
                </div>
                {generatedIcon && (
                  <div className="icon-result-container">
                    <div className="icon-result-card">
                      <img src={generatedIcon} alt="Generated icon" className="icon-result-img" />
                      <div className="icon-result-actions">
                        <button className="icon-result-btn" onClick={downloadGeneratedIcon}>
                          📥 Download PNG
                        </button>
                        <button className="icon-result-btn secondary" onClick={() => setGeneratedIcon('')}>
                          ✕ Clear
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                <div className="icon-presets">
                  <p className="icon-presets-title">Quick Prompts:</p>
                  <div className="icon-preset-tags">
                    {['cute cat', 'magic star', 'heart', 'music note', 'camera', 'rocket', 'flower', 'diamond'].map((preset) => (
                      <button
                        key={preset}
                        className="icon-preset-tag"
                        onClick={() => setIconPrompt(preset)}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Fitness App - Training Tracker */}
            {activeApp === 'fitness' && (
              <div className="fitness-app">
                {fitnessView === 'dashboard' && (
                  <>
                    <div className="fitness-header">
                      <button className="fitness-date-nav" onClick={() => handleFitnessDateChange('prev')}>
                        ‹
                      </button>
                      <div className="fitness-date">
                        {fitnessDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <button className="fitness-date-nav" onClick={() => handleFitnessDateChange('next')}>
                        ›
                      </button>
                    </div>

                    {/* Training Type Tabs */}
                    <div className="fitness-tabs">
                      <button
                        className={`fitness-tab ${fitnessTrainingType === 'strength' ? 'active' : ''}`}
                        onClick={() => { setFitnessTrainingType('strength'); }}
                      >
                        <StrengthTypeIcon size={28} className="fitness-tab-icon" />
                        <span>Strength</span>
                      </button>
                      <button
                        className={`fitness-tab ${fitnessTrainingType === 'cardio' ? 'active' : ''}`}
                        onClick={() => { setFitnessTrainingType('cardio'); }}
                      >
                        <CardioTypeIcon size={28} className="fitness-tab-icon" />
                        <span>Cardio</span>
                      </button>
                    </div>

                    <FitnessDashboard
                      trainingType={fitnessTrainingType}
                      onTemplateSelect={handleTemplateSelect}
                      onCreateBlank={handleCreateBlank}
                      onCalendarSelect={handleCalendarSelect}
                      stats={fitnessStats}
                      fitnessDate={fitnessDate}
                      onStatsRefresh={loadFitnessStats}
                    />
                  </>
                )}

                {(fitnessView === 'workout' || fitnessView === 'templates') && currentWorkoutPlan && (
                  <>
                    <div className="fitness-header">
                      <button className="fitness-date-nav" onClick={() => {
                        setCurrentWorkoutPlan(null)
                        setFitnessView('dashboard')
                        setSelectedBodyPart(null)
                      }}>
                        ‹ Back
                      </button>
                      <div className="fitness-date">
                        {fitnessDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <div></div>
                    </div>

                    <div className="fitness-workout-content">
                      {/* Workout Header with Clear Button */}
                      <div className="fitness-workout-header">
                        <h3>Current Workout</h3>
                        <button
                          className="fitness-clear-btn"
                          onClick={() => {
                            setCurrentWorkoutPlan(null)
                            setSelectedBodyPart(null)
                            setFitnessView('dashboard')
                            showToast('Ready to start a new workout')
                          }}
                        >
                          + New Workout
                        </button>
                      </div>

                    {/* Strength Training View */}
                    {fitnessTrainingType === 'strength' && (
                      <>
                        {/* Instructions when no body part selected */}
                        {!selectedBodyPart && (
                          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-medium)' }}>
                            <p style={{ fontSize: '16px', marginBottom: '10px' }}>👆 Select a body part to start adding exercises</p>
                          </div>
                        )}

                        {/* Body Part Selector */}
                        <div className="body-part-selector">
                          {[
                            { key: 'chest', label: 'Chest', Icon: ChestIcon },
                            { key: 'back', label: 'Back', Icon: BackIcon },
                            { key: 'legs', label: 'Legs', Icon: LegsIcon },
                            { key: 'shoulders', label: 'Shoulders', Icon: ShouldersIcon },
                            { key: 'arms', label: 'Arms', Icon: ArmsIcon },
                            { key: 'core', label: 'Core', Icon: CoreIcon },
                          ].map((part) => (
                            <button
                              key={part.key}
                              className={`body-part-btn ${selectedBodyPart === part.key ? 'active' : ''}`}
                              onClick={() => setSelectedBodyPart(part.key)}
                            >
                              <part.Icon size={40} className="body-part-icon" />
                              <span className="body-part-label">{part.label}</span>
                            </button>
                          ))}
                        </div>

                        {/* Exercise Form */}
                        {selectedBodyPart && (
                          <div className="exercise-form">
                            <h4>Add Exercise</h4>
                            <select
                              className="exercise-select"
                              value={strengthExercise.exercise_name}
                              onChange={(e) => setStrengthExercise({ ...strengthExercise, exercise_name: e.target.value })}
                            >
                              <option value="">Select exercise...</option>
                              {selectedBodyPart === 'chest' && [
                                'Bench Press', 'Incline Bench Press', 'Push-ups', 'Chest Fly', 'Dips'
                              ].map(ex => <option key={ex} value={ex}>{ex}</option>)}
                              {selectedBodyPart === 'back' && [
                                'Pull-ups', 'Rows', 'Lat Pulldown', 'Seated Cable Row', 'Deadlift'
                              ].map(ex => <option key={ex} value={ex}>{ex}</option>)}
                              {selectedBodyPart === 'legs' && [
                                'Squats', 'Lunges', 'Leg Press', 'Leg Curl', 'Calf Raises'
                              ].map(ex => <option key={ex} value={ex}>{ex}</option>)}
                              {selectedBodyPart === 'shoulders' && [
                                'Overhead Press', 'Lateral Raise', 'Front Raise', 'Face Pulls', 'Shrugs'
                              ].map(ex => <option key={ex} value={ex}>{ex}</option>)}
                              {selectedBodyPart === 'arms' && [
                                'Bicep Curls', 'Tricep Pushdown', 'Hammer Curls', 'Skull Crushers'
                              ].map(ex => <option key={ex} value={ex}>{ex}</option>)}
                              {selectedBodyPart === 'core' && [
                                'Plank', 'Crunches', 'Leg Raises', 'Russian Twist'
                              ].map(ex => <option key={ex} value={ex}>{ex}</option>)}
                            </select>
                            <select
                              className="exercise-select"
                              value={strengthExercise.equipment}
                              onChange={(e) => setStrengthExercise({ ...strengthExercise, equipment: e.target.value })}
                            >
                              <option value="">Equipment...</option>
                              <option value="barbell">Barbell</option>
                              <option value="dumbbell">Dumbbell</option>
                              <option value="machine">Machine</option>
                              <option value="cable">Cable</option>
                              <option value="bodyweight">Bodyweight</option>
                            </select>
                            <div className="exercise-sets-reps">
                              <div className="exercise-input-group">
                                <label>Sets</label>
                                <input
                                  type="number"
                                  min="1"
                                  value={strengthExercise.sets}
                                  onChange={(e) => setStrengthExercise({ ...strengthExercise, sets: parseInt(e.target.value) || 1 })}
                                />
                              </div>
                              <div className="exercise-input-group">
                                <label>Reps</label>
                                <input
                                  type="number"
                                  min="1"
                                  value={strengthExercise.reps}
                                  onChange={(e) => setStrengthExercise({ ...strengthExercise, reps: parseInt(e.target.value) || 1 })}
                                />
                              </div>
                            </div>
                            <input
                              type="number"
                              className="exercise-input"
                              placeholder="Weight (kg) - optional"
                              value={strengthExercise.weight}
                              onChange={(e) => setStrengthExercise({ ...strengthExercise, weight: e.target.value })}
                            />
                            <button className="exercise-add-btn" onClick={addStrengthExercise}>
                              ➕ Add Exercise
                            </button>
                          </div>
                        )}

                        {/* Exercises List */}
                        {currentWorkoutPlan.exercises?.strength && currentWorkoutPlan.exercises.strength.length > 0 && (
                          <div className="exercises-list">
                            {currentWorkoutPlan.exercises.strength.map((exercise: any) => (
                              <div key={exercise.id} className="exercise-card">
                                <div className="exercise-body-part" style={{ background: BODY_PART_LABELS[exercise.body_part]?.color || 'var(--q-mint)' }}>
                                  {BODY_PART_LABELS[exercise.body_part]?.label || exercise.body_part}
                                </div>
                                <div className="exercise-info">
                                  <div className="exercise-header">
                                    <span className="exercise-name">{exercise.exercise_name}</span>
                                    <button
                                      className="exercise-delete"
                                      onClick={() => deleteStrengthExercise(exercise.id)}
                                    >
                                      ✕
                                    </button>
                                  </div>
                                  <div className="exercise-details">
                                    <span className="exercise-detail">{exercise.sets} × {exercise.reps}</span>
                                    {exercise.weight && <span className="exercise-detail">{exercise.weight}kg</span>}
                                    <span className="exercise-equipment">{exercise.equipment}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Complete Training Button */}
                        {currentWorkoutPlan.exercises?.strength && currentWorkoutPlan.exercises.strength.length > 0 && (
                          <button className="fitness-complete-btn" onClick={completeWorkout}>
                            ✨ Complete Training
                          </button>
                        )}
                      </>
                    )}

                    {/* Cardio Training View */}
                    {fitnessTrainingType === 'cardio' && (
                      <>
                        <div className="cardio-form">
                          <h4>Add Cardio Session</h4>
                          <div className="cardio-type-selector">
                            {[
                              { type: 'running', emoji: '🏃', label: 'Running' },
                              { type: 'cycling', emoji: '🚴', label: 'Cycling' },
                              { type: 'swimming', emoji: '🏊', label: 'Swimming' },
                              { type: 'hiit', emoji: '⚡', label: 'HIIT' },
                              { type: 'other', emoji: '🎯', label: 'Other' },
                            ].map((cardio) => (
                              <button
                                key={cardio.type}
                                className={`cardio-type-btn ${cardioExercise.exercise_type === cardio.type ? 'active' : ''}`}
                                onClick={() => setCardioExercise({ ...cardioExercise, exercise_type: cardio.type })}
                              >
                                <span className="cardio-type-emoji">{cardio.emoji}</span>
                                <span className="cardio-type-label">{cardio.label}</span>
                              </button>
                            ))}
                          </div>
                          <div className="cardio-input-group">
                            <label>Duration (min)</label>
                            <input
                              type="number"
                              min="1"
                              value={cardioExercise.duration_minutes}
                              onChange={(e) => setCardioExercise({ ...cardioExercise, duration_minutes: parseInt(e.target.value) || 0 })}
                            />
                          </div>
                          <input
                            type="number"
                            step="0.1"
                            className="cardio-input"
                            placeholder="Distance (km) - optional"
                            value={cardioExercise.distance_km}
                            onChange={(e) => setCardioExercise({ ...cardioExercise, distance_km: e.target.value })}
                          />
                          <input
                            type="number"
                            className="cardio-input"
                            placeholder="Calories - optional"
                            value={cardioExercise.calories_burned}
                            onChange={(e) => setCardioExercise({ ...cardioExercise, calories_burned: e.target.value })}
                          />
                          <div className="cardio-intensity-selector">
                            {['low', 'medium', 'high'].map((level) => (
                              <button
                                key={level}
                                className={`intensity-btn ${cardioExercise.intensity_level === level ? 'active' : ''}`}
                                onClick={() => setCardioExercise({ ...cardioExercise, intensity_level: level })}
                              >
                                {level.charAt(0).toUpperCase() + level.slice(1)}
                              </button>
                            ))}
                          </div>
                          <button className="cardio-add-btn" onClick={addCardioExercise}>
                            ➕ Add Session
                          </button>
                        </div>

                        {/* Cardio Sessions List */}
                        {currentWorkoutPlan.exercises?.cardio && currentWorkoutPlan.exercises.cardio.length > 0 && (
                          <div className="cardio-sessions-list">
                            {currentWorkoutPlan.exercises.cardio.map((session: any) => (
                              <div key={session.id} className="cardio-card">
                                <div className="cardio-header">
                                  <span className="cardio-type">
                                    {session.exercise_type === 'running' && '🏃 Running'}
                                    {session.exercise_type === 'cycling' && '🚴 Cycling'}
                                    {session.exercise_type === 'swimming' && '🏊 Swimming'}
                                    {session.exercise_type === 'hiit' && '⚡ HIIT'}
                                    {session.exercise_type === 'other' && '🎯 Other'}
                                  </span>
                                  <button
                                    className="cardio-delete"
                                    onClick={() => deleteCardioExercise(session.id)}
                                  >
                                    ✕
                                  </button>
                                </div>
                                <div className="cardio-details">
                                  <span className="cardio-detail">⏱ {session.duration_minutes} min</span>
                                  {session.distance_km && <span className="cardio-detail">📏 {session.distance_km} km</span>}
                                  {session.calories_burned && <span className="cardio-detail">🔥 {session.calories_burned} cal</span>}
                                  {session.intensity_level && (
                                    <span className={`cardio-intensity cardio-intensity-${session.intensity_level}`}>
                                      {session.intensity_level}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Complete Training Button */}
                        {currentWorkoutPlan.exercises?.cardio && currentWorkoutPlan.exercises.cardio.length > 0 && (
                          <button className="fitness-complete-btn" onClick={completeWorkout}>
                            ✨ Complete Training
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </>
                )}

                {/* Training Summary Page */}
                {fitnessView === 'summary' && currentWorkoutPlan && (
                  <div className="fitness-summary">
                    <div className="fitness-summary-icon">🎉</div>
                    <h2>Training Complete!</h2>
                    <p>Great job today!</p>

                    <div className="fitness-summary-stats">
                      <div className="summary-stat">
                        <div className="summary-value">
                          {fitnessTrainingType === 'strength'
                            ? (currentWorkoutPlan.exercises?.strength?.length || 0)
                            : (currentWorkoutPlan.exercises?.cardio?.length || 0)
                          }
                        </div>
                        <div className="summary-label">
                          {fitnessTrainingType === 'strength' ? 'Exercises' : 'Sessions'}
                        </div>
                      </div>
                      <div className="summary-stat">
                        <div className="summary-value">
                          {fitnessTrainingType === 'strength'
                            ? currentWorkoutPlan.exercises?.strength?.reduce((sum: number, ex: any) => sum + (ex.sets || 0), 0) || 0
                            : currentWorkoutPlan.exercises?.cardio?.reduce((sum: number, s: any) => sum + (s.duration_minutes || 0), 0) || 0
                          }
                        </div>
                        <div className="summary-label">
                          {fitnessTrainingType === 'strength' ? 'Sets' : 'Minutes'}
                        </div>
                      </div>
                      <div className="summary-stat">
                        <div className="summary-value">
                          {fitnessTrainingType === 'strength'
                            ? currentWorkoutPlan.exercises?.strength?.reduce((sum: number, ex: any) => sum + (ex.sets || 0) * (ex.reps || 0) * (ex.weight || 0), 0) || 0
                            : currentWorkoutPlan.exercises?.cardio?.reduce((sum: number, s: any) => sum + (s.calories_burned || 0), 0) || 0
                          }
                        </div>
                        <div className="summary-label">
                          {fitnessTrainingType === 'strength' ? 'Volume kg' : 'Calories'}
                        </div>
                      </div>
                    </div>

                    <button className="fitness-complete-btn" onClick={backToTraining}>
                      Back to Training
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Food Edit Modal - Global, not inside any app */}
      {showEditModal && console.log('Rendering FoodEditModal with showEditModal:', showEditModal)}
      <FoodEditModal
        isOpen={showEditModal}
        initialData={analysisResult}
        imagePreview={imagePreview}
        onSave={handleFoodEditSave}
        onCancel={handleFoodEditCancel}
        isLoading={false}
      />

      {/* Toast Notification */}
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.message}
        </div>
      )}

      {/* Dock - 只显示: More, Notes, Food, To do, Fitness */}
      <div className="dock">
        <div className="dock-item" onClick={() => setActiveApp('more')}>
          <MoreIcon size={56} className="dock-icon" />
          <span className="dock-label">More</span>
        </div>
        <div className="dock-item" onClick={() => { console.log('Notes clicked'); setActiveApp('notes'); }}>
          <NotesIcon size={56} className="dock-icon" />
          <span className="dock-label">Notes</span>
        </div>
        <div className="dock-item" onClick={() => { console.log('Food clicked'); setActiveApp('camera'); }}>
          <FoodIcon size={56} className="dock-icon" />
          <span className="dock-label">Food</span>
        </div>
        <div className="dock-item" onClick={() => { console.log('Calendar clicked'); setActiveApp('calendar'); }}>
          <CalendarIcon size={56} className="dock-icon" />
          <span className="dock-label">To do</span>
        </div>
        <div className="dock-item" onClick={() => { console.log('Fitness clicked'); setActiveApp('fitness'); }}>
          <FitnessIcon size={56} className="dock-icon" />
          <span className="dock-label">Fitness</span>
        </div>
      </div>
    </div>
  )
}
