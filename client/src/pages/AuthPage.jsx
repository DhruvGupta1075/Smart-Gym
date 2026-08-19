import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Dumbbell,
  ShieldCheck,
  User as UserIcon,
  Lock,
  Mail,
  AlertCircle,
  CheckCircle2,
  Zap,
  Flame,
  Award,
  ArrowLeft,
  KeyRound,
  Eye,
  EyeOff,
} from 'lucide-react';
import Logo from '../components/common/Logo';

const AuthPage = () => {
  const { login, register, quickLogin, authError, checkWhitelist } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isFlipped, setIsFlipped] = useState(location.pathname === '/register');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [whitelistStatus, setWhitelistStatus] = useState(null);
  const [showDemoLogins, setShowDemoLogins] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [showRegPw, setShowRegPw] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'member',
    phone: '',
    membershipPlan: 'Silver Monthly',
    fitnessGoals: 'Build lean muscle mass and improve strength',
  });

  useEffect(() => {
    if (location.pathname === '/register') setIsFlipped(true);
    else if (location.pathname === '/login') setIsFlipped(false);
  }, [location.pathname]);

  const toggleFlip = (target) => {
    setIsFlipped(target);
    window.history.replaceState(null, '', target ? '/register' : '/login');
  };

  const handleRoleChange = async (newRole) => {
    setFormData({ ...formData, role: newRole });
    if (newRole === 'member') {
      setWhitelistStatus(null);
    } else if (formData.email) {
      const res = await checkWhitelist(formData.email, newRole);
      setWhitelistStatus(res);
    }
  };

  const handleEmailBlur = async () => {
    if (formData.role !== 'member' && formData.email) {
      const res = await checkWhitelist(formData.email, formData.role);
      setWhitelistStatus(res);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(formData.email, formData.password);
      if (res?.success) navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await register(formData);
      if (res?.success) navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (roleKey) => {
    setLoading(true);
    const res = await quickLogin(roleKey);
    setLoading(false);
    if (res?.success) navigate('/dashboard');
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center px-4 py-8 relative font-sans selection:bg-gym-red/40 selection:text-slate-100 overflow-hidden"
      style={{ background: '#0D0C08' }}
    >
      {/* ── Atmospheric background glows ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(225,29,72,0.07) 0%, transparent 60%)' }} />
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(212,175,55,0.05) 0%, transparent 65%)' }} />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(79,209,197,0.04) 0%, transparent 65%)' }} />
        {/* subtle grid */}
        <div className="absolute inset-0 opacity-[0.02]"
          style={{ backgroundImage: 'linear-gradient(rgba(212,175,55,1) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,1) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
      </div>

      {/* ── Top bar ── */}
      <div className="absolute top-0 left-0 right-0 px-6 py-4 flex items-center justify-between z-30 border-b border-white/[0.04]">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-gym-gold transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Home</span>
        </button>

        <Logo size="sm" badgeText="AUTH" subtitle="" to="/" />

        <button
          onClick={() => setShowDemoLogins(!showDemoLogins)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer"
          style={{
            border: '1px solid rgba(212,175,55,0.3)',
            color: '#D4AF37',
            background: showDemoLogins ? 'rgba(212,175,55,0.1)' : 'transparent',
          }}
        >
          <Zap className="w-3.5 h-3.5 fill-[#D4AF37]" />
          <span className="hidden sm:block">Quick Demo</span>
        </button>
      </div>

      {/* ── 3D Flip Scene ── */}
      <div className="w-full max-w-[480px] z-10 my-auto mt-20 sm:mt-auto perspective-1200 flex justify-center items-center">
        <div
          className={`relative w-full transition-transform duration-700 preserve-3d flex items-center justify-center ${isFlipped ? 'rotate-y-180' : ''}`}
          style={{ minHeight: '500px', minWidth: '320px' }}
        >

          {/* ═══════ FRONT: LOGIN CIRCLE ═══════ */}
          <div
            className="w-full h-full backface-hidden absolute inset-0 flex flex-col items-center justify-center p-8 sm:p-12 rounded-full"
            style={{
              background: 'radial-gradient(ellipse at 30% 30%, #1e1c13, #131108)',
              boxShadow: '28px 28px 60px rgba(0,0,0,0.7), -12px -12px 40px rgba(212,175,55,0.06), inset 0 1px 0 rgba(212,175,55,0.12), inset 0 -1px 0 rgba(0,0,0,0.4)',
              border: '6px solid #1a1810',
              outline: '1px solid rgba(212,175,55,0.1)',
            }}
          >
            <div className="w-full max-w-[300px] flex flex-col items-center justify-center">
              {/* Eyebrow */}
              <p className="font-sans font-medium tracking-widest uppercase text-[10px] tracking-[0.2em] text-gym-gold/50 uppercase mb-2">Smart Gym // Login</p>

              {/* Heading */}
              <div className="text-center mb-5">
                <h1 className="font-display tracking-tight text-3xl sm:text-4xl font-bold text-slate-100 tracking-tight mb-1">
                  Welcome Back
                </h1>
                <p className="text-xs text-slate-600 font-medium">Sign in to your account</p>
              </div>

              {/* Error */}
              {authError && !isFlipped && (
                <div className="w-full mb-3 px-3 py-2 rounded-xl flex items-center gap-2 text-[11px] font-semibold"
                  style={{ background: 'rgba(225,29,72,0.1)', border: '1px solid rgba(225,29,72,0.2)', color: '#FF2A2A' }}>
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{authError}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleLoginSubmit} className="w-full space-y-3">
                {/* Email */}
                <div className="w-full rounded-full px-5 py-3 flex items-center gap-3 transition-all"
                  style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.06)', boxShadow: 'inset 3px 3px 8px rgba(0,0,0,0.5), inset -2px -2px 6px rgba(255,255,255,0.03)' }}
                  onFocus={e => e.currentTarget.style.borderColor = 'rgba(212,175,55,0.4)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
                >
                  <Mail className="w-4 h-4 shrink-0" style={{ color: '#D4AF37' }} />
                  <input
                    type="email"
                    required
                    placeholder="Email address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-transparent border-none text-xs sm:text-sm text-slate-200 placeholder-slate-600 focus:outline-none font-medium"
                  />
                </div>

                {/* Password */}
                <div className="w-full rounded-full px-5 py-3 flex items-center gap-3 transition-all"
                  style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.06)', boxShadow: 'inset 3px 3px 8px rgba(0,0,0,0.5), inset -2px -2px 6px rgba(255,255,255,0.03)' }}>
                  <Lock className="w-4 h-4 shrink-0" style={{ color: '#D4AF37' }} />
                  <input
                    type={showLoginPw ? 'text' : 'password'}
                    required
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-transparent border-none text-xs sm:text-sm text-slate-200 placeholder-slate-600 focus:outline-none font-medium"
                  />
                  <button type="button" tabIndex={-1} onClick={() => setShowLoginPw(v => !v)} className="shrink-0 opacity-40 hover:opacity-80 transition cursor-pointer">
                    {showLoginPw ? <EyeOff className="w-3.5 h-3.5 text-slate-400" /> : <Eye className="w-3.5 h-3.5 text-slate-400" />}
                  </button>
                </div>

                {/* Remember me + Forgot */}
                <div className="flex items-center justify-between px-1 pt-0.5">
                  <div onClick={() => setRememberMe(!rememberMe)} className="flex items-center gap-2 cursor-pointer select-none group">
                    <div className="w-9 h-5 rounded-full flex items-center px-0.5 transition-all"
                      style={{ background: rememberMe ? 'rgba(225,29,72,0.15)' : 'rgba(0,0,0,0.4)', border: `1px solid ${rememberMe ? 'rgba(225,29,72,0.4)' : 'rgba(255,255,255,0.06)'}`, boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.4)' }}>
                      <div className="w-4 h-4 rounded-full transition-all duration-200 shadow"
                        style={{ transform: rememberMe ? 'translateX(16px)' : 'translateX(0)', background: rememberMe ? '#FF2A2A' : '#374151' }} />
                    </div>
                    <span className="text-[11px] text-slate-600 group-hover:text-slate-400 transition font-medium">Remember me</span>
                  </div>
                  <button type="button"
                    onClick={() => { setForgotPasswordOpen(true); setResetSent(false); }}
                    className="text-[11px] text-slate-600 hover:text-gym-gold transition font-medium cursor-pointer">
                    Forgot password?
                  </button>
                </div>

                {/* Submit */}
                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-full text-slate-100 font-bold text-xs sm:text-sm tracking-widest uppercase flex items-center justify-center gap-2 cursor-pointer transition-all"
                    style={{
                      background: 'linear-gradient(135deg, #FF2A2A 0%, #BE123C 60%, #881337 100%)',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.1)',
                    }}
                  >
                    {loading
                      ? <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg> AUTHENTICATING…</>
                      : 'SIGN IN'
                    }
                  </button>
                </div>
              </form>

              {/* Flip link */}
              <div className="mt-5 text-center text-xs text-slate-600 font-medium">
                Don't have an account?{' '}
                <button type="button" onClick={() => toggleFlip(true)}
                  className="text-gym-gold hover:text-[#e0b96a] font-bold transition cursor-pointer">
                  Sign up
                </button>
              </div>
            </div>
          </div>

          {/* ═══════ BACK: SIGN UP CIRCLE ═══════ */}
          <div
            className="w-full h-full backface-hidden rotate-y-180 absolute inset-0 flex flex-col items-center justify-center p-8 sm:p-12 rounded-full"
            style={{
              background: 'radial-gradient(ellipse at 30% 30%, #1e1c13, #131108)',
              boxShadow: '28px 28px 60px rgba(0,0,0,0.7), -12px -12px 40px rgba(212,175,55,0.06), inset 0 1px 0 rgba(212,175,55,0.12), inset 0 -1px 0 rgba(0,0,0,0.4)',
              border: '6px solid #1a1810',
              outline: '1px solid rgba(212,175,55,0.1)',
            }}
          >
            <div className="w-full max-w-[300px] flex flex-col items-center justify-center">
              {/* Eyebrow */}
              <p className="font-sans font-medium tracking-widest uppercase text-[10px] tracking-[0.2em] text-gym-gold/50 uppercase mb-2">Smart Gym // Register</p>

              <div className="text-center mb-4">
                <h1 className="font-display tracking-tight text-3xl sm:text-4xl font-bold text-slate-100 tracking-tight mb-0.5">Join The Gym</h1>
                <p className="text-xs text-slate-600 font-medium">Create your account</p>
              </div>

              {/* Error */}
              {authError && isFlipped && (
                <div className="w-full mb-2 px-3 py-2 rounded-xl flex items-center gap-2 text-[11px] font-semibold"
                  style={{ background: 'rgba(225,29,72,0.1)', border: '1px solid rgba(225,29,72,0.2)', color: '#FF2A2A' }}>
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span className="truncate">{authError}</span>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="w-full space-y-2.5">
                {/* Full Name */}
                <div className="w-full rounded-full px-4 py-2.5 flex items-center gap-2.5"
                  style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.06)', boxShadow: 'inset 3px 3px 8px rgba(0,0,0,0.5), inset -2px -2px 6px rgba(255,255,255,0.03)' }}>
                  <UserIcon className="w-3.5 h-3.5 shrink-0" style={{ color: '#D4AF37' }} />
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-transparent border-none text-xs text-slate-200 placeholder-slate-600 focus:outline-none font-medium"
                  />
                </div>

                {/* Role selector */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
                  {[
                    { role: 'member', label: 'Member' },
                    { role: 'trainer', label: 'Trainer' },
                    { role: 'admin', label: 'Admin' },
                  ].map(({ role, label }) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => handleRoleChange(role)}
                      className="py-1.5 rounded-full text-[11px] font-semibold transition cursor-pointer"
                      style={{
                        background: formData.role === role ? 'rgba(225,29,72,0.15)' : 'rgba(0,0,0,0.3)',
                        border: `1px solid ${formData.role === role ? 'rgba(225,29,72,0.4)' : 'rgba(255,255,255,0.06)'}`,
                        color: formData.role === role ? '#FF2A2A' : '#6B7280',
                        boxShadow: formData.role === role ? 'inset 2px 2px 5px rgba(0,0,0,0.4)' : '2px 2px 5px rgba(0,0,0,0.4)',
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* Whitelist status */}
                {whitelistStatus && formData.role !== 'member' && (
                  <div className={`flex items-center gap-1.5 text-[10px] font-semibold px-3 py-1.5 rounded-full justify-center ${
                    whitelistStatus.isWhitelisted
                      ? 'text-gym-emerald'
                      : 'text-gym-red'
                  }`}
                    style={{ background: whitelistStatus.isWhitelisted ? 'rgba(111,190,140,0.1)' : 'rgba(225,29,72,0.1)', border: `1px solid ${whitelistStatus.isWhitelisted ? 'rgba(111,190,140,0.25)' : 'rgba(225,29,72,0.25)'}` }}>
                    {whitelistStatus.isWhitelisted
                      ? <><CheckCircle2 className="w-3 h-3" /> Email Pre-Approved</>
                      : <><AlertCircle className="w-3 h-3" /> Not Whitelisted</>
                    }
                  </div>
                )}

                {/* Email */}
                <div className="w-full rounded-full px-4 py-2.5 flex items-center gap-2.5"
                  style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.06)', boxShadow: 'inset 3px 3px 8px rgba(0,0,0,0.5), inset -2px -2px 6px rgba(255,255,255,0.03)' }}>
                  <Mail className="w-3.5 h-3.5 shrink-0" style={{ color: '#D4AF37' }} />
                  <input
                    type="email"
                    required
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    onBlur={handleEmailBlur}
                    className="w-full bg-transparent border-none text-xs text-slate-200 placeholder-slate-600 focus:outline-none font-medium"
                  />
                </div>

                {/* Password */}
                <div className="w-full rounded-full px-4 py-2.5 flex items-center gap-2.5"
                  style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.06)', boxShadow: 'inset 3px 3px 8px rgba(0,0,0,0.5), inset -2px -2px 6px rgba(255,255,255,0.03)' }}>
                  <Lock className="w-3.5 h-3.5 shrink-0" style={{ color: '#D4AF37' }} />
                  <input
                    type={showRegPw ? 'text' : 'password'}
                    required
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-transparent border-none text-xs text-slate-200 placeholder-slate-600 focus:outline-none font-medium"
                  />
                  <button type="button" tabIndex={-1} onClick={() => setShowRegPw(v => !v)} className="shrink-0 opacity-40 hover:opacity-80 transition cursor-pointer">
                    {showRegPw ? <EyeOff className="w-3.5 h-3.5 text-slate-400" /> : <Eye className="w-3.5 h-3.5 text-slate-400" />}
                  </button>
                </div>

                {/* Submit */}
                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-full text-slate-100 font-bold text-xs sm:text-sm tracking-widest uppercase flex items-center justify-center gap-2 cursor-pointer transition-all"
                    style={{
                      background: 'linear-gradient(135deg, #FF2A2A 0%, #BE123C 60%, #881337 100%)',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.1)',
                    }}
                  >
                    {loading
                      ? <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg> CREATING…</>
                      : 'SIGN UP'
                    }
                  </button>
                </div>
              </form>

              <div className="mt-4 text-center text-xs text-slate-600 font-medium">
                Already have an account?{' '}
                <button type="button" onClick={() => toggleFlip(false)}
                  className="text-gym-gold hover:text-[#e0b96a] font-bold transition cursor-pointer">
                  Sign in
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick Demo Logins Panel ── */}
      {showDemoLogins && (
        <div className="mt-5 w-full max-w-[480px] z-20 animate-fade-in-up rounded-2xl p-4 sm:p-5"
          style={{ background: 'rgba(19,18,8,0.95)', border: '1px solid rgba(212,175,55,0.18)', backdropFilter: 'blur(12px)' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold flex items-center gap-1.5" style={{ color: '#D4AF37' }}>
              <Zap className="w-4 h-4 fill-[#D4AF37]" />
              <span className="font-sans font-medium tracking-widest uppercase tracking-wider uppercase text-[11px]">1-Click Instant Test Portals</span>
            </span>
            <span className="text-[10px] font-sans font-medium tracking-widest uppercase px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(225,29,72,0.15)', border: '1px solid rgba(225,29,72,0.3)', color: '#FF2A2A' }}>
              INSTANT
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { key: 'admin',        label: 'Admin',     sub: 'Marcus (Superadmin)',  Icon: ShieldCheck, color: '#FF2A2A' },
              { key: 'trainer',      label: 'Coach',     sub: 'Coach Vikram',         Icon: Dumbbell,    color: '#D4AF37' },
              { key: 'member',       label: 'Member #1', sub: 'Rahul (Streak: 14d)',  Icon: Flame,       color: '#4FD1C5' },
              { key: 'member-elena', label: 'Member #2', sub: 'Priya (Gold VIP)',     Icon: Award,       color: '#6FBE8C' },
            ].map(({ key, label, sub, Icon, color }) => (
              <button
                key={key}
                type="button"
                onClick={() => handleDemoLogin(key)}
                className="p-3 rounded-xl text-left transition cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = color + '50'; e.currentTarget.style.background = color + '0D'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold" style={{ color }}>{label}</span>
                  <Icon className="w-3.5 h-3.5" style={{ color }} />
                </div>
                <p className="text-[10px] text-slate-600 truncate font-sans font-medium tracking-widest uppercase">{sub}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Forgot Password Modal ── */}
      {forgotPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-sm animate-fade-in-up rounded-2xl p-7 relative"
            style={{ background: '#13120A', border: '1px solid rgba(212,175,55,0.2)', boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }}>
            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-xl mx-auto flex items-center justify-center mb-3"
                style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)' }}>
                <KeyRound className="w-5 h-5" style={{ color: '#D4AF37' }} />
              </div>
              <h3 className="font-display tracking-tight text-xl font-bold text-slate-100">Reset Password</h3>
              <p className="text-xs text-slate-500 mt-1.5">Enter your email to receive a reset link.</p>
            </div>

            {resetSent ? (
              <div className="space-y-4">
                <div className="p-3 rounded-xl text-xs text-center font-medium"
                  style={{ background: 'rgba(111,190,140,0.1)', border: '1px solid rgba(111,190,140,0.2)', color: '#6FBE8C' }}>
                  ✓ Reset link sent! (or use Quick Demo Logins)
                </div>
                <button type="button" onClick={() => setForgotPasswordOpen(false)}
                  className="w-full py-3 rounded-full text-slate-100 font-bold text-xs uppercase tracking-widest cursor-pointer"
                  style={{ background: 'linear-gradient(135deg, #FF2A2A, #BE123C)', boxShadow: '0 8px 20px rgba(225,29,72,0.3)' }}>
                  Back to Sign In
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-full rounded-full px-4 py-2.5 flex items-center gap-3"
                  style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(74,69,80,0.35)', boxShadow: 'inset 3px 3px 8px rgba(0,0,0,0.5)' }}>
                  <Mail className="w-4 h-4" style={{ color: '#D4AF37' }} />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    defaultValue={formData.email}
                    className="w-full bg-transparent border-none text-xs text-slate-200 placeholder-slate-600 focus:outline-none"
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <button type="button" onClick={() => setForgotPasswordOpen(false)}
                    className="flex-1 py-2.5 rounded-full text-xs font-semibold text-slate-500 hover:text-slate-300 transition cursor-pointer"
                    style={{ border: '1px solid rgba(74,69,80,0.35)', background: 'transparent' }}>
                    Cancel
                  </button>
                  <button type="button" onClick={() => setResetSent(true)}
                    className="flex-1 py-2.5 rounded-full text-slate-100 font-bold text-xs uppercase tracking-wide cursor-pointer"
                    style={{ background: 'linear-gradient(135deg, #FF2A2A, #BE123C)', boxShadow: '0 6px 16px rgba(225,29,72,0.3)' }}>
                    Send Link
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthPage;
