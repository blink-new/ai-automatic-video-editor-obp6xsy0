import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import { Button } from './components/ui/button'
import { Progress } from './components/ui/progress'
import { Badge } from './components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'
import { Slider } from './components/ui/slider'
import { Switch } from './components/ui/switch'
import { useToast } from './hooks/use-toast'
import { blink } from './blink/client'
import { VideoTimeline } from './components/VideoTimeline'
import { AIProcessingInsights } from './components/AIProcessingInsights'
import { ExportOptions } from './components/ExportOptions'
import { 
  Upload, 
  Play, 
  Pause, 
  Download, 
  Scissors, 
  Sparkles, 
  Volume2, 
  Settings,
  FileVideo,
  Clock,
  Zap,
  CheckCircle,
  AlertCircle,
  Loader2,
  User,
  LogOut,
  BarChart3,
  Users,
  Share2
} from 'lucide-react'

interface VideoProject {
  id: string
  name: string
  status: 'uploading' | 'processing' | 'completed' | 'error'
  progress: number
  duration?: string
  size?: string
  aiSuggestions?: Array<{
    type: string
    title: string
    description: string
    confidence: number
    action: string
  }>
}

function App() {
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [projects, setProjects] = useState<VideoProject[]>([
    {
      id: '1',
      name: 'Summer Vacation 2024.mp4',
      status: 'completed',
      progress: 100,
      duration: '2:34',
      size: '45.2 MB'
    },
    {
      id: '2', 
      name: 'Product Demo.mov',
      status: 'processing',
      progress: 67,
      duration: '1:12',
      size: '28.1 MB'
    }
  ])
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(154) // 2:34 in seconds
  const [aiSettings, setAiSettings] = useState({
    sceneDetection: true,
    smartTransitions: true,
    audioEnhancement: true,
    colorCorrection: false,
    quality: 'high'
  })
  const [isDragOver, setIsDragOver] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [activeTab, setActiveTab] = useState('editor')
  const [collaborators, setCollaborators] = useState([
    { id: '1', name: 'John Doe', avatar: '👨‍💻', status: 'online' },
    { id: '2', name: 'Jane Smith', avatar: '👩‍🎨', status: 'editing' }
  ])
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  const validateVideoFile = (file: File): { valid: boolean; error?: string } => {
    const maxSize = 500 * 1024 * 1024 // 500MB
    const allowedTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/mkv', 'video/webm']
    
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Please upload a valid video file (MP4, MOV, AVI, MKV, WebM)' }
    }
    
    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 500MB' }
    }
    
    return { valid: true }
  }

  const handleFileUpload = async (file: File) => {
    if (!user) return
    
    const validation = validateVideoFile(file)
    if (!validation.valid) {
      toast({
        title: "Upload Error",
        description: validation.error,
        variant: "destructive"
      })
      return
    }
    
    setSelectedFile(file)
    const newProject: VideoProject = {
      id: Date.now().toString(),
      name: file.name,
      status: 'uploading',
      progress: 0,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`
    }
    setProjects(prev => [newProject, ...prev])
    
    try {
      // Upload to Blink storage
      const { publicUrl } = await blink.storage.upload(
        file,
        `videos/${user.id}/${newProject.id}/${file.name}`,
        { 
          upsert: true,
          onProgress: (percent) => {
            setProjects(prev => prev.map(p => 
              p.id === newProject.id 
                ? { ...p, progress: Math.min(percent, 15) } // Upload is first 15% of progress
                : p
            ))
          }
        }
      )
      
      // Update project with file URL and start processing
      setProjects(prev => prev.map(p => 
        p.id === newProject.id 
          ? { ...p, status: 'processing' as const, progress: 15 }
          : p
      ))
      
      // Simulate AI processing
      simulateProcessing(newProject.id)
      
      toast({
        title: "Upload Started",
        description: `Processing ${file.name} with AI...`
      })
    } catch (error) {
      console.error('Upload failed:', error)
      setProjects(prev => prev.map(p => 
        p.id === newProject.id 
          ? { ...p, status: 'error' as const }
          : p
      ))
      
      toast({
        title: "Upload Failed",
        description: "Failed to upload video. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(event.dataTransfer.files)
    const videoFile = files.find(file => file.type.startsWith('video/'))
    
    if (videoFile) {
      handleFileUpload(videoFile)
    } else {
      toast({
        title: "Invalid File",
        description: "Please drop a valid video file",
        variant: "destructive"
      })
    }
  }

  const simulateProcessing = async (projectId: string) => {
    let progress = 0
    const processingSteps = [
      { step: 'Uploading video...', progress: 15 },
      { step: 'Analyzing video content...', progress: 30 },
      { step: 'Detecting scenes and cuts...', progress: 45 },
      { step: 'Processing audio tracks...', progress: 60 },
      { step: 'Applying AI enhancements...', progress: 75 },
      { step: 'Generating transitions...', progress: 90 },
      { step: 'Finalizing output...', progress: 100 }
    ]
    
    let currentStepIndex = 0
    
    const interval = setInterval(async () => {
      const currentStep = processingSteps[currentStepIndex]
      const targetProgress = currentStep.progress
      
      if (progress < targetProgress) {
        progress += Math.random() * 8 + 2 // More consistent progress
        progress = Math.min(progress, targetProgress)
      } else {
        currentStepIndex++
      }
      
      if (progress >= 100 || currentStepIndex >= processingSteps.length) {
        progress = 100
        setProjects(prev => prev.map(p => 
          p.id === projectId 
            ? { ...p, status: 'completed', progress: 100, duration: '1:45' }
            : p
        ))
        
        // Generate AI suggestions when processing is complete
        await generateAISuggestions(projectId)
        
        const project = projects.find(p => p.id === projectId)
        toast({
          title: "Processing Complete!",
          description: `${project?.name || 'Video'} has been processed successfully with AI enhancements.`
        })
        
        clearInterval(interval)
      } else {
        const status = progress < 20 ? 'uploading' : 'processing'
        setProjects(prev => prev.map(p => 
          p.id === projectId ? { ...p, status, progress } : p
        ))
      }
    }, 800)
  }

  const generateAISuggestions = async (projectId: string) => {
    try {
      const project = projects.find(p => p.id === projectId)
      if (!project) return

      // Simulate realistic AI analysis based on filename and common video patterns
      const suggestions = []
      
      // Scene detection suggestion
      const sceneCount = Math.floor(Math.random() * 12) + 3
      suggestions.push({
        type: 'scene_detection',
        title: 'Scene Detection',
        description: `Found ${sceneCount} distinct scenes. Auto-cut recommended.`,
        confidence: 0.85 + Math.random() * 0.1,
        action: 'auto_cut'
      })

      // Audio analysis
      if (Math.random() > 0.3) {
        const audioIssues = ['Audio delay detected', 'Background noise found', 'Volume inconsistency detected']
        const issue = audioIssues[Math.floor(Math.random() * audioIssues.length)]
        const timestamp = `${Math.floor(Math.random() * 3)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`
        
        suggestions.push({
          type: 'audio_sync',
          title: 'Audio Enhancement',
          description: `${issue} at ${timestamp}. Auto-fix available.`,
          confidence: 0.75 + Math.random() * 0.15,
          action: 'fix_audio'
        })
      }

      // Quality enhancement
      const qualityImprovement = Math.floor(Math.random() * 25) + 10
      suggestions.push({
        type: 'quality_enhancement',
        title: 'Quality Enhancement',
        description: `Video quality can be improved by ${qualityImprovement}%.`,
        confidence: 0.70 + Math.random() * 0.2,
        action: 'enhance_quality'
      })

      // Update projects with AI suggestions
      setProjects(prev => prev.map(p => 
        p.id === projectId 
          ? { ...p, aiSuggestions: suggestions }
          : p
      ))

      console.log('AI Suggestions generated:', suggestions)
    } catch (error) {
      console.error('Failed to generate AI suggestions:', error)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getStatusIcon = (status: VideoProject['status']) => {
    switch (status) {
      case 'uploading':
        return <Upload className="h-4 w-4 animate-pulse" />
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusColor = (status: VideoProject['status']) => {
    switch (status) {
      case 'uploading':
        return 'bg-blue-500/20 text-blue-400'
      case 'processing':
        return 'bg-amber-500/20 text-amber-400'
      case 'completed':
        return 'bg-green-500/20 text-green-400'
      case 'error':
        return 'bg-red-500/20 text-red-400'
    }
  }

  const handleExport = async (exportSettings: any) => {
    setIsExporting(true)
    setExportProgress(0)
    
    try {
      // Simulate export process
      const exportSteps = [
        'Preparing export...',
        'Applying AI enhancements...',
        'Rendering video...',
        'Optimizing quality...',
        'Finalizing export...'
      ]
      
      for (let i = 0; i < exportSteps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 2000))
        setExportProgress((i + 1) * 20)
      }
      
      toast({
        title: "Export Complete!",
        description: "Your video has been exported successfully."
      })
      
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export video. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsExporting(false)
      setExportProgress(0)
    }
  }

  const handleTimeChange = (time: number) => {
    setCurrentTime(time)
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F23] text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#6366F1] mx-auto mb-4" />
          <p className="text-white/60">Loading AI Video Editor...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0F0F23] text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="gradient-border rounded-lg mb-6 inline-block">
            <div className="gradient-border-inner p-4">
              <Sparkles className="h-12 w-12 text-[#6366F1]" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-4">AI Video Editor</h1>
          <p className="text-white/60 mb-8">
            Transform your videos with intelligent automatic editing powered by AI
          </p>
          <Button 
            onClick={() => blink.auth.login()}
            className="bg-[#6366F1] hover:bg-[#6366F1]/80 text-white px-8 py-3"
          >
            <User className="h-4 w-4 mr-2" />
            Sign In to Get Started
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0F0F23] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0F0F23]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="gradient-border rounded-lg">
                <div className="gradient-border-inner p-2">
                  <Sparkles className="h-6 w-6 text-[#6366F1]" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-semibold">AI Video Editor</h1>
                <p className="text-sm text-white/60">Intelligent automatic editing</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="bg-[#6366F1]/20 text-[#6366F1] border-[#6366F1]/30">
                <Zap className="h-3 w-3 mr-1" />
                AI Powered
              </Badge>
              
              {/* Collaborators */}
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-white/60" />
                <div className="flex -space-x-2">
                  {collaborators.map((collaborator) => (
                    <div
                      key={collaborator.id}
                      className="w-8 h-8 rounded-full bg-[#6366F1]/20 border-2 border-[#0F0F23] flex items-center justify-center text-sm"
                      title={`${collaborator.name} (${collaborator.status})`}
                    >
                      {collaborator.avatar}
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-white/80">
                <User className="h-4 w-4" />
                <span>{user.email}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => blink.auth.logout()}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Main Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-8">
          <TabsList className="grid w-full grid-cols-4 max-w-md mx-auto">
            <TabsTrigger value="editor" className="flex items-center space-x-2">
              <Scissors className="h-4 w-4" />
              <span>Editor</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Insights</span>
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center space-x-2">
              <FileVideo className="h-4 w-4" />
              <span>Projects</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="editor" className="mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Editor Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Upload Zone */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="h-5 w-5 text-[#6366F1]" />
                  <span>Upload Video</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className={`upload-zone border-2 border-dashed rounded-lg p-12 text-center transition-all cursor-pointer ${
                    isDragOver 
                      ? 'border-[#6366F1] bg-[#6366F1]/5 scale-[1.02]' 
                      : 'border-white/20 hover:border-[#6366F1]/50'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <FileVideo className={`h-12 w-12 mx-auto mb-4 transition-colors ${
                    isDragOver ? 'text-[#6366F1]' : 'text-white/40'
                  }`} />
                  <h3 className="text-lg font-medium mb-2">
                    {isDragOver ? 'Drop your video here' : 'Drop your video here'}
                  </h3>
                  <p className="text-white/60 mb-4">
                    {isDragOver ? 'Release to upload' : 'or click to browse files'}
                  </p>
                  <Button className="bg-[#6366F1] hover:bg-[#6366F1]/80">
                    <Upload className="h-4 w-4 mr-2" />
                    Choose File
                  </Button>
                  <p className="text-xs text-white/40 mt-3">
                    Supports MP4, MOV, AVI, MKV, WebM • Max 500MB
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleInputChange}
                    className="hidden"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Video Preview */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <Play className="h-5 w-5 text-[#F59E0B]" />
                    <span>Video Preview</span>
                  </span>
                  <div className="flex items-center space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setActiveTab('export')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-black/50 rounded-lg mb-6 flex items-center justify-center">
                  <div className="text-center">
                    <FileVideo className="h-16 w-16 text-white/20 mx-auto mb-4" />
                    <p className="text-white/60">Video preview will appear here</p>
                    <p className="text-xs text-white/40 mt-2">Upload a video to start editing</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Video Timeline */}
            <VideoTimeline
              duration={duration}
              currentTime={currentTime}
              onTimeChange={handleTimeChange}
              isPlaying={isPlaying}
              onPlayPause={handlePlayPause}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Settings Panel */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-[#F59E0B]" />
                  <span>AI Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Auto Scene Detection</label>
                  <Switch 
                    checked={aiSettings.sceneDetection}
                    onCheckedChange={(checked) => 
                      setAiSettings(prev => ({ ...prev, sceneDetection: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Smart Transitions</label>
                  <Switch 
                    checked={aiSettings.smartTransitions}
                    onCheckedChange={(checked) => 
                      setAiSettings(prev => ({ ...prev, smartTransitions: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Audio Enhancement</label>
                  <Switch 
                    checked={aiSettings.audioEnhancement}
                    onCheckedChange={(checked) => 
                      setAiSettings(prev => ({ ...prev, audioEnhancement: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Auto Color Correction</label>
                  <Switch 
                    checked={aiSettings.colorCorrection}
                    onCheckedChange={(checked) => 
                      setAiSettings(prev => ({ ...prev, colorCorrection: checked }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Processing Quality</label>
                  <Tabs 
                    value={aiSettings.quality} 
                    onValueChange={(value) => 
                      setAiSettings(prev => ({ ...prev, quality: value }))
                    }
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="fast">Fast</TabsTrigger>
                      <TabsTrigger value="balanced">Balanced</TabsTrigger>
                      <TabsTrigger value="high">High</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                <Button 
                  className="w-full bg-[#F59E0B] hover:bg-[#F59E0B]/80 text-black"
                  size="sm"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Apply AI Settings
                </Button>
              </CardContent>
            </Card>

            {/* Processing Queue */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-[#6366F1]" />
                  <span>Processing Queue</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {projects.map((project) => (
                  <div key={project.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(project.status)}
                        <span className="text-sm font-medium truncate max-w-[150px]">
                          {project.name}
                        </span>
                      </div>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${getStatusColor(project.status)}`}
                      >
                        {project.status}
                      </Badge>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                    <div className="flex justify-between text-xs text-white/60">
                      <span>{project.progress}%</span>
                      <span>{project.duration && `${project.duration} • `}{project.size}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Smart Suggestions */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-[#F59E0B]" />
                  <span>AI Suggestions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(() => {
                  const completedProject = projects.find(p => p.status === 'completed' && p.aiSuggestions)
                  const suggestions = completedProject?.aiSuggestions || []
                  
                  if (suggestions.length === 0) {
                    return (
                      <div className="text-center py-6">
                        <Sparkles className="h-8 w-8 text-white/20 mx-auto mb-2" />
                        <p className="text-sm text-white/60">Complete a video to see AI suggestions</p>
                      </div>
                    )
                  }
                  
                  return suggestions.map((suggestion, index) => {
                    const getColorClass = (type: string) => {
                      switch (type) {
                        case 'scene_detection':
                          return { bg: 'bg-[#6366F1]/10', border: 'border-[#6366F1]/20', text: 'text-[#6366F1]' }
                        case 'audio_sync':
                          return { bg: 'bg-[#F59E0B]/10', border: 'border-[#F59E0B]/20', text: 'text-[#F59E0B]' }
                        case 'quality_enhancement':
                          return { bg: 'bg-green-500/10', border: 'border-green-500/20', text: 'text-green-400' }
                        default:
                          return { bg: 'bg-white/5', border: 'border-white/10', text: 'text-white' }
                      }
                    }
                    
                    const colors = getColorClass(suggestion.type)
                    const confidencePercent = Math.round(suggestion.confidence * 100)
                    
                    return (
                      <div key={index} className={`p-3 ${colors.bg} border ${colors.border} rounded-lg`}>
                        <div className="flex items-center justify-between mb-1">
                          <p className={`text-sm font-medium ${colors.text}`}>{suggestion.title}</p>
                          <Badge variant="secondary" className="text-xs">
                            {confidencePercent}%
                          </Badge>
                        </div>
                        <p className="text-xs text-white/70 mb-2">{suggestion.description}</p>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-xs h-6 px-2"
                          onClick={() => {
                            // Simulate applying the suggestion
                            console.log(`Applying ${suggestion.action} for project ${completedProject?.id}`)
                          }}
                        >
                          Apply Fix
                        </Button>
                      </div>
                    )
                  })
                })()}
              </CardContent>
            </Card>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="insights" className="mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AIProcessingInsights 
            isProcessing={projects.some(p => p.status === 'processing')}
            projectId={projects.find(p => p.status === 'processing')?.id}
          />
          
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-[#6366F1]" />
                <span>Performance Analytics</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <div className="text-2xl font-bold text-[#6366F1]">8.4/10</div>
                  <div className="text-sm text-white/60">Overall Quality</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <div className="text-2xl font-bold text-[#F59E0B]">92%</div>
                  <div className="text-sm text-white/60">AI Confidence</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <div className="text-2xl font-bold text-green-400">2:34</div>
                  <div className="text-sm text-white/60">Final Duration</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400">12</div>
                  <div className="text-sm text-white/60">AI Enhancements</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium">Processing Timeline</h4>
                <div className="space-y-2">
                  {[
                    { step: 'Video Analysis', time: '0:23', status: 'completed' },
                    { step: 'Scene Detection', time: '0:45', status: 'completed' },
                    { step: 'Audio Processing', time: '1:12', status: 'completed' },
                    { step: 'AI Enhancement', time: '1:58', status: 'completed' },
                    { step: 'Final Render', time: '2:34', status: 'completed' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-white/80">{item.step}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-white/60">{item.time}</span>
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="export" className="mt-8">
        <div className="max-w-4xl mx-auto">
          <ExportOptions 
            onExport={handleExport}
            isExporting={isExporting}
            exportProgress={exportProgress}
          />
        </div>
      </TabsContent>

      <TabsContent value="projects" className="mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="bg-white/5 border-white/10 project-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(project.status)}
                    <Badge variant="secondary" className={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                  </div>
                  <Button size="sm" variant="outline">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
                
                <h3 className="font-medium mb-2 truncate">{project.name}</h3>
                
                <div className="space-y-2 mb-4">
                  <Progress value={project.progress} className="h-2" />
                  <div className="flex justify-between text-xs text-white/60">
                    <span>{project.progress}%</span>
                    <span>{project.duration && `${project.duration} • `}{project.size}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <Button size="sm" variant="outline">
                    <Play className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  {project.status === 'completed' && (
                    <Button size="sm" className="bg-[#F59E0B] hover:bg-[#F59E0B]/80 text-black">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          
          {/* Add New Project Card */}
          <Card className="bg-white/5 border-white/10 border-dashed hover:border-[#6366F1]/50 cursor-pointer transition-all">
            <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[200px]">
              <Upload className="h-12 w-12 text-white/40 mb-4" />
              <h3 className="font-medium mb-2">Create New Project</h3>
              <p className="text-sm text-white/60 text-center mb-4">
                Upload a video to start a new AI editing project
              </p>
              <Button 
                className="bg-[#6366F1] hover:bg-[#6366F1]/80"
                onClick={() => {
                  setActiveTab('editor')
                  fileInputRef.current?.click()
                }}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Video
              </Button>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
      </div>
    </div>
  )
}

export default App