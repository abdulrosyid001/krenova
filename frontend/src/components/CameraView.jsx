import { useEffect, useRef } from 'react';

export default function CameraView({ onFrame, running, setError }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    let timer;
    let stream;

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (err) {
        setError('Webcam access denied. Please allow camera permissions.');
      }
    }

    startCamera();

    const captureLoop = async () => {
      if (!running || !videoRef.current) {
        timer = setTimeout(captureLoop, 200);
        return;
      }
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!canvas || !video) {
        timer = setTimeout(captureLoop, 200);
        return;
      }
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      onFrame(dataUrl);
      timer = setTimeout(captureLoop, 200);
    };

    timer = setTimeout(captureLoop, 200);
    return () => {
      clearTimeout(timer);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [onFrame, running, setError]);

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 p-2">
      <div className="text-sm text-slate-300 mb-2">Live camera feed</div>
      <video ref={videoRef} className="w-full rounded-xl" playsInline muted autoPlay />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
