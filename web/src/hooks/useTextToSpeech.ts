import { useCallback, useRef, useState } from 'react'

interface TTSState {
  speaking: boolean
  paused: boolean
  rate: number
}

export function useTextToSpeech() {
  const [state, setState] = useState<TTSState>({ speaking: false, paused: false, rate: 1 })
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  const speak = useCallback((text: string, rate: number = 1) => {
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = rate
    utterance.lang = 'en-US'
    utterance.onstart = () => setState({ speaking: true, paused: false, rate })
    utterance.onend = () => setState({ speaking: false, paused: false, rate })
    utterance.onpause = () => setState(s => ({ ...s, paused: true }))
    utterance.onresume = () => setState(s => ({ ...s, paused: false }))
    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }, [])

  const pause = useCallback(() => {
    window.speechSynthesis.pause()
  }, [])

  const resume = useCallback(() => {
    window.speechSynthesis.resume()
  }, [])

  const stop = useCallback(() => {
    window.speechSynthesis.cancel()
    setState({ speaking: false, paused: false, rate: 1 })
  }, [])

  const setRate = useCallback((rate: number) => {
    if (utteranceRef.current) {
      utteranceRef.current.rate = rate
    }
    setState(s => ({ ...s, rate }))
  }, [])

  return { ...state, speak, pause, resume, stop, setRate }
}
