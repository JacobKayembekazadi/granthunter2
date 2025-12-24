import { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { createBlob, decode, decodeAudioData } from '../lib/audio-utils';
import { ConnectionState } from '../types';

export const useGeminiLive = () => {
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
  const [volume, setVolume] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Audio Contexts
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  
  // Nodes & State
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const outputNodeRef = useRef<GainNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const disconnect = useCallback(async () => {
    // Stop all playing audio
    activeSourcesRef.current.forEach(source => {
      try { source.stop(); } catch (e) {}
    });
    activeSourcesRef.current.clear();

    // Close contexts
    if (inputAudioContextRef.current?.state !== 'closed') {
      await inputAudioContextRef.current?.close();
    }
    if (outputAudioContextRef.current?.state !== 'closed') {
      await outputAudioContextRef.current?.close();
    }

    // Stop tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    setConnectionState(ConnectionState.DISCONNECTED);
    setVolume(0);
  }, []);

  const connect = useCallback(async () => {
    try {
      setConnectionState(ConnectionState.CONNECTING);
      setError(null);

      // 1. Setup Audio Contexts
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const inputCtx = new AudioContextClass({ sampleRate: 16000 });
      const outputCtx = new AudioContextClass({ sampleRate: 24000 });
      
      inputAudioContextRef.current = inputCtx;
      outputAudioContextRef.current = outputCtx;

      const outputGain = outputCtx.createGain();
      outputNodeRef.current = outputGain;
      outputGain.connect(outputCtx.destination);

      // 2. Get Microphone Access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // 3. Initialize Gemini Client
      const apiKey = process.env.API_KEY;
      if (!apiKey) {
        throw new Error("API Key not found in environment variables");
      }

      const ai = new GoogleGenAI({ apiKey });

      // 4. Connect to Live API
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: `You are 'The Navigator', an advanced AI voice assistant for GrantHunter. 
          Your mission is to help government contractors qualify opportunities and identify risks in proposals.
          You are professional, concise, tactical, and highly intelligent. 
          Speak quickly and efficiently. Do not waste words.
          You have access to the context of the user's current proposal documents.`,
        },
        callbacks: {
          onopen: () => {
            console.log('Gemini Live Connection Opened');
            setConnectionState(ConnectionState.CONNECTED);
            
            // Start Audio Streaming
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              if (isMuted) return; // Simple software mute

              const inputData = e.inputBuffer.getChannelData(0);
              
              // Visualizer data
              let sum = 0;
              for(let i=0; i<inputData.length; i++) sum += inputData[i] * inputData[i];
              const rms = Math.sqrt(sum / inputData.length);
              setVolume(Math.min(1, rms * 10)); // Scale for visual

              const pcmBlob = createBlob(inputData);
              
              // Send to Gemini
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
            
            inputSourceRef.current = source;
            processorRef.current = scriptProcessor;
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Audio Output
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            
            if (base64Audio && outputCtx) {
              try {
                 // Ensure gapless playback
                nextStartTimeRef.current = Math.max(
                    nextStartTimeRef.current,
                    outputCtx.currentTime
                );

                const audioBuffer = await decodeAudioData(
                  decode(base64Audio),
                  outputCtx,
                  24000,
                  1
                );

                const source = outputCtx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(outputGain);
                
                source.addEventListener('ended', () => {
                  activeSourcesRef.current.delete(source);
                });

                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
                activeSourcesRef.current.add(source);

                // Simulate visualizer for output
                setVolume(0.5); 
                setTimeout(() => setVolume(0), audioBuffer.duration * 1000);

              } catch (err) {
                console.error("Audio decoding error", err);
              }
            }

            // Handle Interruption
            if (message.serverContent?.interrupted) {
              console.log("Model interrupted");
              activeSourcesRef.current.forEach(src => {
                try { src.stop(); } catch(e){}
              });
              activeSourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
            
            if (message.serverContent?.turnComplete) {
                // setVolume(0); // Optional reset
            }
          },
          onclose: () => {
            console.log("Gemini Live Disconnected");
            setConnectionState(ConnectionState.DISCONNECTED);
          },
          onerror: (err) => {
            console.error("Gemini Live Error", err);
            setError(err instanceof Error ? err.message : "Unknown error");
            setConnectionState(ConnectionState.ERROR);
            disconnect();
          }
        }
      });

      sessionPromiseRef.current = sessionPromise;

    } catch (err) {
      console.error("Connection failed", err);
      setError(err instanceof Error ? err.message : "Failed to connect");
      setConnectionState(ConnectionState.ERROR);
      disconnect();
    }
  }, [disconnect, isMuted]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    connect,
    disconnect,
    connectionState,
    volume,
    isMuted,
    setIsMuted,
    error
  };
};