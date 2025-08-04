import React, {useEffect, useState, useRef} from 'react';

  const FaceVerification = ({ onSubmit, onRetake }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [stream, setStream] = useState(null);
  const [countdown, setCountdown] = useState(5);
  const [phase, setPhase] = useState('timer');
  const [capturedImage, setCapturedImage] = useState(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 640 },
          facingMode: 'user'
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsCameraActive(true);
        setHasPermission(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasPermission(false);
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageData);
        setPhase('preview');
        stopCamera();
      }
    }
  };

  const handleSubmit = () => {
    if (capturedImage && onSubmit) {
      onSubmit(capturedImage);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setPhase('timer');
    setCountdown(5);
    startCamera();
    if (onRetake) {
      onRetake();
    }
  };

  useEffect(() => {
    startCamera();
    
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (phase === 'timer' && countdown > 0 && isCameraActive) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (phase === 'timer' && countdown === 0) {
      setPhase('ready');
      setTimeout(() => setPhase('capture'), 1000);
    }
  }, [countdown, phase, isCameraActive]);
  return (
  <div className='face-verification-container'>
    <div className='verification-card'>
      <h1>Take a Selfie for</h1>
      <h2>Selfie Verification</h2>
      <div className="camera-container">
        navigator.media
      </div>
    </div>

  </div>

  );
}