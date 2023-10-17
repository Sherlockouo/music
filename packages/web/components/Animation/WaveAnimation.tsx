import React, { useEffect, useRef } from 'react';
import { Howl } from 'howler';
import player from '@/web/states/player';

interface AudioVisualizationProps {
}

const AudioVisualization: React.FC<AudioVisualizationProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const analyser = Howler.ctx.createAnalyser();

    (window as any).howler.on('play', () => {
      const source = Howler.ctx.createMediaElementSource((window as any).howler._sounds[0]._node);
      source.connect(analyser);
      analyser.connect(Howler.ctx.destination);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const draw = () => {
        requestAnimationFrame(draw);

        analyser.getByteFrequencyData(dataArray);

        ctx!.clearRect(0, 0, canvas.width, canvas.height);

        const barWidth = canvas.width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = dataArray[i];
          ctx!.fillStyle = `rgb(${barHeight}, 0, 0)`;
          ctx!.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
          x += barWidth + 1;
        }
      };

      draw();
    });

    return () => {
      // player.stop();
    };
  }, [player]);

  const playAudio = () => {
    player.play();
  };

  const pauseAudio = () => {
    player.pause();
  };

  return (
    <>
      <canvas ref={canvasRef}></canvas>
      <button onClick={playAudio}>Play</button>
      <button onClick={pauseAudio}>Pause</button>
    </>
  );
};

export default AudioVisualization;