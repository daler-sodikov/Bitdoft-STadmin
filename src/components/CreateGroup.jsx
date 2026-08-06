import React, { useState } from 'react';
import api from '../api/axios';
import { 
  X, 
  Users, 
  Loader2, 
  CheckCircle, 
  Hash, 
  Plus,
  AlertCircle 
} from 'lucide-react';

const COURSES = ['FRONTEND', 'BACKEND', 'FULLSTACK', 'MOBILE', 'GERMANLANUAGE'];

const getCourseLabel = (course) => {
  const labels = {
    FRONTEND: 'Frontend',
    BACKEND: 'Backend',
    FULLSTACK: 'Fullstack',
    MOBILE: 'Mobile',
    GERMANLANUAGE: 'Немецкий'
  };
  return labels[course] || course;
};

function GroupCreateModal({ isOpen, onClose, onSuccess }) {
  const [groupName, setGroupName] = useState('');
  const [courseName, setCourseName] = useState('FRONTEND');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', msg: '' });

  if (!isOpen) return null;

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', msg: '' });

    try {
      await api.post(`/groups`, { 
        name: groupName,
        course: courseName
      });

      setStatus({ type: 'success', msg: "Группа успешно создана!" });
      setGroupName('');
      setCourseName('FRONTEND');
      
      setTimeout(() => {
        onSuccess(); 
        onClose();
        setStatus({ type: '', msg: '' });
      }, 1500);

    } catch (error) {
      setStatus({ 
        type: 'error', 
        msg: error.response?.data?.error || "Ошибка при создании" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl p-8 animate-in zoom-in-95 duration-200 border border-gray-100">
        
        <button 
          onClick={onClose}
          className="absolute right-6 top-6 p-2 rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200 mb-4">
            <Users className="text-white" size={20} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Новая группа</h2>
          <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">Создание учебной группы</p>
        </div>

        <form onSubmit={handleCreateGroup} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Название группы</label>
            <div className="relative">
              <Hash className="absolute left-4 top-4 text-gray-300" size={20} />
              <input
                type="text"
                className="w-full pl-12 pr-6 py-4 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all font-semibold text-gray-700"
                placeholder="Напр: Frontend-101"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Курс</label>
            <select
              className="w-full px-4 py-4 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all font-semibold text-gray-700 cursor-pointer appearance-none"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              required
            >
              {COURSES.map(c => (
                <option key={c} value={c}>{getCourseLabel(c)}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-bold py-4 rounded-xl transition-all shadow-md shadow-indigo-200 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={22} /> : <Plus size={22} />}
            Создать группу
          </button>
        </form>

        {status.msg && (
          <div className={`mt-6 p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2 ${
            status.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
          }`}>
            {status.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span className="text-sm font-bold">{status.msg}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default GroupCreateModal;
