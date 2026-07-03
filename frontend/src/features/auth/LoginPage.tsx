import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, LogIn, User, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router';
import { GlassCard } from '../../components/ui/GlassCard';
import { SoftInput } from '../../components/ui/SoftInput';
import { PremiumButton } from '../../components/ui/PremiumButton';
import { signIn } from '../../lib/auth.client';

export const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Format username to simulated email under the hood for BetterAuth compliance
    const formattedEmail = username.includes('@') ? username : `${username}@mubtadiaat.id`;

    try {
      const { data: authData, error: signInError } = await signIn.email({
        email: formattedEmail,
        password,
      });
      
      if (signInError) {
        setError(signInError.message || 'Kredensial tidak valid');
      } else {
        if (password === 'mubtadiaat123') {
          localStorage.setItem('FORCE_PASSWORD_CHANGE', 'true');
        } else {
          localStorage.removeItem('FORCE_PASSWORD_CHANGE');
        }
        
        const userRole = (authData?.user as any)?.role;
        if (userRole === 1) {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Terjadi kesalahan sistem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-[#F0F4F8] flex flex-col items-center justify-center p-4 relative">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 opacity-50">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] min-w-64 min-h-64 bg-blue-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] min-w-64 min-h-64 bg-indigo-200/20 rounded-full blur-3xl" />
      </div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
        className="w-full max-w-md relative z-10 flex flex-col justify-center"
      >
        <div className="text-center mb-5 sm:mb-6 flex flex-col items-center">
          <div className="w-24 h-24 sm:w-28 sm:h-28 neumorph rounded-full flex items-center justify-center p-3 mb-3 transition-transform hover:scale-105">
            <img 
              src="/logo-3d.png" 
              alt="Logo P3HM Lirboyo" 
              className="w-full h-full object-contain filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.15)]"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight mb-1">e-Mubtadi'aat</h1>
          <p className="text-sm sm:text-base text-slate-500 font-medium mb-2">Sistem Informasi Manajemen P3HM Lirboyo</p>

          {/* Small subtle batik ornamental accent line */}
          <div className="flex items-center justify-center gap-3 my-1 opacity-50">
            <div className="h-px w-12 bg-linear-to-r from-transparent to-blue-500" />
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-blue-600">
              <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" fill="currentColor" opacity="0.3" stroke="currentColor" strokeWidth="1.5"/>
              <circle cx="12" cy="12" r="2.5" fill="currentColor" />
            </svg>
            <div className="h-px w-12 bg-linear-to-l from-transparent to-blue-500" />
          </div>
        </div>

        <GlassCard variant="neumorph" className="p-5 sm:p-8 w-full">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5">
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-1 sm:mb-2 text-center sm:text-left">
              Login ke Akun Anda
            </h2>
            
            <AnimatePresence>
              {error && (
                <motion.div 
                  key="error-box"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100 overflow-hidden"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>



            <SoftInput
              label="Nama Pengguna (Username)"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username Anda..."
              leftIcon={<User className="w-5 h-5" />}
              required
              autoComplete="off"
              spellCheck={false}
            />
            
            <SoftInput
              label="Kata Sandi"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              leftIcon={<Lock className="w-5 h-5" />}
              autoComplete="current-password"
              spellCheck={false}
              rightIcon={
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="hover:text-blue-600 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              }
              required
            />

            <div className="flex justify-end items-center mt-2">
              <a href="#" className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                Lupa Sandi?
              </a>
            </div>

            <PremiumButton 
              type="submit" 
              isLoading={loading} 
              variant="primary" 
              className="w-full mt-2"
              rightIcon={<LogIn className="w-5 h-5" />}
            >
              Masuk
            </PremiumButton>
          </form>
        </GlassCard>
      </motion.div>

      {/* Corporate Address & Copyright Footer */}
      <footer className="w-full max-w-md text-center text-[10px] text-slate-400 font-medium mt-8 px-4 z-10 flex flex-col gap-1 select-none">
        <p className="leading-relaxed">
          Jl. KH. Abdul Karim Po. Box 140 Lirboyo Kota Kediri Jawa Timur &nbsp;|&nbsp; Telp. 0354-772197
        </p>
        <p className="mt-1 font-bold text-slate-500">
          &copy; {new Date().getFullYear()} P3HM Lirboyo. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
};
