/**
 * KISAN COMPASS — FeatureAuthGate Component
 * 
 * Elegant glassmorphism authentication gate that opens directly within
 * the wheel environment when an unauthenticated user enters a feature.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { FeatureId, FEATURES } from '../../config/features';
import { getAppMode } from '../../services/farmRepository';
import { X, Lock, UserCheck, AlertCircle, ShieldCheck } from 'lucide-react';

interface FeatureAuthGateProps {
  targetFeature?: FeatureId | null;
  onSuccess?: (featureId: FeatureId) => void;
}

export const FeatureAuthGate: React.FC<FeatureAuthGateProps> = ({
  targetFeature = 'field',
  onSuccess,
}) => {
  const { isAuthGateOpen, closeAuthGate, login, register, pendingFeature } = useAuth();

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  if (!isAuthGateOpen) return null;

  const currentFeatureId = pendingFeature || targetFeature || 'field';
  const feature = FEATURES[currentFeatureId];

  const handleFillDemoPilot = () => {
    setEmail('ramesh.patel@kisan.org');
    setPassword('password123');
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (mode === 'LOGIN') {
        const res = await login(email, password);
        if (res.success) {
          if (onSuccess) onSuccess(currentFeatureId);
        } else {
          setErrorMessage(res.error || 'Authentication failed.');
        }
      } else {
        const res = await register(name, email, password, confirmPassword);
        if (res.success) {
          if (onSuccess) onSuccess(currentFeatureId);
        } else {
          setErrorMessage(res.error || 'Registration failed.');
        }
      }
    } catch {
      setErrorMessage('A network or cryptographic error occurred. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md rain-auth-glass p-6 sm:p-7 relative select-none font-sans"
      >
        {/* Close Button */}
        <button
          onClick={closeAuthGate}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-black/[0.04] hover:bg-black/[0.08] text-[#526057] hover:text-[#16231B] flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Feature Context Banner */}
        <div className="space-y-1 pb-4 border-b border-[rgba(23,58,39,0.08)]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#173A27]" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#527B62] font-bold">
              {feature.name} INTELLIGENCE GATEWAY
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-[#16231B] tracking-tight">
            {mode === 'LOGIN' ? 'Sign in to your farm' : 'Register farm account'}
          </h2>
          <p className="text-xs text-[#526057]">
            {mode === 'LOGIN'
              ? 'Authenticate to unlock live Field 07 models, decisions, and market intelligence.'
              : 'Create your verified identity to participate in the regional pilot.'}
          </p>
        </div>

        {/* Mode Selector Toggle */}
        <div className="grid grid-cols-2 p-1 my-4 rounded-xl bg-black/[0.04] border border-black/[0.04] text-xs font-mono font-bold">
          <button
            type="button"
            onClick={() => {
              setMode('LOGIN');
              setErrorMessage(null);
            }}
            className={`py-1.5 rounded-lg transition-all ${
              mode === 'LOGIN'
                ? 'bg-white text-[#173A27] shadow-xs'
                : 'text-[#7B867F] hover:text-[#16231B]'
            }`}
          >
            SIGN IN
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('REGISTER');
              setErrorMessage(null);
            }}
            className={`py-1.5 rounded-lg transition-all ${
              mode === 'REGISTER'
                ? 'bg-white text-[#173A27] shadow-xs'
                : 'text-[#7B867F] hover:text-[#16231B]'
            }`}
          >
            REGISTER
          </button>
        </div>

        {/* Error Feedback */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3 mb-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="leading-snug">
                <strong>Attention:</strong> {errorMessage}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'REGISTER' && (
            <div className="space-y-1">
              <label className="text-[11px] font-mono font-semibold text-[#526057] uppercase">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ramesh Patel"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[rgba(23,58,39,0.12)] text-[#16231B] text-xs focus:outline-none focus:border-[#173A27] transition-colors"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[11px] font-mono font-semibold text-[#526057] uppercase">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="farmer@kisancompass.org"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[rgba(23,58,39,0.12)] text-[#16231B] text-xs focus:outline-none focus:border-[#173A27] transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-mono font-semibold text-[#526057] uppercase">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[rgba(23,58,39,0.12)] text-[#16231B] text-xs focus:outline-none focus:border-[#173A27] transition-colors"
            />
          </div>

          {mode === 'REGISTER' && (
            <div className="space-y-1">
              <label className="text-[11px] font-mono font-semibold text-[#526057] uppercase">
                Confirm Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[rgba(23,58,39,0.12)] text-[#16231B] text-xs focus:outline-none focus:border-[#173A27] transition-colors"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-[#173A27] hover:bg-[#122D1E] text-white text-xs font-bold font-mono tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md disabled:opacity-50"
          >
            {isLoading ? (
              <span>Verifying credentials...</span>
            ) : mode === 'LOGIN' ? (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>SIGN IN & CONTINUE TO {feature.name}</span>
              </>
            ) : (
              <>
                <UserCheck className="w-3.5 h-3.5" />
                <span>CREATE ACCOUNT & ENTER {feature.name}</span>
              </>
            )}
          </button>
        </form>

        {/* Pilot Demo Credentials Quick-Fill Helper (Development / Demo Mode Only) */}
        {mode === 'LOGIN' && getAppMode() !== 'production' && (
          <div className="mt-4 pt-3 border-t border-[rgba(23,58,39,0.06)] flex items-center justify-between text-[11px] font-mono">
            <span className="text-[#7B867F]">Pilot Account Available:</span>
            <button
              type="button"
              onClick={handleFillDemoPilot}
              className="text-[#173A27] hover:underline font-bold cursor-pointer"
            >
              Fill Pilot Farmer (Ramesh)
            </button>
          </div>
        )}

        <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] font-mono text-[#7B867F]">
          <ShieldCheck className="w-3 h-3 text-[#527B62]" />
          <span>
            {getAppMode() === 'production'
              ? 'Production Supabase Cloud Auth Vault (RLS Enforced)'
              : 'Local Cryptographic SHA-256 Auth Vault'}
          </span>
        </div>

      </motion.div>
    </div>
  );
};
