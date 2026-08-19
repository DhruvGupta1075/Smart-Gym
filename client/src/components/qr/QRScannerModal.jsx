import React, { useState, useEffect, useRef } from 'react';
import { useGym } from '../../context/GymContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import confetti from 'canvas-confetti';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, KeyRound, CheckCircle2, AlertCircle, Sparkles, Flame, Loader2 } from 'lucide-react';
import Modal from '../common/Modal';

const QRScannerModal = () => {
  const { isScannerOpen, setIsScannerOpen, showToast } = useGym();
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('camera'); // 'camera' | 'manual'
  const [manualCode, setManualCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkInResult, setCheckInResult] = useState(null);
  const [scannerError, setScannerError] = useState(null);
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    if (isScannerOpen && activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isScannerOpen, activeTab]);

  const startCamera = async () => {
    setScannerError(null);
    try {
      // Delay slightly for modal DOM mount
      setTimeout(async () => {
        const readerElement = document.getElementById('qr-reader');
        if (!readerElement) return;

        if (html5QrCodeRef.current) {
          try {
            await html5QrCodeRef.current.stop();
          } catch (e) {}
        }

        const qrScanner = new Html5Qrcode('qr-reader');
        html5QrCodeRef.current = qrScanner;

        const config = { fps: 10, qrbox: { width: 220, height: 220 } };

        await qrScanner.start(
          { facingMode: 'environment' },
          config,
          (decodedText) => {
            handleCheckInSubmit(decodedText, 'QR_SCAN');
            stopCamera();
          },
          (errorMessage) => {
            // Ignore frame-by-frame decoding misses
          }
        );
      }, 300);
    } catch (err) {
      console.warn('Camera initiation note:', err);
      setScannerError('Camera access not detected or permission denied. You can switch to the "Manual Code" tab below!');
    }
  };

  const stopCamera = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        html5QrCodeRef.current.clear();
      } catch (e) {
        console.warn('Stop camera error', e);
      }
      html5QrCodeRef.current = null;
    }
  };

  const fireCelebration = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#06B6D4', '#10B981', '#F59E0B', '#3B82F6'],
      });
    } catch (e) {}
  };

  const handleCheckInSubmit = async (tokenString, method = 'QR_SCAN') => {
    if (!tokenString || tokenString.trim() === '') {
      showToast('Please enter a check-in code', 'error');
      return;
    }

    setIsProcessing(true);
    try {
      const { data } = await api.post('/api/attendance/check-in', {
        qrToken: tokenString.trim(),
        method,
      });

      if (data.success) {
        setCheckInResult(data);
        fireCelebration();
        showToast(data.message, 'success');
        refreshUser();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Check-in failed';
      showToast(msg, 'error');
      setCheckInResult({ error: true, message: msg });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    stopCamera();
    setCheckInResult(null);
    setManualCode('');
    setIsScannerOpen(false);
  };

  return (
    <Modal
      isOpen={isScannerOpen}
      onClose={handleClose}
      title="Gym Self Check-In"
      maxWidth="max-w-lg"
    >
      {checkInResult ? (
        <div className="text-center py-6 space-y-5 animate-fade-in">
          {checkInResult.error ? (
            <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-3">
              <div className="w-14 h-14 rounded-full bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-rose-300">Check-In Status</h4>
              <p className="text-xs text-slate-300">{checkInResult.message}</p>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3 glow-emerald">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-emerald-300">Attendance Logged!</h4>
              <p className="text-xs text-slate-300">{checkInResult.message}</p>
              
              <div className="pt-3 flex items-center justify-center gap-2 text-amber-400 font-bold text-sm bg-slate-900/80 py-2 px-4 rounded-xl border border-slate-800">
                <Flame className="w-4 h-4 fill-amber-400" />
                <span>Current Streak: {checkInResult.streakDays || 1} Days Active!</span>
              </div>
            </div>
          )}

          <div className="pt-2 flex justify-center">
            <button
              onClick={handleClose}
              className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition"
            >
              Done & Return to Portal
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Tabs */}
          <div className="flex rounded-xl bg-slate-900/90 p-1 border border-slate-800">
            <button
              onClick={() => setActiveTab('camera')}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition ${
                activeTab === 'camera'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Camera Scan</span>
            </button>
            <button
              onClick={() => {
                stopCamera();
                setActiveTab('manual');
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition ${
                activeTab === 'manual'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>Manual Daily Code</span>
            </button>
          </div>

          {/* Camera Scan View */}
          {activeTab === 'camera' && (
            <div className="space-y-3">
              <div className="relative w-full rounded-2xl bg-[#06070B] border border-slate-800 overflow-hidden flex flex-col items-center justify-center min-h-[260px]">
                <div id="qr-reader" className="w-full" />

                {scannerError && (
                  <div className="p-4 text-center space-y-2">
                    <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
                    <p className="text-xs text-slate-300">{scannerError}</p>
                    <button
                      onClick={() => setActiveTab('manual')}
                      className="text-xs text-cyan-400 underline font-semibold mt-2 inline-block"
                    >
                      Click here to enter token manually
                    </button>
                  </div>
                )}
              </div>
              <p className="text-[11px] text-center text-slate-500">
                Point your device camera at the gym counter screen to verify presence.
              </p>
            </div>
          )}

          {/* Manual Code Input View */}
          {activeTab === 'manual' && (
            <div className="space-y-4 py-3">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">
                  Enter Check-in Token or Scanned String
                </label>
                <input
                  type="text"
                  placeholder="e.g. SMARTGYM-2026-08-16-X79K92"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#06070B] border border-slate-700 text-slate-100 placeholder-slate-600 text-xs font-mono focus:outline-none focus:border-cyan-400 transition"
                />
                <p className="text-[11px] text-slate-500">
                  Tip: Copy or check today's token from the Admin Kiosk / Reception display.
                </p>
              </div>

              <button
                onClick={() => handleCheckInSubmit(manualCode, 'MANUAL_CODE')}
                disabled={isProcessing || !manualCode.trim()}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:opacity-50 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Session...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Confirm Check-In</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default QRScannerModal;
