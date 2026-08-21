'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
}

export default function CameraCapture({ onCapture }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [isFrontCamera, setIsFrontCamera] = useState(false);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check available video devices
  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        const videoInputs = devices.filter((d) => d.kind === 'videoinput');
        setHasMultipleCameras(videoInputs.length > 1);
      }).catch(() => {});
    }
  }, []);

  const startCamera = useCallback(async () => {
    setIsLoading(true);
    setError('');

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Live camera streaming is not supported on this browser or insecure connection (requires HTTPS). You can still take a photo directly below.');
      setIsLoading(false);
      return;
    }

    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      let newStream: MediaStream;
      try {
        newStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: isFrontCamera ? 'user' : { ideal: 'environment' },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });
      } catch (constraintErr) {
        // Fallback to basic video constraint if strict resolution/facingMode fails
        newStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        await videoRef.current.play().catch(() => {});
      }
      setStream(newStream);
      setError('');
    } catch (err: any) {
      console.error('Camera access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Camera permission was denied. Please allow camera access in your browser settings or use the button below to take a photo or select an image.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('No camera found on this device. You can still select an image file directly.');
      } else {
        setError('Could not start live camera viewfinder. You can still take a photo or select an image directly below.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [isFrontCamera]);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isFrontCamera]);

  const captureImage = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], `scan_${Date.now()}.jpg`, { type: 'image/jpeg' });
          if (stream) {
            stream.getTracks().forEach((track) => track.stop());
          }
          onCapture(file);
        }
      },
      'image/jpeg',
      0.92
    );
  };

  const handleNativeCameraFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      onCapture(file);
    }
  };

  // Determine button text based on error
  const isNoCamera = error.includes('No camera');
  const fallbackIcon = isNoCamera ? '📁' : '📸';
  const fallbackText = isNoCamera ? 'Select Image File' : 'Open Camera / Select Image';

  return (
    <div className="relative flex flex-col items-center w-full max-w-md mx-auto">
      {/* Native camera file input (fallback / quick access) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture={isNoCamera ? undefined : "environment"}
        className="hidden"
        onChange={handleNativeCameraFile}
      />

      {error ? (
        <div className="w-full p-6 bg-white rounded-2xl border border-gray-100 shadow-sm text-center space-y-4">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center text-3xl mx-auto">
            {isNoCamera ? '💻' : '📷'}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Camera Access</h3>
            <p className="text-sm text-gray-500">{error}</p>
          </div>
          
          <div className="pt-2 space-y-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-green-500 text-white font-semibold py-3 px-4 rounded-xl hover:bg-green-600 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <span>{fallbackIcon}</span> {fallbackText}
            </button>
            {!isNoCamera && (
              <button
                type="button"
                onClick={startCamera}
                className="w-full bg-gray-100 text-gray-700 font-medium py-2.5 px-4 rounded-xl hover:bg-gray-200 transition-colors text-sm"
              >
                Retry Live Viewfinder
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="relative w-full aspect-[3/4] bg-black rounded-2xl overflow-hidden shadow-lg">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white text-sm">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 border-3 border-green-400 border-t-transparent rounded-full animate-spin"></div>
                  <span>Starting camera...</span>
                </div>
              </div>
            )}
            
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* Target reticle */}
            <div className="absolute inset-8 border-2 border-white/40 rounded-xl pointer-events-none flex items-center justify-center">
              <span className="text-white/70 text-xs bg-black/40 px-2 py-1 rounded-md backdrop-blur-xs">
                Position fruit in frame
              </span>
            </div>

            {hasMultipleCameras && (
              <button
                type="button"
                onClick={() => setIsFrontCamera(!isFrontCamera)}
                className="absolute top-4 right-4 p-3 bg-black/50 text-white rounded-full backdrop-blur-sm hover:bg-black/70 transition-colors z-10"
                aria-label="Switch camera"
              >
                🔄
              </button>
            )}
          </div>

          <div className="mt-6 flex items-center justify-center gap-4 w-full">
            <button
              type="button"
              onClick={captureImage}
              className="w-20 h-20 bg-green-500 rounded-full border-4 border-white shadow-xl hover:bg-green-600 active:scale-95 transition-all flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-green-500/50"
              aria-label="Take photo"
            >
              <div className="w-16 h-16 rounded-full border-2 border-white/60" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-4 text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Use system camera app instead
          </button>
        </>
      )}
    </div>
  );
}
