import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router';
import { ShieldAlert, KeyRound, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { BottomNavigation } from '../components/ui/BottomNavigation';
import { SoftInput } from '../components/ui/SoftInput';
import { PremiumButton } from '../components/ui/PremiumButton';
import { GlassCard } from '../components/ui/GlassCard';
import { authClient, useSession, signIn } from '../lib/auth.client';

export const DashboardLayout = () => {
  const [showForceModal, setShowForceModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { data: sessionData } = useSession();

  useEffect(() => {
    const mustChange = localStorage.getItem('FORCE_PASSWORD_CHANGE') === 'true';
    if (mustChange) {
      setShowForceModal(true);
    }
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Kata sandi baru dan konfirmasi tidak cocok');
      return;
    }
    if (newPassword === 'mubtadiaat123') {
      setError('Kata sandi baru tidak boleh sama dengan kata sandi default');
      return;
    }
    if (newPassword.length < 6) {
      setError('Kata sandi minimal harus 6 karakter');
      return;
    }

    setLoading(true);
    setError('');

    const userEmail = sessionData?.user?.email;

    try {
      const { error: changeError } = await authClient.changePassword({
        newPassword: newPassword,
        currentPassword: 'mubtadiaat123',
        revokeOtherSessions: true,
      });

      if (changeError) {
        setError(changeError.message || 'Gagal mengubah kata sandi');
      } else {
        localStorage.removeItem('FORCE_PASSWORD_CHANGE');
        
        // Re-authenticate programmatically so they don't get kicked out to login page
        if (userEmail) {
          await signIn.email({
            email: userEmail,
            password: newPassword,
          });
        }
        
        setIsSuccess(true);
        setTimeout(() => {
          setShowForceModal(false);
        }, 1500);
      }
    } catch (err: any) {
      setError(err?.message || 'Terjadi kesalahan sistem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-[#F0F4F8] relative pb-28 flex flex-col justify-between">
      {/* Main Content Area */}
      <main className="container max-w-xl mx-auto px-4 py-6 flex-1">
        <Outlet />
      </main>

      {/* Global App Footer - Fixed below the floating menu card with a premium spacing gap */}
      <footer className="fixed bottom-2.5 left-0 right-0 z-40 text-center text-[8px] text-slate-400 font-medium select-none leading-normal print:hidden">
        <p>
          Jl. KH. Abdul Karim Po. Box 140 Lirboyo Kediri &nbsp;|&nbsp; Telp. 0354-772197
        </p>
        <p className="mt-0.5 font-bold text-slate-500">
          &copy; {new Date().getFullYear()} P3HM Lirboyo. All Rights Reserved.
        </p>
      </footer>

      {/* Forced Password Change Overlay Modal */}
      {showForceModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <GlassCard
            variant="neumorph"
            className="w-full max-w-md p-6 border border-white/60 relative overflow-hidden"
          >
            {isSuccess ? (
              <div className="text-center py-6 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 neumorph-pressed">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Kata Sandi Diperbarui</h3>
                <p className="text-xs text-slate-500 font-medium mt-1">Mengalihkan ke dashboard...</p>
              </div>
            ) : (
              <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
                <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center neumorph-pressed shrink-0">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-800">Keamanan Akun Wajib</h3>
                    <p className="text-[10px] text-slate-500 font-medium">Ubah Kata Sandi Default</p>
                  </div>
                </div>

                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                  Akun Anda saat ini menggunakan kata sandi default bawaan sistem. 
                  Demi keamanan data santri putri MPHM Lirboyo, Anda wajib menggantinya terlebih dahulu.
                </p>

                {error && (
                  <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl border border-red-100 font-semibold">
                    {error}
                  </div>
                )}

                <SoftInput
                  label="Kata Sandi Baru"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Buat sandi baru..."
                  leftIcon={<KeyRound className="w-5 h-5" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="hover:text-blue-600 focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  }
                  required
                />

                <SoftInput
                  label="Konfirmasi Kata Sandi Baru"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi sandi baru..."
                  leftIcon={<KeyRound className="w-5 h-5" />}
                  required
                />

                <PremiumButton
                  type="submit"
                  isLoading={loading}
                  variant="primary"
                  className="w-full mt-2"
                >
                  Ubah & Masuk Dashboard
                </PremiumButton>
              </form>
            )}
          </GlassCard>
        </div>
      )}

      {/* Persistent Bottom Navigation for Mobile First approach */}
      <BottomNavigation />
    </div>
  );
};
