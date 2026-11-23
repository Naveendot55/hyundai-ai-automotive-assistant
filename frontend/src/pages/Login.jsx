import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  AlertCircle, 
  ArrowRight,
  Database,
  Cpu,
  Layers,
  Sparkles,
  Zap,
  CheckCircle2
} from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const cleanEmail = email.trim();
      const cleanPassword = password.trim();

      if (!cleanEmail || !cleanPassword) {
        setError('Please enter both email and password.');
        setLoading(false);
        return;
      }

      await login(cleanEmail, cleanPassword);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setEmail('demo@hyundai-ai.com');
    setPassword('Hyundai2026!');
    setError('');
    setLoading(true);

    try {
      await login('demo@hyundai-ai.com', 'Hyundai2026!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Demo login failed. Please ensure the backend is running and seeded.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#0A192F] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_4px_24px_rgba(0,44,95,0.06)] overflow-hidden">
        
        {/* Left Side: Premium Automotive Showcase */}
        <div className="lg:col-span-5 bg-[#F0F5FA] p-8 sm:p-10 border-b lg:border-b-0 lg:border-r border-[#E2E8F0] flex flex-col justify-between">
          <div>
            {/* Brand Logo */}
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-11 h-11 rounded-xl bg-[#002C5F] text-white flex items-center justify-center font-black text-2xl shadow-sm">
                H
              </div>
              <div>
                <span className="font-extrabold text-base tracking-wider text-[#002C5F] block uppercase leading-tight">
                  Hyundai
                </span>
                <span className="text-[11px] font-semibold text-[#0072CE] tracking-wider uppercase">
                  AI Intelligence Studio
                </span>
              </div>
            </div>

            {/* Headline and Lead */}
            <div className="space-y-3 mb-8">
              <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#EAF4FF] text-[#0072CE] border border-[#BFDBFE]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Automotive Knowledge Platform</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#002C5F] tracking-tight leading-snug">
                Precision Intelligence for Hyundai Vehicles.
              </h1>
              <p className="text-xs text-[#475569] leading-relaxed">
                Connect directly to official Hyundai engineering brochures with vector similarity retrieval, zero hallucinations, and exact citation tracking.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-white border border-[#E2E8F0] shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-[#16A36A] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-[#002C5F]">MongoDB Atlas Vector Search</h4>
                  <p className="text-[11px] text-[#64748B]">768-dimensional semantic embeddings with sub-second retrieval.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-white border border-[#E2E8F0] shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-[#16A36A] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-[#002C5F]">Zero Hallucination Grounding</h4>
                  <p className="text-[11px] text-[#64748B]">Grounded strictly in verified PDF brochure excerpts and page data.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-[#E2E8F0] flex items-center justify-between text-[11px] text-[#64748B]">
            <span className="font-medium text-[#002C5F]">Corporate Secure Platform</span>
            <span>v2.5.0</span>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center bg-white">
          <div className="max-w-md w-full mx-auto space-y-6">
            
            {/* Header */}
            <div>
              <h2 className="text-2xl font-extrabold text-[#002C5F] tracking-tight">
                Welcome to Hyundai AI Studio
              </h2>
              <p className="text-xs text-[#64748B] mt-1.5">
                Your intelligent automotive knowledge platform. Sign in to access your dashboard.
              </p>
            </div>

            {/* 1-Click Evaluator Demo Box */}
            <div className="p-4 rounded-xl bg-[#EAF4FF] border border-[#BFDBFE] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#002C5F] flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#0072CE]" />
                  <span>Technical Evaluator Demo</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold uppercase bg-white text-[#0072CE] rounded-full border border-[#BFDBFE]">
                  Pre-Configured
                </span>
              </div>
              <p className="text-[11px] text-[#475569]">
                Email: <strong className="text-[#002C5F]">demo@hyundai-ai.com</strong><br />
                Password: <strong className="text-[#002C5F]">Hyundai2026!</strong>
              </p>
              <button
                type="button"
                onClick={handleQuickDemoLogin}
                disabled={loading}
                className="w-full py-2 bg-[#0072CE] hover:bg-[#002C5F] text-white font-bold rounded-lg text-xs transition shadow-xs flex items-center justify-center space-x-2"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>1-Click Evaluator Sign In</span>
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="specialist@hyundai-ai.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#0A192F] placeholder-[#94A3B8] focus:outline-none focus:border-[#0072CE] focus:bg-white focus:ring-1 focus:ring-[#0072CE] transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#0A192F] placeholder-[#94A3B8] focus:outline-none focus:border-[#0072CE] focus:bg-white focus:ring-1 focus:ring-[#0072CE] transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#002C5F] hover:bg-[#0072CE] text-white font-bold rounded-xl text-xs tracking-wider transition shadow-sm disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Studio</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Registration Footer */}
            <div className="pt-2 text-center text-xs text-[#64748B]">
              New specialist to the platform?{' '}
              <Link to="/register" className="font-semibold text-[#0072CE] hover:underline ml-1">
                Register Credentials
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
