import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Mail, 
  Lock, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      await register(name.trim(), email.trim(), password.trim());
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#0A192F] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_4px_24px_rgba(0,44,95,0.06)] overflow-hidden">
        
        {/* Left Side: Brand Visual */}
        <div className="lg:col-span-5 bg-[#F0F5FA] p-8 sm:p-10 border-b lg:border-b-0 lg:border-r border-[#E2E8F0] flex flex-col justify-between">
          <div>
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

            <div className="space-y-3 mb-8">
              <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#EAF4FF] text-[#0072CE] border border-[#BFDBFE]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Specialist Onboarding</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#002C5F] tracking-tight leading-snug">
                Join the Automotive Intelligence Network.
              </h1>
              <p className="text-xs text-[#475569] leading-relaxed">
                Create an authorized account to index brochures, explore high-dimensional semantic vectors, and generate verified customer recommendations.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-white border border-[#E2E8F0] shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-[#16A36A] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-[#002C5F]">Role-Based JWT Security</h4>
                  <p className="text-[11px] text-[#64748B]">Encrypted token issuance with automatic session validation.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-white border border-[#E2E8F0] shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-[#16A36A] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-[#002C5F]">Multi-Model Knowledge Base</h4>
                  <p className="text-[11px] text-[#64748B]">Alcazar, Creta, i20, Aura brochure indexing with vector search.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-[#E2E8F0] flex items-center justify-between text-[11px] text-[#64748B]">
            <span className="font-medium text-[#002C5F]">Corporate Enclave</span>
            <span>v2.5.0</span>
          </div>
        </div>

        {/* Right Side: Registration Form */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center bg-white">
          <div className="max-w-md w-full mx-auto space-y-6">
            <div>
              <h2 className="text-2xl font-extrabold text-[#002C5F] tracking-tight">
                Create Specialist Account
              </h2>
              <p className="text-xs text-[#64748B] mt-1.5">
                Register authorized credentials to access telemetry, document indexing, and AI consultation.
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Doe, Automotive Specialist"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#0A192F] placeholder-[#94A3B8] focus:outline-none focus:border-[#0072CE] focus:bg-white focus:ring-1 focus:ring-[#0072CE] transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1.5">Email Address</label>
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
                <label className="block text-xs font-semibold text-[#334155] mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
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
                    <span>Complete Registration</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 text-center text-xs text-[#64748B]">
              Already have authorized credentials?{' '}
              <Link to="/login" className="font-semibold text-[#0072CE] hover:underline ml-1">
                Sign In
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
