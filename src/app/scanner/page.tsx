'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, RotateCcw, Zap, ShoppingBag, AlertCircle, CheckCircle, Scan } from 'lucide-react';
import QrCode from 'jsqr';
import { GET, POST } from '../../services/api'
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '@/lib/features/authSlice';
export default function JsQrScannerPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [result, setResult] = useState<string | null>(null);
  const dispatch = useDispatch();
  const router = useRouter();
  // const generateToken = async () => {
  //   try {
  //     const data = await GET('/token/generate-token');
  //     console.log('Token Response:', data);
  //   } catch (err) {
  //     console.error('Error fetching token:', err);
  //   }
  // };
  const handleScanResult = async (scannedText: string) => {
    dispatch(loginStart());
    setResult(scannedText);
    console.log('Scanned Text:', scannedText);
    if(scannedText.startsWith('SLIP-START')) {
      const parts = scannedText.split(' ');
      if(parts.length > 2) return;
      const shopId = parts[1];
      try {
        const data = await POST(`/customer/scanner/start`, { shopId });

        console.log('Start Slip Response:', data);
        if(data.success === true) {
          dispatch(loginSuccess({
            token: data.data.newCustomer.token,
            user: data.data.newCustomer
          }))
          router.push(`/customer/menu`);
        }
        else {
          dispatch(loginFailure({
            error: 'Invalid credentials: Please Scan QR code again!'
          }))
        }
      }
      catch (err) {
        console.error("❌ Failed to generate token", err);
        alert("Error generating slip");
      }
    }
  }
  useEffect(() => {
    let streaming = false;
    let animationFrameId: number;

    const scan = () => {
      if (
        videoRef.current &&
        canvasRef.current &&
        videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA
      ) {
        const context = canvasRef.current.getContext('2d');
        if (context) {
          canvasRef.current.height = videoRef.current.videoHeight;
          canvasRef.current.width = videoRef.current.videoWidth;
          context.drawImage(
            videoRef.current,
            0,
            0,
            canvasRef.current.width,
            canvasRef.current.height
          );

          const imageData = context.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);

          // ✅ Correct usage of QrCode.decode()
          const code = QrCode(imageData.data, imageData.width, imageData.height);

          if (code) {
            // const scannedText = code.data;
            // console.log(scannedText)
            // setResult(scannedText);

            // Only generate token if it's SLIP-START
            // if (scannedText === 'SLIP-START') {
            //   generateToken();
            // }
            handleScanResult(code.data);
            cancelAnimationFrame(animationFrameId);
            return;
          }
        }
      }

      animationFrameId = requestAnimationFrame(scan);
    };

    // Start camera stream
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' } })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          streaming = true;
          scan();
        }
      })
      .catch((err) => {
        console.error('Camera access denied:', err);
        setResult('Error: Camera not available');
      });

    return () => {
      cancelAnimationFrame(animationFrameId);
      streaming = false;
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="p-4 max-w-lg mx-auto text-center">
      <h1 className="text-2xl font-bold mb-4">📱 jsQR Scanner</h1>
      <p className="mb-4">Scan a QR Code to Generate Slip or Add Item</p>

      {/* Video Feed */}
      <div className="relative w-full max-w-md mx-auto">
        <video ref={videoRef} className="w-full rounded shadow" autoPlay muted />
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Result Display */}
      {result && (
        <div className="mt-6 p-3 bg-green-100 text-green-700 rounded">
          <p>✅ Scanned: <strong>{result}</strong></p>
        </div>
      )}

      {/* Instructions */}
      {!result && (
        <p className="mt-4 text-sm text-gray-500">Align QR code inside the frame</p>
      )}

      {/* Restart Button */}
      <button
        onClick={() => window.location.reload()}
        className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
      >
        Restart Scanner
      </button>
    </div>
  );
}