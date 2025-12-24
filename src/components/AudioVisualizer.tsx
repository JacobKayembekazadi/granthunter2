import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  isActive: boolean;
  volume: number; // 0 to 1 ideally
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ isActive, volume }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const draw = () => {
      time += 0.1;
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      if (!isActive) {
        // Flatline
        ctx.beginPath();
        ctx.strokeStyle = '#334155'; // slate-700
        ctx.lineWidth = 2;
        ctx.moveTo(0, centerY);
        ctx.lineTo(width, centerY);
        ctx.stroke();
        return;
      }

      // Draw Waveform
      ctx.beginPath();
      // Color depends on volume/intensity
      const intensity = Math.min(volume * 2, 1);
      ctx.strokeStyle = `rgba(59, 130, 246, ${0.5 + intensity * 0.5})`; // Blue
      ctx.lineWidth = 2 + intensity * 3;

      for (let x = 0; x < width; x += 2) {
        // Create a wave effect that reacts to volume
        const frequency = 0.05;
        const amplitude = (height / 4) * (0.2 + volume * 2.0); // Base amplitude + volume
        
        // Combine sine waves for organic feel
        const y = centerY + 
          Math.sin(x * frequency + time) * amplitude * Math.sin(x * 0.01 + time * 0.5) +
          Math.sin(x * frequency * 2 - time) * (amplitude * 0.5);

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Mirror reflection for "holographic" feel
      ctx.beginPath();
      ctx.strokeStyle = `rgba(59, 130, 246, 0.1)`;
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 4) {
         const amplitude = (height / 4) * (0.2 + volume * 2.0); 
         const y = centerY - (
            Math.sin(x * 0.05 + time) * amplitude * Math.sin(x * 0.01 + time * 0.5) +
            Math.sin(x * 0.05 * 2 - time) * (amplitude * 0.5)
         );
         if (x === 0) ctx.moveTo(x, y);
         else ctx.lineTo(x, y);
      }
      ctx.stroke();

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isActive, volume]);

  return (
    <div className="relative w-full h-32 bg-slate-900/50 rounded-lg overflow-hidden border border-slate-700 shadow-inner">
      <div className="absolute top-2 left-2 text-xs font-mono text-slate-500 uppercase tracking-wider">
        Audio Input/Output
      </div>
      <canvas 
        ref={canvasRef} 
        width={400} 
        height={128} 
        className="w-full h-full"
      />
      {/* Grid Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(59,130,246,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.3)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
    </div>
  );
};

export default AudioVisualizer;