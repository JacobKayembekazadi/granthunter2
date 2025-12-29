'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Conversation } from '@elevenlabs/client';
import { ConnectionState } from '@/types';

interface UseElevenLabsOptions {
    onMessage?: (message: { role: 'user' | 'agent'; content: string }) => void;
    onError?: (error: string) => void;
}

export const useElevenLabs = (options: UseElevenLabsOptions = {}) => {
    const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
    const [volume, setVolume] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [transcript, setTranscript] = useState<string>('');

    const conversationRef = useRef<any>(null);
    const volumeIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const disconnect = useCallback(async () => {
        if (volumeIntervalRef.current) {
            clearInterval(volumeIntervalRef.current);
            volumeIntervalRef.current = null;
        }

        if (conversationRef.current) {
            try {
                await conversationRef.current.endSession();
            } catch (e) {
                console.debug('Error ending session:', e);
            }
            conversationRef.current = null;
        }

        setConnectionState(ConnectionState.DISCONNECTED);
        setVolume(0);
    }, []);

    const connect = useCallback(async () => {
        try {
            setConnectionState(ConnectionState.CONNECTING);
            setError(null);
            setTranscript('');

            // Get signed URL from our API
            const response = await fetch('/api/elevenlabs/signed-url', {
                method: 'POST',
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to get signed URL');
            }

            const { signedUrl } = await response.json();

            // Start the conversation session
            const conversation = await Conversation.startSession({
                signedUrl,
                onConnect: () => {
                    console.log('ElevenLabs Connected');
                    setConnectionState(ConnectionState.CONNECTED);
                },
                onDisconnect: () => {
                    console.log('ElevenLabs Disconnected');
                    setConnectionState(ConnectionState.DISCONNECTED);
                    setVolume(0);
                },
                onMessage: (message: { source: string; message: string }) => {
                    console.log('ElevenLabs Message:', message);

                    // Update transcript
                    const role = message.source === 'user' ? 'user' : 'agent';
                    setTranscript(prev => prev + `\n${role}: ${message.message}`);

                    // Call optional callback
                    options.onMessage?.({
                        role: role as 'user' | 'agent',
                        content: message.message
                    });
                },
                onError: (errorMessage: string, context?: any) => {
                    console.error('ElevenLabs Error:', errorMessage, context);
                    setError(errorMessage || 'Unknown error');
                    setConnectionState(ConnectionState.ERROR);
                    options.onError?.(errorMessage);
                },
                onModeChange: (mode: { mode: string }) => {
                    console.log('ElevenLabs Mode Change:', mode);
                    // Visual feedback for speaking/listening
                    if (mode.mode === 'speaking') {
                        setVolume(0.7);
                    } else if (mode.mode === 'listening') {
                        setVolume(0.3);
                    }
                },
            });

            conversationRef.current = conversation;

            // Volume visualization (simulate based on mode)
            volumeIntervalRef.current = setInterval(async () => {
                if (conversationRef.current) {
                    try {
                        const inputVol = await conversationRef.current.getInputVolume();
                        const outputVol = await conversationRef.current.getOutputVolume();
                        setVolume(Math.max(inputVol, outputVol));
                    } catch {
                        // Ignore volume errors
                    }
                }
            }, 100);

        } catch (err) {
            console.error('ElevenLabs Connection failed:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to connect';
            setError(errorMessage);
            setConnectionState(ConnectionState.ERROR);
            options.onError?.(errorMessage);
            disconnect();
        }
    }, [disconnect, options]);

    const toggleMute = useCallback(() => {
        if (conversationRef.current) {
            const newMuted = !isMuted;
            setIsMuted(newMuted);
            if (newMuted) {
                conversationRef.current.setVolume({ volume: 0 });
            } else {
                conversationRef.current.setVolume({ volume: 1 });
            }
        }
    }, [isMuted]);

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
        setIsMuted: toggleMute,
        error,
        transcript,
    };
};
