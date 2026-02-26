
import React, { useState, useEffect } from 'react';
import { ShieldCheck, ArrowRight, Lock, Fingerprint, Clock } from 'lucide-react';
import { UserRole } from '../types';
import { motion } from 'framer-motion';
import localforage from 'localforage';

interface LoginProps {
  onLogin: (role: UserRole) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChecking(true);
    
    try {
      if (password === '305060') {
        onLogin('admin');
      } else if (password === '1') {
        onLogin('user');
      } else if (password === '0000') {
        // Demo User Logic
        const demoStartDate = await localforage.getItem<number>('tqm_demo_start_date');
        const now = Date.now();
        const twoDaysInMs = 2 * 24 * 60 * 60 * 1000;

        if (!demoStartDate) {
          // First time logging in as demo
          await localforage.setItem('tqm_demo_start_date', now);
          onLogin('demo');
        } else {
          const elapsed = now - demoStartDate;
          if (elapsed > twoDaysInMs) {
            setError('انتهت الفترة التجريبية للمستخدم التجريبي (يومين)');
            setPassword('');
          } else {
            onLogin('demo');
          }
        }
      } else {
        setError('كلمة المرور غير صحيحة');
        setPassword('');
      }
    } catch (err) {
      setError('خطأ في التحقق من البيانات');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden" dir="rtl">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-royal-800/20 rounded-full -mr-32 -mt-32 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-800/10 rounded-full -ml-20 -mb-20 blur-[100px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="text-center mb-12">
            <motion.div 
                initial={{ scale: 0.5, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="inline-flex items-center justify-center w-28 h-28 bg-gradient-to-tr from-royal-700 to-royal-500 rounded-[2.5rem] shadow-[0_20px_50px_rgba(30,64,175,0.3)] mb-8 border border-white/20"
            >
                <ShieldCheck className="w-14 h-14 text-white" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tighter">TQM PRO SYSTEM</h1>
            <p className="text-royal-200/60 font-bold tracking-widest uppercase text-xs">Total Quality Management Dashboard</p>
        </div>

        <div className="bg-white/5 backdrop-blur-3xl rounded-[3.5rem] shadow-2xl p-10 md:p-14 border border-white/10 ring-1 ring-white/5">
            <form onSubmit={handleSubmit} className="space-y-10">
                <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                        <label className="text-sm font-black text-royal-100 uppercase tracking-widest">هوية الدخول</label>
                        <span className="text-[10px] font-black text-white/30 tracking-widest uppercase">Secured by TQM</span>
                    </div>
                    <div className="relative group">
                        <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none">
                            <Lock className="w-6 h-6 text-royal-400 group-focus-within:text-white transition-colors" />
                        </div>
                        <input 
                            type="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError('');
                            }}
                            className="w-full pr-16 pl-6 py-6 rounded-3xl border border-white/10 bg-white/5 text-white focus:bg-white/10 focus:ring-4 focus:ring-royal-500/20 focus:border-royal-500 outline-none transition-all font-black text-2xl text-center tracking-[0.5em] placeholder:text-white/10"
                            placeholder="••••••"
                            autoFocus
                        />
                        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                            <Fingerprint className="w-6 h-6 text-royal-400/30" />
                        </div>
                    </div>
                    {error && (
                        <motion.p 
                            initial={{ opacity: 0, x: 10 }} 
                            animate={{ opacity: 1, x: 0 }}
                            className="text-rose-400 text-sm font-black mr-2 flex items-center gap-2"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                            {error}
                        </motion.p>
                    )}
                </div>

                <div className="space-y-6">
                    <button 
                        type="submit"
                        disabled={isChecking}
                        className="w-full py-6 bg-gradient-to-l from-royal-700 to-royal-600 text-white rounded-3xl font-black text-xl hover:from-royal-600 hover:to-royal-500 transition-all shadow-[0_20px_40px_-10px_rgba(30,64,175,0.4)] active:scale-95 flex items-center justify-center gap-4 group disabled:opacity-50"
                    >
                        {isChecking ? 'جاري التحقق...' : 'تسجيل الدخول للنظام'}
                        {!isChecking && <ArrowRight className="w-6 h-6 group-hover:-translate-x-2 transition-transform" />}
                    </button>
                    
                    <div className="flex items-center justify-center gap-8 pt-4">
                        <div className="flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                             <span className="text-[10px] font-black text-white/30 tracking-widest uppercase">الخادم متصل</span>
                        </div>
                        <div className="flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                             <span className="text-[10px] font-black text-white/30 tracking-widest uppercase">مشفر بالكامل</span>
                        </div>
                    </div>
                </div>
            </form>
        </div>

        <p className="mt-12 text-center text-white/20 text-[10px] font-black uppercase tracking-[0.3em]">
            &copy; {new Date().getFullYear()} TQM Pro • Quality Intelligence Unit
        </p>
      </motion.div>
    </div>
  );
};
