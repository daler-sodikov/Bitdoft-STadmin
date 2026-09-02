import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiPlus,
  FiLoader,
  FiTrash2,
  FiEdit2,
  FiBookOpen,
  FiAlertCircle,
  FiX,
  FiArrowRight,
  FiEyeOff,
  FiEye,
  FiArchive,
} from 'react-icons/fi';
import academyAdmin from '../../api/academyAdmin';

const STATUS_LABEL = {
  DRAFT: { text: 'Черновик', className: 'bg-slate-100 text-slate-600 border-slate-200' },
  PUBLISHED: { text: 'Опубликован', className: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  ARCHIVED: { text: 'В архиве', className: 'bg-amber-50 text-amber-600 border-amber-100' },
};

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const emptyForm = { title: '', description: '', videoUrl: '' };

export default function AcademyCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchCourses = async () => {
    setLoading(true);
    try {
      setCourses(await academyAdmin.listCourses());
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Не удалось загрузить курсы');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const openCreate = () => {
    setForm(emptyForm);
    setError('');
    setIsCreateOpen(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      // Everything else the API accepts (subtitle, cover, track, level) is
      // left at its default: a course here is a title, a description and one
      // video, so the module and lesson are scaffolded automatically.
      const slug = `${slugify(form.title)}-${Date.now().toString(36).slice(-5)}`;
      const course = await academyAdmin.createCourse({
        slug,
        title: form.title,
        description: form.description,
        level: 'BEGINNER',
      });
      const courseModule = await academyAdmin.createModule(course.id, { title: 'Модуль 1' });
      const lesson = await academyAdmin.createLesson(courseModule.id, {
        title: form.title,
        kind: 'VIDEO',
      });
      await academyAdmin.setLessonVideo(lesson.id, {
        provider: 'YOUTUBE',
        youtubeUrl: form.videoUrl,
      });
      setIsCreateOpen(false);
      fetchCourses();
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при создании курса');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (course, status) => {
    try {
      await academyAdmin.setCourseStatus(course.id, status);
      fetchCourses();
    } catch (err) {
      alert(err.response?.data?.message || 'Не удалось изменить статус');
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await academyAdmin.deleteCourse(selectedCourse.id);
      setIsDeleteOpen(false);
      fetchCourses();
    } catch (err) {
      alert(err.response?.data?.message || 'Не удалось удалить курс');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="font-[Inter] text-gray-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Академия — Курсы</h1>
          <p className="text-sm text-gray-500 mt-1">Курс невидим студентам, пока ему не выдан доступ</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-md shadow-indigo-200 hover:from-indigo-600 hover:to-violet-700 active:scale-95"
        >
          <FiPlus size={16} /> Новый курс
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-lg shadow-gray-100/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Курс</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Уроки</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Статус</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="4" className="py-20 text-center">
                    <FiLoader className="animate-spin mx-auto text-indigo-400" size={24} />
                  </td>
                </tr>
              ) : (
                courses.map((course) => {
                  const status = STATUS_LABEL[course.status] || STATUS_LABEL.DRAFT;
                  return (
                    <tr key={course.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <button
                          onClick={() => navigate(`/academy/courses/${course.id}`)}
                          className="flex items-center gap-3 text-left group"
                        >
                          <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100 shrink-0">
                            <FiBookOpen size={16} />
                          </div>
                          <div>
                            <div className="font-bold text-gray-800 text-sm group-hover:text-indigo-600">
                              {course.title}
                            </div>
                            <div className="text-[11px] text-gray-400">{course.slug}</div>
                          </div>
                        </button>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-gray-500">
                        {course.lessonCount} · {course._count?.enrollments ?? 0} студентов
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border ${status.className}`}
                        >
                          {status.text}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-1">
                          {course.status !== 'PUBLISHED' && (
                            <button
                              onClick={() => handleStatusChange(course, 'PUBLISHED')}
                              className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                              title="Опубликовать"
                            >
                              <FiEye size={16} />
                            </button>
                          )}
                          {course.status === 'PUBLISHED' && (
                            <button
                              onClick={() => handleStatusChange(course, 'ARCHIVED')}
                              className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                              title="Архивировать"
                            >
                              <FiArchive size={16} />
                            </button>
                          )}
                          {course.status === 'ARCHIVED' && (
                            <button
                              onClick={() => handleStatusChange(course, 'DRAFT')}
                              className="p-2 text-gray-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                              title="Вернуть в черновики"
                            >
                              <FiEyeOff size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => navigate(`/academy/courses/${course.id}`)}
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                            title="Редактировать / уроки"
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedCourse(course);
                              setIsDeleteOpen(true);
                            }}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            title="Удалить"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {!loading && courses.length === 0 && (
          <div className="py-20 text-center text-gray-400 text-sm font-medium">
            <FiBookOpen className="mx-auto mb-3 text-gray-300" size={32} />
            <p>{error || 'Курсы не найдены'}</p>
            {!error && (
              <button onClick={openCreate} className="mt-4 text-indigo-600 underline text-xs font-bold uppercase">
                Создать первый курс
              </button>
            )}
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-[2px]">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Новый курс</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-gray-400 hover:text-gray-600">
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Название</label>
                <input
                  required
                  className="w-full bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none text-sm font-semibold transition-all"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Описание</label>
                <textarea
                  required
                  rows={4}
                  className="w-full bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none text-sm font-semibold transition-all resize-none"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                  Ссылка на видео (YouTube)
                </label>
                <input
                  required
                  type="url"
                  className="w-full bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none text-sm font-semibold transition-all"
                  value={form.videoUrl}
                  onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <FiAlertCircle size={16} /> {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="flex-1 px-4 py-2 text-xs font-bold text-gray-500 uppercase hover:bg-gray-50 rounded-xl"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-violet-600 text-white py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:from-indigo-600 hover:to-violet-700 transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-200"
                >
                  {saving ? <FiLoader className="animate-spin" size={16} /> : <>Создать <FiArrowRight size={14} /></>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-[2px]">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-8 text-center border border-gray-100">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <FiAlertCircle size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Удалить курс?</h3>
            <p className="text-gray-500 text-sm mt-2">
              Курс <span className="font-bold text-gray-800">"{selectedCourse?.title}"</span> будет удалён
              безвозвратно. Если у курса есть студенты — используйте архивирование.
            </p>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setIsDeleteOpen(false)} className="flex-1 py-2 text-xs font-bold text-gray-500 uppercase">
                Отмена
              </button>
              <button
                onClick={handleDelete}
                disabled={saving}
                className="flex-1 bg-red-600 text-white py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition-all flex items-center justify-center"
              >
                {saving ? <FiLoader className="animate-spin" size={16} /> : 'Удалить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
