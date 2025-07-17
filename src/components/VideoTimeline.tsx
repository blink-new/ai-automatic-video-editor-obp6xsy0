import { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Slider } from './ui/slider'
import { Badge } from './ui/badge'
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Scissors, 
  Volume2,
  AudioWaveform,
  Zap,
  Eye,
  Music
} from 'lucide-react'

interface TimelineSegment {
  id: string
  start: number
  end: number
  type: 'scene' | 'transition' | 'audio' | 'effect'
  confidence: number
  label: string
  color: string
}

interface VideoTimelineProps {
  duration: number
  currentTime: number
  onTimeChange: (time: number) => void
  isPlaying: boolean
  onPlayPause: () => void
  segments?: TimelineSegment[]
}

export function VideoTimeline({ 
  duration, 
  currentTime, 
  onTimeChange, 
  isPlaying, 
  onPlayPause,
  segments = []
}: VideoTimelineProps) {
  const [volume, setVolume] = useState(75)
  const [showWaveform, setShowWaveform] = useState(true)
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null)
  const timelineRef = useRef<HTMLDivElement>(null)

  // Generate mock waveform data
  const waveformData = Array.from({ length: 200 }, (_, i) => 
    Math.sin(i * 0.1) * 0.5 + 0.5 + Math.random() * 0.3
  )

  // Default segments if none provided
  const defaultSegments: TimelineSegment[] = [
    {
      id: '1',
      start: 0,
      end: 25,
      type: 'scene',
      confidence: 0.92,
      label: 'Opening Scene',
      color: 'bg-blue-500'
    },
    {
      id: '2', 
      start: 25,
      end: 45,
      type: 'transition',
      confidence: 0.78,
      label: 'Fade Transition',
      color: 'bg-purple-500'
    },
    {
      id: '3',
      start: 45,
      end: 85,
      type: 'scene',
      confidence: 0.89,
      label: 'Main Content',
      color: 'bg-green-500'
    },
    {
      id: '4',
      start: 85,
      end: 120,
      type: 'audio',
      confidence: 0.85,
      label: 'Music Overlay',
      color: 'bg-yellow-500'
    },
    {
      id: '5',
      start: 120,
      end: 154,
      type: 'scene',
      confidence: 0.94,
      label: 'Closing Scene',
      color: 'bg-red-500'
    }
  ]

  const timelineSegments = segments.length > 0 ? segments : defaultSegments

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getSegmentWidth = (segment: TimelineSegment) => {
    return ((segment.end - segment.start) / duration) * 100
  }

  const getSegmentLeft = (segment: TimelineSegment) => {
    return (segment.start / duration) * 100
  }

  const getCurrentPosition = () => {
    return (currentTime / duration) * 100
  }

  const handleTimelineClick = (event: React.MouseEvent) => {
    if (!timelineRef.current) return
    
    const rect = timelineRef.current.getBoundingClientRect()
    const clickX = event.clientX - rect.left
    const percentage = clickX / rect.width
    const newTime = percentage * duration
    
    onTimeChange(Math.max(0, Math.min(duration, newTime)))
  }

  const getSegmentIcon = (type: TimelineSegment['type']) => {
    switch (type) {
      case 'scene':
        return <Eye className="h-3 w-3" />
      case 'transition':
        return <Zap className="h-3 w-3" />
      case 'audio':
        return <Music className="h-3 w-3" />
      case 'effect':
        return <AudioWaveform className="h-3 w-3" />
      default:
        return <Eye className="h-3 w-3" />
    }
  }

  return (
    <Card className="bg-white/5 border-white/10">
      <CardContent className="p-6">
        {/* Timeline Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Button 
              size="sm" 
              variant="outline"
              onClick={onPlayPause}
              className="w-10 h-10 p-0"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            
            <Button size="sm" variant="outline" className="w-8 h-8 p-0">
              <SkipBack className="h-3 w-3" />
            </Button>
            
            <Button size="sm" variant="outline" className="w-8 h-8 p-0">
              <SkipForward className="h-3 w-3" />
            </Button>
            
            <div className="flex items-center space-x-2 ml-4">
              <Volume2 className="h-4 w-4 text-white/60" />
              <Slider
                value={[volume]}
                max={100}
                step={1}
                className="w-20"
                onValueChange={(value) => setVolume(value[0])}
              />
              <span className="text-xs text-white/60 w-8">{volume}%</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setShowWaveform(!showWaveform)}
              className={showWaveform ? 'bg-[#6366F1]/20 text-[#6366F1]' : ''}
            >
              <AudioWaveform className="h-4 w-4 mr-2" />
              Waveform
            </Button>
            
            <Button size="sm" variant="outline">
              <Scissors className="h-4 w-4 mr-2" />
              Split
            </Button>
            
            <span className="text-sm text-white/80 font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Timeline Visualization */}
        <div className="space-y-4">
          {/* Waveform */}
          {showWaveform && (
            <div className="h-16 bg-black/30 rounded-lg p-2 relative overflow-hidden">
              <div className="flex items-end h-full space-x-px">
                {waveformData.map((amplitude, index) => (
                  <div
                    key={index}
                    className="bg-[#6366F1]/60 flex-1 transition-all duration-75"
                    style={{ 
                      height: `${amplitude * 100}%`,
                      opacity: Math.abs(index - (currentTime / duration) * 200) < 10 ? 1 : 0.4
                    }}
                  />
                ))}
              </div>
              
              {/* Current time indicator */}
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-[#F59E0B] z-10"
                style={{ left: `${getCurrentPosition()}%` }}
              />
            </div>
          )}

          {/* Main Timeline */}
          <div 
            ref={timelineRef}
            className="relative h-12 bg-black/30 rounded-lg cursor-pointer overflow-hidden"
            onClick={handleTimelineClick}
          >
            {/* Timeline segments */}
            {timelineSegments.map((segment) => (
              <div
                key={segment.id}
                className={`absolute top-1 bottom-1 ${segment.color}/30 border-l-2 border-r-2 ${segment.color} rounded transition-all duration-200 hover:scale-y-110 cursor-pointer ${
                  selectedSegment === segment.id ? 'ring-2 ring-white/50' : ''
                }`}
                style={{
                  left: `${getSegmentLeft(segment)}%`,
                  width: `${getSegmentWidth(segment)}%`
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedSegment(selectedSegment === segment.id ? null : segment.id)
                }}
                title={`${segment.label} (${Math.round(segment.confidence * 100)}% confidence)`}
              >
                <div className="flex items-center justify-center h-full">
                  <div className={`${segment.color} rounded-full p-1`}>
                    {getSegmentIcon(segment.type)}
                  </div>
                </div>
              </div>
            ))}

            {/* Current time indicator */}
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-[#F59E0B] z-20 shadow-lg"
              style={{ left: `${getCurrentPosition()}%` }}
            >
              <div className="absolute -top-1 -left-1 w-3 h-3 bg-[#F59E0B] rounded-full shadow-lg" />
            </div>

            {/* Time markers */}
            <div className="absolute bottom-0 left-0 right-0 h-2">
              {Array.from({ length: Math.floor(duration / 10) + 1 }, (_, i) => (
                <div
                  key={i}
                  className="absolute bottom-0 w-px h-2 bg-white/20"
                  style={{ left: `${(i * 10 / duration) * 100}%` }}
                />
              ))}
            </div>
          </div>

          {/* Time scale */}
          <div className="relative h-4 text-xs text-white/60">
            {Array.from({ length: Math.floor(duration / 30) + 1 }, (_, i) => (
              <span
                key={i}
                className="absolute"
                style={{ left: `${(i * 30 / duration) * 100}%` }}
              >
                {formatTime(i * 30)}
              </span>
            ))}
          </div>
        </div>

        {/* Segment Details */}
        {selectedSegment && (
          <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
            {(() => {
              const segment = timelineSegments.find(s => s.id === selectedSegment)
              if (!segment) return null
              
              return (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`${segment.color} rounded-full p-2`}>
                      {getSegmentIcon(segment.type)}
                    </div>
                    <div>
                      <h4 className="font-medium">{segment.label}</h4>
                      <p className="text-sm text-white/60">
                        {formatTime(segment.start)} - {formatTime(segment.end)} • {segment.type}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                      {Math.round(segment.confidence * 100)}% confidence
                    </Badge>
                    <Button size="sm" variant="outline">
                      Edit
                    </Button>
                    <Button size="sm" variant="outline">
                      Delete
                    </Button>
                  </div>
                </div>
              )
            })()}
          </div>
        )}
      </CardContent>
    </Card>
  )
}