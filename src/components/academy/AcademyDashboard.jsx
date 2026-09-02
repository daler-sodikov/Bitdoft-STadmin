import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import academyApi from '../../api/academyApi';
import {
  HiOutlineUsers,
  HiOutlineBookOpen,
  HiOutlineNewspaper,
  HiOutlineClipboardCheck,
  HiOutlineTrendingUp,
  HiOutlineHome,
  HiOutlineSpeakerphone,
  HiOutlineClock
} from 'react-icons/hi';

export default function AcademyDashboard() {
  const [stats, setStats] = useState({ students: 0, courses: 0, published: 0, lessons: 0, enrolled: 0 });
  const [recentStudents, setRecentStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const [usersRes, coursesRes] = await Promise.all([
        academyApi.get('/admin/users', { params: { page: 1, pageSize: 1 } }),
        academyApi.get('/admin/courses'),
      ]);

      const users = usersRes.data?.data;
      const courses = Array.isArray(coursesRes.data?.data) ? coursesRes.data.data : [];

      const totalStudents = users?.total ?? 0;
      const published = courses.filter((c) => c.status === 'PUBLISHED').length;
      const lessons = courses.reduce((sum, c) => sum + (c.lessonCount || 0), 0);
      const enrolled = courses.reduce((sum, c) => sum + (c._count?.enrollments ?? 0), 0);

      setStats({ students: totalStudents, courses: courses.length, published, lessons, enrolled });

      const recentRes = await academyApi.get('/admin/users', { params: { page: 1, pageSize: 5 } });
      setRecentStudents(Array.isArray(recentRes.data?.data?.items) ? recentRes.data.data.items : []);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const statCards = [
    { label: 'Студенты', value: stats.students, icon: HiOutlineUsers, color: 'bg-indigo-50 text-indigo-600 border border-indigo-100', to: '/academy/students' },
    { label: 'Курсы', value: stats.courses, icon: HiOutlineBookOpen, color: 'bg-violet-50 text-violet-600 border border-violet-100', to: '/academy/courses' },
    { label: 'Опубликовано', value: stats.published, icon: HiOutlineSpeakerphone, color: 'bg-emerald-50 text-emerald-600 border border-emerald-100', to: '/academy/courses' },
    { label: 'Всего уроков', value: stats.lessons, icon: HiOutlineClipboardCheck, color: 'bg-amber-50 text-amber-600 border border-amber-100', to: '/academy/courses' },
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
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Обзор академии</h1>
          <p className="text-sm text-gray-500 mt-0.5">Статистика онлайн-курсов и студентов</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <Link
            key={card.label}
            to={card.to}
            className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg hover:shadow-gray-100/80 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${card.color}`}>
                <card.icon size={22} />
              </div>
              <HiOutlineTrendingUp size={16} className="text-emerald-400" />
            </div>
            <p className="text-3xl font-black text-gray-900 tracking-tight">{card.value}</p>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">{card.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent students */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-violet-600 rounded-full"></div>
              <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Последние студенты</h2>
            </div>
            <Link to="/academy/students" className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:text-indigo-800">
              Все студенты
            </Link>
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
                    <p className="text-xs text-gray-400">{student.phone || '—'}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border ${
                    student.accountType === 'ACADEMY'
                      ? 'bg-violet-50 text-violet-600 border-violet-100'
                      : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                  }`}>
                    {student.accountType}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Side info */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl p-7 text-white shadow-lg shadow-indigo-200">
            <div className="flex items-center gap-2 text-indigo-100 text-xs font-bold uppercase tracking-widest mb-6">
              <HiOutlineUsers size={15} />
              Студентов на курсах
            </div>
            <p className="text-4xl font-black tracking-tight">{stats.enrolled}</p>
            <div className="flex items-center gap-2 mt-6 text-indigo-100 text-xs font-semibold">
              <HiOutlineClock size={14} />
              суммарно по всем курсам
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-7 shadow-sm">
            <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">
              <HiOutlineBookOpen size={15} />
              Курсы
            </div>
            <p className="text-sm text-gray-500">
              Управление статусами курсов в разделе{' '}
              <Link to="/academy/courses" className="text-indigo-600 font-semibold hover:text-indigo-800">Курсы</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}