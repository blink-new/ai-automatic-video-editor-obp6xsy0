import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Progress } from './ui/progress'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { 
  Brain, 
  Eye, 
  Ear, 
  Palette, 
  Zap, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  BarChart3
} from 'lucide-react'

interface AIInsight {
  id: string
  type: 'scene_detection' | 'audio_analysis' | 'color_grading' | 'motion_tracking' | 'quality_enhancement'
  title: string
  description: string
  progress: number
  status: 'analyzing' | 'completed' | 'optimizing' | 'error'
  confidence: number
  metrics?: {
    label: string
    value: string | number
    trend?: 'up' | 'down' | 'stable'
  }[]
  suggestions?: string[]
}

interface AIProcessingInsightsProps {
  isProcessing: boolean
  projectId?: string
}

export function AIProcessingInsights({ isProcessing, projectId }: AIProcessingInsightsProps) {
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [currentPhase, setCurrentPhase] = useState('Initializing AI Analysis...')

  useEffect(() => {
    if (isProcessing) {
      simulateAIAnalysis()
    }
  }, [isProcessing])

  const simulateAIAnalysis = () => {
    const phases = [
      'Initializing AI Analysis...',
      'Analyzing video content...',
      'Detecting scenes and objects...',
      'Processing audio tracks...',
      'Analyzing color composition...',
      'Tracking motion patterns...',
      'Generating enhancement suggestions...',
      'Finalizing AI insights...'
    ]

    let phaseIndex = 0
    const phaseInterval = setInterval(() => {
      if (phaseIndex < phases.length) {
        setCurrentPhase(phases[phaseIndex])
        phaseIndex++
      } else {
        clearInterval(phaseInterval)
      }
    }, 2000)

    // Simulate progressive insights
    const insightTemplates: Omit<AIInsight, 'id' | 'progress' | 'status'>[] = [
      {
        type: 'scene_detection',
        title: 'Scene Detection',
        description: 'Analyzing video structure and identifying distinct scenes',
        confidence: 0.92,
        metrics: [
          { label: 'Scenes Found', value: 8 },
          { label: 'Avg Scene Length', value: '19.2s' },
          { label: 'Transition Quality', value: 'High', trend: 'up' }
        ],
        suggestions: [
          'Auto-cut detected at 0:23 for smoother flow',
          'Add fade transition between scenes 3-4',
          'Consider shortening scene 6 by 3 seconds'
        ]
      },
      {
        type: 'audio_analysis',
        title: 'Audio Analysis',
        description: 'Processing audio tracks and identifying enhancement opportunities',
        confidence: 0.87,
        metrics: [
          { label: 'Audio Quality', value: '7.8/10' },
          { label: 'Background Noise', value: 'Low' },
          { label: 'Volume Consistency', value: '85%', trend: 'stable' }
        ],
        suggestions: [
          'Normalize audio levels across all segments',
          'Apply noise reduction at 1:23-1:45',
          'Enhance voice clarity in segment 2'
        ]
      },
      {
        type: 'color_grading',
        title: 'Color Analysis',
        description: 'Evaluating color composition and suggesting improvements',
        confidence: 0.79,
        metrics: [
          { label: 'Color Balance', value: 'Good' },
          { label: 'Saturation', value: '72%' },
          { label: 'Contrast Ratio', value: '4.2:1', trend: 'up' }
        ],
        suggestions: [
          'Increase warmth in outdoor scenes',
          'Adjust shadows in segment 4',
          'Apply color correction to match brand palette'
        ]
      },
      {
        type: 'motion_tracking',
        title: 'Motion Analysis',
        description: 'Tracking camera movement and subject motion patterns',
        confidence: 0.94,
        metrics: [
          { label: 'Camera Stability', value: '9.1/10' },
          { label: 'Motion Blur', value: 'Minimal' },
          { label: 'Tracking Accuracy', value: '96%', trend: 'up' }
        ],
        suggestions: [
          'Apply stabilization to handheld segments',
          'Add motion blur for dynamic transitions',
          'Track subject movement for auto-focus'
        ]
      },
      {
        type: 'quality_enhancement',
        title: 'Quality Enhancement',
        description: 'Identifying opportunities for overall video improvement',
        confidence: 0.88,
        metrics: [
          { label: 'Overall Quality', value: '8.4/10' },
          { label: 'Sharpness', value: 'High' },
          { label: 'Compression', value: 'Optimal', trend: 'stable' }
        ],
        suggestions: [
          'Upscale resolution to 4K for better quality',
          'Apply AI denoising to low-light segments',
          'Enhance detail preservation in fast motion'
        ]
      }
    ]

    insightTemplates.forEach((template, index) => {
      setTimeout(() => {
        const newInsight: AIInsight = {
          ...template,
          id: `insight-${index}`,
          progress: 0,
          status: 'analyzing'
        }
        
        setInsights(prev => [...prev, newInsight])
        
        // Simulate progress
        let progress = 0
        const progressInterval = setInterval(() => {
          progress += Math.random() * 15 + 5
          
          if (progress >= 100) {
            progress = 100
            setInsights(prev => prev.map(insight => 
              insight.id === newInsight.id 
                ? { ...insight, progress: 100, status: 'completed' }
                : insight
            ))
            clearInterval(progressInterval)
          } else {
            setInsights(prev => prev.map(insight => 
              insight.id === newInsight.id 
                ? { ...insight, progress: Math.min(progress, 100) }
                : insight
            ))
          }
        }, 800)
      }, index * 3000)
    })
  }

  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'scene_detection':
        return <Eye className="h-5 w-5" />
      case 'audio_analysis':
        return <Ear className="h-5 w-5" />
      case 'color_grading':
        return <Palette className="h-5 w-5" />
      case 'motion_tracking':
        return <Activity className="h-5 w-5" />
      case 'quality_enhancement':
        return <TrendingUp className="h-5 w-5" />
      default:
        return <Brain className="h-5 w-5" />
    }
  }

  const getStatusIcon = (status: AIInsight['status']) => {
    switch (status) {
      case 'analyzing':
        return <Clock className="h-4 w-4 animate-pulse text-blue-400" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case 'optimizing':
        return <Zap className="h-4 w-4 animate-bounce text-yellow-400" />
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-400" />
    }
  }

  const getStatusColor = (status: AIInsight['status']) => {
    switch (status) {
      case 'analyzing':
        return 'bg-blue-500/20 text-blue-400'
      case 'completed':
        return 'bg-green-500/20 text-green-400'
      case 'optimizing':
        return 'bg-yellow-500/20 text-yellow-400'
      case 'error':
        return 'bg-red-500/20 text-red-400'
    }
  }

  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-400" />
      case 'down':
        return <TrendingUp className="h-3 w-3 text-red-400 rotate-180" />
      case 'stable':
        return <BarChart3 className="h-3 w-3 text-blue-400" />
      default:
        return null
    }
  }

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-[#6366F1]" />
          <span>AI Processing Insights</span>
          {isProcessing && (
            <Badge variant="secondary" className="bg-[#6366F1]/20 text-[#6366F1] animate-pulse">
              Processing
            </Badge>
          )}
        </CardTitle>
        {isProcessing && (
          <p className="text-sm text-white/60">{currentPhase}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.length === 0 ? (
          <div className="text-center py-8">
            <Brain className="h-12 w-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/60">
              {isProcessing ? 'AI analysis starting...' : 'Upload a video to see AI insights'}
            </p>
          </div>
        ) : (
          insights.map((insight) => (
            <div key={insight.id} className="space-y-3">
              {/* Insight Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-[#6366F1]/20 rounded-lg">
                    {getInsightIcon(insight.type)}
                  </div>
                  <div>
                    <h4 className="font-medium">{insight.title}</h4>
                    <p className="text-sm text-white/60">{insight.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(insight.status)}
                  <Badge variant="secondary" className={getStatusColor(insight.status)}>
                    {insight.status}
                  </Badge>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-white/60">
                  <span>Progress</span>
                  <span>{Math.round(insight.progress)}%</span>
                </div>
                <Progress value={insight.progress} className="h-2" />
              </div>

              {/* Metrics */}
              {insight.metrics && insight.status === 'completed' && (
                <div className="grid grid-cols-3 gap-3">
                  {insight.metrics.map((metric, index) => (
                    <div key={index} className="bg-white/5 rounded-lg p-3 text-center">
                      <div className="flex items-center justify-center space-x-1 mb-1">
                        <span className="text-xs text-white/60">{metric.label}</span>
                        {getTrendIcon(metric.trend)}
                      </div>
                      <div className="font-medium text-sm">{metric.value}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Suggestions */}
              {insight.suggestions && insight.status === 'completed' && (
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-white/80">AI Suggestions:</h5>
                  <div className="space-y-1">
                    {insight.suggestions.slice(0, 2).map((suggestion, index) => (
                      <div key={index} className="flex items-center justify-between text-xs bg-white/5 rounded p-2">
                        <span className="text-white/70">{suggestion}</span>
                        <Button size="sm" variant="outline" className="h-6 px-2 text-xs">
                          Apply
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Confidence Score */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/60">Confidence Score</span>
                <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                  {Math.round(insight.confidence * 100)}%
                </Badge>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}