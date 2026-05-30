import React, { useState, useEffect, useRef, useCallback } from 'react'
import ReactPlayer from 'react-player'
import { Skeleton } from '@/components/ui/skeleton'
import { VideoBookmarks } from './VideoBookmarks'

const Player = ReactPlayer as any;

interface VideoPlayerProps {
  url: string
  initialSeconds: number
  onProgress: (seconds: number) => void
  onEnded: () => void
  lessonId?: string
}

function isDirectFileUrl(url: string): boolean {
  return /\.(mp4|webm|ogg|mov|avi|mkv)(\?.*)?$/i.test(url) || url.includes('supabase.co/storage');
}

export function VideoPlayer({ url, initialSeconds, onProgress, onEnded, lessonId }: VideoPlayerProps) {
  const [isReady, setIsReady] = useState(false)
  const [hasError, setHasError] = useState(false)
  const playerRef = useRef<any>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playbackRate, setPlaybackRate] = useState<number>(() => {
    const saved = localStorage.getItem('eduflow-playback-speed')
    return saved ? parseFloat(saved) : 1
  })
  const [currentTime, setCurrentTime] = useState(0)

  useEffect(() => {
    localStorage.setItem('eduflow-playback-speed', playbackRate.toString())
  }, [playbackRate])

  useEffect(() => {
    setHasError(false)
    setIsReady(false)
  }, [url])

  const handleReady = () => {
    setIsReady(true)
    if (initialSeconds > 0) {
      if (playerRef.current) {
        playerRef.current.seekTo(initialSeconds, 'seconds')
      } else if (videoRef.current) {
        videoRef.current.currentTime = initialSeconds
      }
    }
  }

  const handleSeek = useCallback((seconds: number) => {
    if (playerRef.current) {
      playerRef.current.seekTo(seconds, 'seconds')
    } else if (videoRef.current) {
      videoRef.current.currentTime = seconds
    }
  }, [])

  const handleNativeTimeUpdate = () => {
    if (videoRef.current) {
      const t = videoRef.current.currentTime
      setCurrentTime(t)
      onProgress(t)
    }
  }

  const handleNativeEnded = () => {
    onEnded()
  }

  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2]

  if (isDirectFileUrl(url) || hasError) {
    return (
      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden flex flex-col group">
        {!isReady && <Skeleton className="absolute inset-0 z-10" />}
        <video
          ref={videoRef}
          src={url}
          className="w-full h-full"
          controls
          playsInline
          onCanPlay={handleReady}
          onTimeUpdate={handleNativeTimeUpdate}
          onEnded={handleNativeEnded}
          onError={() => setHasError(true)}
        />
        <div className="absolute bottom-2 left-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <select
            className="bg-black/70 text-white text-xs px-1 py-0.5 rounded"
            value={playbackRate}
            onChange={(e) => {
              const rate = parseFloat(e.target.value)
              setPlaybackRate(rate)
              if (videoRef.current) videoRef.current.playbackRate = rate
            }}
          >
            {speeds.map((s) => (
              <option key={s} value={s}>{s}x</option>
            ))}
          </select>
          {lessonId && (
            <VideoBookmarks lessonId={lessonId} currentTime={currentTime} onSeek={handleSeek} />
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden flex flex-col group">
      {!isReady && <Skeleton className="absolute inset-0 z-10" />}
      {/* @ts-ignore - ReactPlayer types clash with React 18 in some versions */}
      <Player
        ref={playerRef as any}
        url={url}
        width="100%"
        height="100%"
        controls={true}
        muted={true}
        playing={true}
        playbackRate={playbackRate}
        onReady={handleReady}
        onError={() => setHasError(true)}
        onProgress={({ playedSeconds }: any) => {
          setCurrentTime(playedSeconds)
          onProgress(playedSeconds)
        }}
        onEnded={onEnded}
        config={{
          file: {
            attributes: {
              controlsList: 'nodownload',
            },
          },
        }}
      />
      <div className="absolute bottom-2 left-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <select
          className="bg-black/70 text-white text-xs px-1 py-0.5 rounded"
          value={playbackRate}
          onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
        >
          {speeds.map((s) => (
            <option key={s} value={s}>{s}x</option>
          ))}
        </select>
        {lessonId && (
          <VideoBookmarks lessonId={lessonId} currentTime={currentTime} onSeek={handleSeek} />
        )}
      </div>
    </div>
  )
}
