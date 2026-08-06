import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
  HiOutlineUsers, 
  HiOutlineFolderOpen, 
  HiOutlineNewspaper, 
  HiOutlineClipboardCheck,
  HiOutlineTrendingUp,
  HiOutlineHome
} from 'react-icons/hi';

export default function Dashboard() {
  const [stats, setStats] = useState({ students: 0, groups: 0, news: 0, lessons: 0 });
  const [recentStudents, setRecentStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [studentsRes, groupsRes, newsRes, lessonsRes] = await Promise.all([
          api.get('/students'),
          api.get('/groups'),
          api.get('/news'),
          api.get('/learn')
        ]);

        const students = Array.isArray(studentsRes.data) ? studentsRes.data : [];
        const groups = Array.isArray(groupsRes.data) ? groupsRes.data : [];
        const news = Array.isArray(newsRes.data) ? newsRes.data : [];
        const lessons = Array.isArray(lessonsRes.data?.tasks) ? lessonsRes.data.tasks : [];

        setStats({
          students: students.length,
          groups: groups.length,
          news: news.length,
          lessons: lessons.length
        });

        setRecentStudents(students.slice(0, 5));
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { label: 'Студенты', value: stats.students, icon: HiOutlineUsers, color: 'bg-indigo-50 text-indigo-600 border border-indigo-100' },
    { label: 'Группы', value: stats.groups, icon: HiOutlineFolderOpen, color: 'bg-violet-50 text-violet-600 border border-violet-100' },
    { label: 'Новости', value: stats.news, icon: HiOutlineNewspaper, color: 'bg-emerald-50 text-emerald-600 border border-emerald-100' },
    { label: 'Уроки', value: stats.lessons, icon: HiOutlineClipboardCheck, color: 'bg-amber-50 text-amber-600 border border-amber-100' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200">
          <HiOutlineHome size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Обзор системы</h1>
          <p className="text-sm text-gray-500 mt-0.5">Статистика и краткая сводка платформы</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg hover:shadow-gray-100/80 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${card.color}`}>
                <card.icon size={22} />
              </div>
              <HiOutlineTrendingUp size={16} className="text-emerald-400" />
            </div>
            <p className="text-3xl font-black text-gray-900 tracking-tight">{card.value}</p>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Students */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-violet-600 rounded-full"></div>
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Последние студенты</h2>
          </div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{recentStudents.length} из {stats.students}</span>
        </div>
        <div className="divide-y divide-gray-50">
          {recentStudents.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm italic">Студентов пока нет</div>
          ) : (
            recentStudents.map((student) => (
              <div key={student.id} className="px-8 py-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-600">
                  {student.name?.charAt(0) || '?'}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900">{student.name}</p>
                  <p className="text-xs text-gray-400">{student.email}</p>
                </div>
                <div className="text-right">
                  {student.groups && student.groups.length > 0 ? (
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider border border-indigo-100">
                      {student.groups[0].name}
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-amber-500 bg-amber-50 px-3 py-1 rounded-full uppercase tracking-wider border border-amber-100">
                      Без группы
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
