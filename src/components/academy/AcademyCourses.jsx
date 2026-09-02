import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import academyApi from '../../api/academyApi';
import AcademyCourseForm from './AcademyCourseForm';
import { FiPlus, FiBookOpen, FiEdit2, FiTrash2, FiLoader, FiUsers, FiClock, FiLayers } from 'react-icons/fi';

const STATUS_LABELS = { DRAFT: 'Черновик', PUBLISHED: 'Опубликован', ARCHIVED: 'Архив' };
const STATUS_COLORS = {
  DRAFT: 'bg-amber-50 text-amber-600 border-amber-100',
  PUBLISHED: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  ARCHIVED: 'bg-slate-100 text-slate-500 border-slate-200',
};

const formatDuration = (sec) => {
  if (!sec) return '0 мин';
  const m = Math.round(sec / 60);
  if (m < 60) return `${m} мин`;
  const h = Math.floor(m / 60);
  return `${h} ч ${m % 60} мин`;
};

export default function AcademyCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [formOpen, setFormOpen] = useState(false);

  const fetchCourses = useCallback(async () => {
    try {
      const res = await academyApi.get('/admin/courses', {
        params: statusFilter ? { status: statusFilter } : {},
      });
      setCourses(res.data?.data ?? []);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  const setStatus = async (course, status) => {
    try {
      await academyApi.patch(`/admin/courses/${course.id}/status`, { status });
      fetchCourses();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Не удалось изменить статус');
    }
  };

  const deleteCourse = async (course) => {
    if (!window.confirm(`Удалить курс «${course.title}»?`)) return;
    try {
      await academyApi.delete(`/admin/courses/${course.id}`);
      fetchCourses();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Не удалось удалить курс');
    }
  };

  const countByStatus = {
    _all: courses.length,
    DRAFT: courses.filter((c) => c.status === 'DRAFT').length,
    PUBLISHED: courses.filter((c) => c.status === 'PUBLISHED').length,
    ARCHIVED: courses.filter((c) => c.status === 'ARCHIVED').length,
  };

  const filters = ['', 'DRAFT', 'PUBLISHED', 'ARCHIVED'];

  return (
    <div className="min-h-screen bg-zinc-50 p-4 lg:p-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col justify-between gap-6 mb-10 md:flex-row md:items-end">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-200">
              <FiBookOpen size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Курсы академии</h1>
              <p className="text-sm text-zinc-500 mt-1.5">Создание и управление онлайн-курсами</p>
            </div>
          </div>

          <button
            onClick={() => setFormOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white transition-all bg-gradient-to-r from-indigo-500 to-violet-600 rounded-xl hover:from-indigo-600 hover:to-violet-700 active:scale-[0.97] shadow-lg shadow-indigo-200"
          >
            <FiPlus size={16} />
            Новый курс
          </button>
        </div>

        {/* Status filters */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          {filters.map((f) => (
            <button
              key={f || 'all'}
              onClick={() => setStatusFilter(f)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                statusFilter === f
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200'
                  : 'bg-white text-slate-500 border-zinc-200 hover:border-indigo-300'
              }`}
            >
              {STATUS_LABELS[f] || 'Все'}
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${statusFilter === f ? 'bg-white/20' : 'bg-zinc-100'}`}>
                {countByStatus[f] ?? countByStatus._all}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <FiLoader className="animate-spin text-indigo-500" size={28} />
          </div>
        ) : courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 bg-white border border-zinc-200 border-dashed rounded-2xl">
            <div className="flex items-center justify-center w-14 h-14 mb-4 bg-indigo-50 rounded-2xl">
              <FiBookOpen className="text-indigo-300" size={24} />
            </div>
            <p className="text-sm font-semibold text-zinc-500">Курсов пока нет</p>
            <p className="text-xs text-zinc-400 mt-1">Нажмите «Новый курс» чтобы создать первый</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => (
              <div key={course.id} className="flex flex-col bg-white border border-zinc-200 rounded-2xl overflow-hidden transition-all hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)] hover:border-zinc-300">
                {course.coverImageUrl ? (
                  <div className="relative h-36">
                    <img src={course.coverImageUrl} alt={course.title} className="object-cover w-full h-full" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <span className={`absolute top-3 left-3 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border ${STATUS_COLORS[course.status]}`}>
                      {STATUS_LABELS[course.status]}
                    </span>
                  </div>
                ) : (
                  <div className="relative flex items-center justify-center h-28 bg-gradient-to-br from-indigo-50 to-violet-50">
                    <FiBookOpen className="text-indigo-200" size={32} />
                    <span className={`absolute top-3 left-3 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border ${STATUS_COLORS[course.status]}`}>
                      {STATUS_LABELS[course.status]}
                    </span>
                  </div>
                )}

                <div className="flex flex-col flex-1 p-5">
                  <h3 className="text-sm font-semibold text-zinc-900 truncate">{course.title}</h3>
                  {course.subtitle && <p className="mt-1 text-xs text-zinc-500 line-clamp-1">{course.subtitle}</p>}

                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    {course.track && (
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                        {course.track}
                      </span>
                    )}
                    <span className="text-[10px] font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                      {course.level}
                    </span>
                    {course.studentOnly && (
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                        Student
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-zinc-100">
                    <div className="flex flex-col items-center gap-1">
                      <FiLayers size={14} className="text-zinc-400" />
                      <span className="text-[11px] font-semibold text-zinc-700">{course.lessonCount}</span>
                      <span className="text-[10px] text-zinc-400 uppercase tracking-wider">Уроков</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <FiUsers size={14} className="text-zinc-400" />
                      <span className="text-[11px] font-semibold text-zinc-700">{course._count?.enrollments ?? 0}</span>
                      <span className="text-[10px] text-zinc-400 uppercase tracking-wider">Студентов</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <FiClock size={14} className="text-zinc-400" />
                      <span className="text-[11px] font-semibold text-zinc-700">{formatDuration(course.durationSec)}</span>
                      <span className="text-[10px] text-zinc-400 uppercase tracking-wider">Длит.</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-100">
                    <div className="flex items-center gap-1.5">
                      <select
                        value={course.status}
                        onChange={(e) => setStatus(course, e.target.value)}
                        className="text-xs font-semibold text-zinc-600 bg-transparent border border-zinc-200 rounded-lg px-2 py-1.5 cursor-pointer outline-none focus:border-indigo-400"
                      >
                        {Object.keys(STATUS_LABELS).map((s) => (
                          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/academy/courses/${course.id}`)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 transition-colors hover:text-indigo-800"
                      >
                        <FiEdit2 size={13} />
                        Редактировать
                      </button>
                      <button
                        onClick={() => deleteCourse(course)}
                        className="p-2 text-zinc-300 transition-colors hover:text-red-600 active:scale-95"
                        title="Удалить"
                      >
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AcademyCourseForm open={formOpen} onClose={() => setFormOpen(false)} onSaved={fetchCourses} />
    </div>
  );
}