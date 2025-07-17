import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Slider } from './ui/slider'
import { Switch } from './ui/switch'
import { Progress } from './ui/progress'
import { 
  Download, 
  Settings, 
  Film, 
  Smartphone, 
  Monitor, 
  Tv,
  FileVideo,
  Zap,
  Clock,
  HardDrive,
  Wifi,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface ExportPreset {
  id: string
  name: string
  description: string
  format: string
  resolution: string
  quality: string
  size: string
  icon: React.ReactNode
  recommended?: boolean
}

interface ExportOptionsProps {
  onExport: (options: ExportSettings) => void
  isExporting?: boolean
  exportProgress?: number
}

interface ExportSettings {
  format: string
  resolution: string
  quality: number
  bitrate: number
  fps: number
  codec: string
  audioQuality: number
  includeSubtitles: boolean
  watermark: boolean
}

export function ExportOptions({ onExport, isExporting = false, exportProgress = 0 }: ExportOptionsProps) {
  const [selectedPreset, setSelectedPreset] = useState('youtube')
  const [customSettings, setCustomSettings] = useState<ExportSettings>({
    format: 'mp4',
    resolution: '1920x1080',
    quality: 80,
    bitrate: 8000,
    fps: 30,
    codec: 'h264',
    audioQuality: 192,
    includeSubtitles: false,
    watermark: false
  })
  const [estimatedSize, setEstimatedSize] = useState('45.2 MB')
  const [estimatedTime, setEstimatedTime] = useState('2-3 minutes')

  const exportPresets: ExportPreset[] = [
    {
      id: 'youtube',
      name: 'YouTube',
      description: 'Optimized for YouTube upload',
      format: 'MP4',
      resolution: '1920×1080',
      quality: 'High',
      size: '~45 MB',
      icon: <Tv className="h-5 w-5" />,
      recommended: true
    },
    {
      id: 'instagram',
      name: 'Instagram',
      description: 'Square format for social media',
      format: 'MP4',
      resolution: '1080×1080',
      quality: 'High',
      size: '~32 MB',
      icon: <Smartphone className="h-5 w-5" />
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      description: 'Vertical format for short videos',
      format: 'MP4',
      resolution: '1080×1920',
      quality: 'High',
      size: '~28 MB',
      icon: <Smartphone className="h-5 w-5" />
    },
    {
      id: 'web',
      name: 'Web',
      description: 'Optimized for web streaming',
      format: 'MP4',
      resolution: '1280×720',
      quality: 'Medium',
      size: '~22 MB',
      icon: <Monitor className="h-5 w-5" />
    },
    {
      id: 'high_quality',
      name: 'High Quality',
      description: 'Maximum quality for archival',
      format: 'MOV',
      resolution: '3840×2160',
      quality: 'Ultra',
      size: '~180 MB',
      icon: <Film className="h-5 w-5" />
    },
    {
      id: 'compressed',
      name: 'Compressed',
      description: 'Small file size for sharing',
      format: 'MP4',
      resolution: '854×480',
      quality: 'Low',
      size: '~12 MB',
      icon: <HardDrive className="h-5 w-5" />
    }
  ]

  const formatOptions = [
    { value: 'mp4', label: 'MP4', description: 'Most compatible' },
    { value: 'mov', label: 'MOV', description: 'High quality' },
    { value: 'avi', label: 'AVI', description: 'Uncompressed' },
    { value: 'webm', label: 'WebM', description: 'Web optimized' }
  ]

  const resolutionOptions = [
    { value: '3840x2160', label: '4K (3840×2160)', description: 'Ultra HD' },
    { value: '1920x1080', label: 'Full HD (1920×1080)', description: 'Standard HD' },
    { value: '1280x720', label: 'HD (1280×720)', description: 'HD Ready' },
    { value: '854x480', label: 'SD (854×480)', description: 'Standard Definition' }
  ]

  const codecOptions = [
    { value: 'h264', label: 'H.264', description: 'Most compatible' },
    { value: 'h265', label: 'H.265', description: 'Better compression' },
    { value: 'vp9', label: 'VP9', description: 'Open source' }
  ]

  const handlePresetSelect = (presetId: string) => {
    setSelectedPreset(presetId)
    const preset = exportPresets.find(p => p.id === presetId)
    if (preset) {
      // Update custom settings based on preset
      const newSettings = { ...customSettings }
      
      switch (presetId) {
        case 'youtube':
          newSettings.resolution = '1920x1080'
          newSettings.quality = 80
          newSettings.bitrate = 8000
          break
        case 'instagram':
          newSettings.resolution = '1080x1080'
          newSettings.quality = 75
          newSettings.bitrate = 6000
          break
        case 'tiktok':
          newSettings.resolution = '1080x1920'
          newSettings.quality = 75
          newSettings.bitrate = 6000
          break
        case 'web':
          newSettings.resolution = '1280x720'
          newSettings.quality = 65
          newSettings.bitrate = 4000
          break
        case 'high_quality':
          newSettings.resolution = '3840x2160'
          newSettings.quality = 95
          newSettings.bitrate = 20000
          break
        case 'compressed':
          newSettings.resolution = '854x480'
          newSettings.quality = 50
          newSettings.bitrate = 2000
          break
      }
      
      setCustomSettings(newSettings)
      updateEstimates(newSettings)
    }
  }

  const updateEstimates = (settings: ExportSettings) => {
    // Simple estimation logic
    const resolutionMultiplier = {
      '3840x2160': 4,
      '1920x1080': 1,
      '1280x720': 0.6,
      '854x480': 0.3
    }[settings.resolution] || 1
    
    const qualityMultiplier = settings.quality / 100
    const baseSize = 45 // MB for 1080p at 80% quality
    
    const estimatedSizeMB = Math.round(baseSize * resolutionMultiplier * qualityMultiplier)
    setEstimatedSize(`~${estimatedSizeMB} MB`)
    
    const baseTime = 2 // minutes for standard processing
    const estimatedTimeMin = Math.round(baseTime * resolutionMultiplier * qualityMultiplier)
    setEstimatedTime(`${estimatedTimeMin}-${estimatedTimeMin + 1} minutes`)
  }

  const handleExport = () => {
    onExport(customSettings)
  }

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Download className="h-5 w-5 text-[#F59E0B]" />
            <span>Export Options</span>
          </div>
          {isExporting && (
            <Badge variant="secondary" className="bg-[#F59E0B]/20 text-[#F59E0B] animate-pulse">
              Exporting...
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isExporting ? (
          <div className="space-y-4">
            <div className="text-center">
              <FileVideo className="h-12 w-12 text-[#F59E0B] mx-auto mb-4 animate-bounce" />
              <h3 className="font-medium mb-2">Exporting Your Video</h3>
              <p className="text-sm text-white/60 mb-4">
                Processing with AI enhancements...
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Export Progress</span>
                <span>{Math.round(exportProgress)}%</span>
              </div>
              <Progress value={exportProgress} className="h-3" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-white/60" />
                <span className="text-white/60">Time remaining: {estimatedTime}</span>
              </div>
              <div className="flex items-center space-x-2">
                <HardDrive className="h-4 w-4 text-white/60" />
                <span className="text-white/60">Size: {estimatedSize}</span>
              </div>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="presets" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="presets">Quick Presets</TabsTrigger>
              <TabsTrigger value="custom">Custom Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="presets" className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                {exportPresets.map((preset) => (
                  <div
                    key={preset.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all hover:scale-[1.02] ${
                      selectedPreset === preset.id
                        ? 'border-[#F59E0B] bg-[#F59E0B]/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                    onClick={() => handlePresetSelect(preset.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          selectedPreset === preset.id ? 'bg-[#F59E0B]/20' : 'bg-white/10'
                        }`}>
                          {preset.icon}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium">{preset.name}</h4>
                            {preset.recommended && (
                              <Badge variant="secondary" className="bg-green-500/20 text-green-400 text-xs">
                                Recommended
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-white/60">{preset.description}</p>
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <div className="font-medium">{preset.format}</div>
                        <div className="text-white/60">{preset.resolution}</div>
                        <div className="text-white/60">{preset.size}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="custom" className="space-y-6">
              {/* Format Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Format</label>
                <div className="grid grid-cols-2 gap-2">
                  {formatOptions.map((format) => (
                    <div
                      key={format.value}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        customSettings.format === format.value
                          ? 'border-[#F59E0B] bg-[#F59E0B]/10'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                      onClick={() => setCustomSettings(prev => ({ ...prev, format: format.value }))}
                    >
                      <div className="font-medium text-sm">{format.label}</div>
                      <div className="text-xs text-white/60">{format.description}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Resolution */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Resolution</label>
                <div className="space-y-2">
                  {resolutionOptions.map((resolution) => (
                    <div
                      key={resolution.value}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        customSettings.resolution === resolution.value
                          ? 'border-[#F59E0B] bg-[#F59E0B]/10'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                      onClick={() => {
                        const newSettings = { ...customSettings, resolution: resolution.value }
                        setCustomSettings(newSettings)
                        updateEstimates(newSettings)
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-sm">{resolution.label}</div>
                          <div className="text-xs text-white/60">{resolution.description}</div>
                        </div>
                        {customSettings.resolution === resolution.value && (
                          <CheckCircle className="h-4 w-4 text-[#F59E0B]" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Quality Slider */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <label className="text-sm font-medium">Quality</label>
                  <span className="text-sm text-white/60">{customSettings.quality}%</span>
                </div>
                <Slider
                  value={[customSettings.quality]}
                  max={100}
                  min={10}
                  step={5}
                  className="w-full"
                  onValueChange={(value) => {
                    const newSettings = { ...customSettings, quality: value[0] }
                    setCustomSettings(newSettings)
                    updateEstimates(newSettings)
                  }}
                />
                <div className="flex justify-between text-xs text-white/60">
                  <span>Low</span>
                  <span>Medium</span>
                  <span>High</span>
                  <span>Ultra</span>
                </div>
              </div>
              
              {/* Advanced Options */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Advanced Options</h4>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Include Subtitles</label>
                    <p className="text-xs text-white/60">Add auto-generated subtitles</p>
                  </div>
                  <Switch 
                    checked={customSettings.includeSubtitles}
                    onCheckedChange={(checked) => 
                      setCustomSettings(prev => ({ ...prev, includeSubtitles: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Watermark</label>
                    <p className="text-xs text-white/60">Add AI Video Editor watermark</p>
                  </div>
                  <Switch 
                    checked={customSettings.watermark}
                    onCheckedChange={(checked) => 
                      setCustomSettings(prev => ({ ...prev, watermark: checked }))
                    }
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
        
        {!isExporting && (
          <div className="mt-6 space-y-4">
            {/* Export Summary */}
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <h4 className="font-medium mb-3">Export Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <HardDrive className="h-4 w-4 text-white/60" />
                  <span className="text-white/60">Estimated size:</span>
                  <span className="font-medium">{estimatedSize}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-white/60" />
                  <span className="text-white/60">Processing time:</span>
                  <span className="font-medium">{estimatedTime}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Settings className="h-4 w-4 text-white/60" />
                  <span className="text-white/60">Format:</span>
                  <span className="font-medium">{customSettings.format.toUpperCase()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Monitor className="h-4 w-4 text-white/60" />
                  <span className="text-white/60">Resolution:</span>
                  <span className="font-medium">{customSettings.resolution}</span>
                </div>
              </div>
            </div>
            
            {/* Export Button */}
            <Button 
              onClick={handleExport}
              className="w-full bg-[#F59E0B] hover:bg-[#F59E0B]/80 text-black font-medium py-3"
              size="lg"
            >
              <Download className="h-5 w-5 mr-2" />
              Start Export
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}