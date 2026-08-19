import React, { useState, useEffect } from 'react';
import { useGym } from '../../context/GymContext';
import api from '../../utils/api';
import { QrCode, RefreshCw, Copy, Check, ShieldCheck, MapPin, Sparkles } from 'lucide-react';
import Modal from '../common/Modal';

const QRKioskModal = () => {
  const { isKioskOpen, setIsKioskOpen, showToast } = useGym();
  const [qrSession, setQrSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isKioskOpen) {
      fetchActiveQR();
    }
  }, [isKioskOpen]);

  const fetchActiveQR = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/admin/active-qr');
      if (data.success) {
        setQrSession(data.qrSession);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to fetch QR session', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateQR = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/api/admin/generate-qr', {
        location: qrSession?.location || 'Main Gym Entrance Kiosk',
      });
      if (data.success) {
        setQrSession(data.qrSession);
        showToast('Fresh daily QR Code generated successfully!', 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to generate QR', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToken = () => {
    if (qrSession?.token) {
      navigator.clipboard.writeText(qrSession.token);
      setCopied(true);
      showToast('Check-in token copied to clipboard!', 'info');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Modal
      isOpen={isKioskOpen}
      onClose={() => setIsKioskOpen(false)}
      title="Daily Gym Self Check-In Kiosk"
      maxWidth="max-w-xl"
    >
      <div className="text-center space-y-6 py-2">
        <div className="flex items-center justify-center gap-2 text-xs text-slate-400 bg-slate-900/90 py-2 px-4 rounded-xl border border-slate-800">
          <MapPin className="w-4 h-4 text-cyan-400" />
          <span>Location: <strong className="text-slate-200">{qrSession?.location || 'Main Entrance'}</strong></span>
          <span className="text-slate-600">|</span>
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Signed Cryptographic Token</span>
        </div>

        {/* QR Code Presentation Box */}
        <div className="relative mx-auto w-72 h-72 rounded-3xl p-4 bg-[#06070B] border-2 border-cyan-500/40 glow-cyan flex items-center justify-center">
          {loading ? (
            <div className="flex flex-col items-center gap-2 text-cyan-400">
              <RefreshCw className="w-8 h-8 animate-spin" />
              <span className="text-xs font-mono">Generating Key...</span>
            </div>
          ) : qrSession?.qrDataUrl ? (
            <img
              src={qrSession.qrDataUrl}
              alt="Daily Gym Check-In QR"
              className="w-full h-full object-contain rounded-2xl"
            />
          ) : (
            <div className="text-xs text-slate-500">No active QR found. Click below to generate.</div>
          )}
        </div>

        {/* Manual Token Fallback */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
            Today's Manual Check-In Code (For members without camera)
          </p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-base font-mono font-bold tracking-widest text-cyan-400 bg-[#06070B] px-4 py-1.5 rounded-lg border border-cyan-900/50">
              {qrSession?.token || 'SMARTGYM-TODAY'}
            </span>
            <button
              onClick={handleCopyToken}
              className="p-2 rounded-lg bg-[#18170F] hover:bg-slate-700 text-slate-300 transition"
              title="Copy Token"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            onClick={handleRegenerateQR}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#18170F] hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Regenerate Daily Key</span>
          </button>

          <button
            onClick={() => setIsKioskOpen(false)}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition shadow-md shadow-cyan-500/20"
          >
            Close Kiosk
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default QRKioskModal;
