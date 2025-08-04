import React, { useRef, useEffect, useState } from 'react';
import { Camera, CameraOff } from 'lucide-react';
import './FaceVerification.css';

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
    <div className="face-verification-container">
      <div className="verification-card">
        <h1 className="title">
          Take a Selfie for
        </h1>
        <h2 className="subtitle">
          Face Verification
        </h2>
        
        <div className="camera-container">
          <div className={`camera-frame ${isCameraActive ? 'active' : 'inactive'}`}>
            {hasPermission === false ? (
              <div className="camera-permission-denied">
                <div className="permission-content">
                  <CameraOff className="camera-icon" />
                  <p className="permission-text">Camera access denied</p>
                  <button 
                    onClick={startCamera} 
                    className="retry-button"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : (
              <>
                {phase === 'preview' && capturedImage ? (
                  <img 
                    src={capturedImage} 
                    alt="Captured selfie" 
                    className="captured-image"
                  />
                ) : (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="camera-video"
                  />
                )}
                
                {!isCameraActive && phase !== 'preview' && (
                  <div className="camera-loading">
                    <div className="loading-content">
                      <Camera className="loading-icon" />
                      <p className="loading-text">Starting camera...</p>
                    </div>
                  </div>
                )}
                
                {phase === 'timer' && isCameraActive && (
                  <div className="countdown-overlay">
                    <div className="countdown-content">
                      <div className="countdown-number">{countdown}</div>
                      <p className="countdown-text">Get ready...</p>
                    </div>
                  </div>
                )}
                
                {phase === 'ready' && (
                  <div className="ready-overlay">
                    <div className="ready-content">
                      <div className="ready-text">READY!</div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          
          <div className={`camera-status-indicator ${isCameraActive ? 'active' : 'inactive'}`} />
        </div>

        <div className="button-container">
          {phase === 'capture' && (
            <button
              onClick={captureImage}
              disabled={!isCameraActive}
              className="verification-button capture"
            >
              Capture
            </button>
          )}
          
          {phase === 'preview' && (
            <>
              <button
                onClick={handleRetake}
                className="verification-button retake"
              >
                Retake
              </button>
              
              <button
                onClick={handleSubmit}
                className="verification-button submit"
              >
                Submit
              </button>
            </>
          )}
        </div>
        
        <canvas
          ref={canvasRef}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default FaceVerification;