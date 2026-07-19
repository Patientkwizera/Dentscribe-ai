'use client';
import { useState, useRef } from 'react';
import { Mic, Square, RotateCcw } from 'lucide-react';

interface VoiceDictationProps {
  onTranscript: (text: string) => void;
}

export function VoiceDictation({ onTranscript }: VoiceDictationProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcript, setTranscript] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await sendToWhisper(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      let seconds = 0;
      timerRef.current = setInterval(() => {
        seconds++;
        setRecordingTime(seconds);
      }, 1000);
    } catch (err) {
      alert('Microphone access denied. Please allow microphone access in your browser settings.');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setRecordingTime(0);
  };

  const sendToWhisper = async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.webm');
    formData.append('model', 'whisper-1');

    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      const { text } = await response.json();
      setTranscript(text);
      onTranscript(text);
    } catch {
      alert('Transcription failed. Please try again.');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white border border-line rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg">Voice Dictation</h3>
        {isRecording && (
          <span className="text-coral font-mono">{formatTime(recordingTime)}</span>
        )}
      </div>

      <div className="flex justify-center gap-4">
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="w-16 h-16 rounded-full bg-coral text-white flex items-center justify-center hover:scale-105 transition"
          >
            <Mic className="w-6 h-6" />
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="w-16 h-16 rounded-full bg-ink text-white flex items-center justify-center hover:scale-105 transition animate-pulse"
          >
            <Square className="w-6 h-6" />
          </button>
        )}
      </div>

      {transcript && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-ink/60">Transcript</span>
            <button 
              onClick={() => { setTranscript(''); onTranscript(''); }}
              className="text-xs text-ink/40 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Clear
            </button>
          </div>
          <p className="text-sm text-ink bg-paper p-3 rounded-lg">{transcript}</p>
        </div>
      )}

      <p className="text-xs text-ink/40 text-center mt-4">
        {isRecording ? 'Recording... speak clearly' : 'Tap the mic to start dictating'}
      </p>
    </div>
  );
}
