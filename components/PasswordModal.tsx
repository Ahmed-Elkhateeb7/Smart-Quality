import React, { useState } from 'react';
import { Lock, X } from 'lucide-react';

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const PasswordModal: React.FC<PasswordModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '305060') {
      onConfirm();
      setPassword('');
      setError('');
      onClose();
    } else {
      setError('كلمة المرور غير صحيحة');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <div className="flex items-center gap-2 text-royal-800">
            <Lock className="w-6 h-6" />
            <h2 className="text-xl font-bold">إذن المسؤول مطلوب</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-red-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              كلمة المرور
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-royal-800 focus:border-royal-800 outline-none transition-all text-center text-lg tracking-widest"
              placeholder="••••••"
              autoFocus
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-semibold"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-royal-800 text-white rounded-lg hover:bg-royal-900 transition-colors font-semibold shadow-lg shadow-royal-800/20"
            >
              تأكيد
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};