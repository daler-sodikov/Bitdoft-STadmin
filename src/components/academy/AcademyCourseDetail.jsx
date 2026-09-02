import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import academyApi from '../../api/academyApi';
import AcademyCourseForm from './AcademyCourseForm';
import {
  FiArrowLeft, FiBookOpen, FiPlus, FiEdit2, FiTrash2, FiX,
  FiLoader, FiLayers, FiPlayCircle, FiYoutube, FiSave, FiVideo, FiCheck
} from 'react-icons/fi';

const KIND_LABELS = { VIDEO: 'Видео', TEXT: 'Текст', QUIZ: 'Тест', TASK: 'Задание' };
const STATUS_LABELS = { DRAFT: 'Черновик', PUBLISHED: 'Опубликован', ARCHIVED: 'Архив' };
const STATUS_COLORS = {
  DRAFT: 'bg-amber-50 text-amber-600 border-amber-100',
  PUBLISHED: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  ARCHIVED: 'bg-slate-100 text-slate-500 border-slate-200',
};
const KIND_COLORS = {
  VIDEO: 'bg-indigo-50 text-indigo-600',
  TEXT: 'bg-sky-50 text-sky-600',
  QUIZ: 'bg-violet-50 text-violet-600',
  TASK: 'bg-emerald-50 text-emerald-600',
};

export default function AcademyCourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [courseFormOpen, setCourseFormOpen] = useState(false);

  const [moduleModal, setModuleModal] = useState(null); // { mode, module? }
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleSaving, setModuleSaving] = useState(false);

  const [lessonModal, setLessonModal] = useState(null); // { mode, moduleId, lesson? }
  const [lessonForm, setLessonForm] = useState({ title: '', kind: 'VIDEO', isFreePreview: false });
  const [lessonSaving, setLessonSaving] = useState(false);

  const [videoModal, setVideoModal] = useState(null); // lesson
  const [videoForm, setVideoForm] = useState({ provider: 'HOSTINGER', sourcePath: '', posterPath: '', youtubeUrl: '', durationSec: '' });
  const [videoSaving, setVideoSaving] = useState(false);

  const fetchCourse = useCallback(async () => {
    try {
      const res = await academyApi.get(`/admin/courses/${id}`);
      setCourse(res.data?.data ?? null);
    } catch {
      alert('Не удалось загрузить курс');
      navigate('/academy');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => { fetchCourse(); }, [fetchCourse]);

  //--- Modules ---
  const openAddModule = () => { setModuleTitle(''); setModuleModal({ mode: 'add' }); };
  const openEditModule = (module) => { setModuleTitle(module.title); setModuleModal({ mode: 'edit', module }); };

  const saveModule = async (e) => {
    e.preventDefault();
    setModuleSaving(true);
    try {
      if (moduleModal.mode === 'edit') {
        await academyApi.patch(`/admin/modules/${moduleModal.module.id}`, { title: moduleTitle });
      } else {
        await academyApi.post(`/admin/courses/${id}/modules`, { title: moduleTitle });
      }
      setModuleModal(null);
      fetchCourse();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Ошибка сохранения модуля');
    } finally {
      setModuleSaving(false);
    }
  };

  const deleteModule = async (module) => {
    if (!window.confirm(`Удалить модуль «${module.title}» и все его уроки?`)) return;
    try {
      await academyApi.delete(`/admin/modules/${module.id}`);
      fetchCourse();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Ошибка удаления модуля');
    }
  };

  //--- Lessons ---
  const openAddLesson = (moduleId) => { setLessonForm({ title: '', kind: 'VIDEO', isFreePreview: false }); setLessonModal({ mode: 'add', moduleId }); };
  const openEditLesson = (moduleId, lesson) => {
    setLessonForm({ title: lesson.title, kind: lesson.kind, isFreePreview: lesson.isFreePreview });
    setLessonModal({ mode: 'edit', moduleId, lesson });
  };

  const saveLesson = async (e) => {
    e.preventDefault();
    setLessonSaving(true);
    try {
      if (lessonModal.mode === 'edit') {
        await academyApi.patch(`/admin/lessons/${lessonModal.lesson.id}`, lessonForm);
      } else {
        await academyApi.post(`/admin/modules/${lessonModal.moduleId}/lessons`, lessonForm);
      }
      setLessonModal(null);
      fetchCourse();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Ошибка сохранения урока');
    } finally {
      setLessonSaving(false);
    }
  };

  const deleteLesson = async (lesson) => {
    if (!window.confirm(`Удалить урок «${lesson.title}»?`)) return;
    try {
      await academyApi.delete(`/admin/lessons/${lesson.id}`);
      fetchCourse();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Ошибка удаления урока');
    }
  };

  //--- Video ---
  const openVideoEditor = (lesson) => {
    const v = lesson.video;
    setVideoForm(v
      ? { provider: v.provider, sourcePath: v.sourcePath || '', posterPath: v.posterKey || '', youtubeUrl: v.youtubeVideoId ? `https://youtu.be/${v.youtubeVideoId}` : '', durationSec: v.durationSec || '' }
      : { provider: 'HOSTINGER', sourcePath: '', posterPath: '', youtubeUrl: '', durationSec: '' });
    setVideoModal(lesson);
  };

  const saveVideo = async () => {
    setVideoSaving(true);
    try {
      const payload = {
        provider: videoForm.provider,
        durationSec: videoForm.durationSec ? Number(videoForm.durationSec) : undefined,
      };
      if (videoForm.provider === 'HOSTINGER') {
        payload.sourcePath = videoForm.sourcePath;
        payload.posterPath = videoForm.posterPath || null;
      } else {
        payload.youtubeUrl = videoForm.youtubeUrl;
      }
      await academyApi.put(`/admin/lessons/${videoModal.id}/video`, payload);
      setVideoModal(null);
      fetchCourse();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Ошибка сохранения видео');
    } finally {
      setVideoSaving(false);
    }
  };

  const removeVideo = async () => {
    if (!window.confirm('Удалить видео этого урока?')) return;
    try {
      await academyApi.delete(`/admin/lessons/${videoModal.id}/video`);
      setVideoModal(null);
      fetchCourse();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Ошибка удаления видео');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <FiLoader className="animate-spin text-indigo-500" size={28} />
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="min-h-screen bg-zinc-50 p-4 lg:p-8">
      <div className="max-w-[1400px] mx-auto space-y-8">
        {/* Header */}
        <div>
          <Link to="/academy/courses" className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-indigo-600 transition-colors">
            <FiArrowLeft size={16} />
            Все курсы
          </Link>
          <div className="flex flex-col justify-between gap-4 mt-4 md:flex-row md:items-end">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-200">
                <FiBookOpen size={22} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold tracking-tight text-zinc-900">{course.title}</h1>
                  <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border ${STATUS_COLORS[course.status]}`}>
                    {STATUS_LABELS[course.status]}
                  </span>
                </div>
                <p className="text-sm text-zinc-500 mt-1">
                  {[course.track, course.level].filter(Boolean).join(' · ') || 'Без направления'}
                  <span className="mx-2 text-zinc-300">•</span>
                  {course.lessonCount} уроков
                  <span className="mx-2 text-zinc-300">•</span>
                  {course._count?.enrollments ?? 0} студентов
                </p>
              </div>
            </div>
            <button
              onClick={() => setCourseFormOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white transition-all bg-gradient-to-r from-indigo-500 to-violet-600 rounded-xl hover:from-indigo-600 hover:to-violet-700 active:scale-[0.97] shadow-lg shadow-indigo-200"
            >
              <FiEdit2 size={15} />
              Редактировать курс
            </button>
          </div>
        </div>

        {/* Modules */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-violet-600 rounded-full"></div>
            <h2 className="text-sm font-bold text-zinc-800 uppercase tracking-wider">Модули и уроки</h2>
          </div>
          <button
            onClick={openAddModule}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-indigo-600 transition-all border border-indigo-200 bg-white rounded-xl hover:bg-indigo-50 active:scale-[0.97]"
          >
            <FiPlus size={14} />
            Добавить модуль
          </button>
        </div>

        {course.modules?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white border border-zinc-200 border-dashed rounded-2xl">
            <div className="flex items-center justify-center w-14 h-14 mb-4 bg-indigo-50 rounded-2xl">
              <FiLayers className="text-indigo-300" size={24} />
            </div>
            <p className="text-sm font-semibold text-zinc-500">Модулей пока нет</p>
            <p className="text-xs text-zinc-400 mt-1">Добавьте первый модуль, чтобы начать наполнять курс</p>
          </div>
        ) : (
          <div className="space-y-5">
            {course.modules.map((module) => (
              <div key={module.id} className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-zinc-50 to-indigo-50/30 border-b border-zinc-100">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-zinc-200 text-xs font-bold text-indigo-600">
                      {module.order}
                    </span>
                    <h3 className="text-sm font-bold text-zinc-900">{module.title}</h3>
                    <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">
                      {module.lessons.length} уроков
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEditModule(module)} className="p-2 text-zinc-400 hover:text-indigo-600 transition-colors" title="Редактировать">
                      <FiEdit2 size={15} />
                    </button>
                    <button onClick={() => deleteModule(module)} className="p-2 text-zinc-300 hover:text-red-600 transition-colors" title="Удалить">
                      <FiTrash2 size={15} />
                    </button>
                  </div>
                </div>

                <div className="divide-y divide-zinc-50">
                  {module.lessons.map((lesson) => (
                    <div key={lesson.id} className="flex items-center gap-4 px-6 py-4 hover:bg-indigo-50/30 transition-colors">
                      <span className={`flex items-center justify-center w-9 h-9 rounded-xl ${KIND_COLORS[lesson.kind]}`}>
                        {lesson.kind === 'VIDEO' ? <FiPlayCircle size={16} /> : <FiCheck size={16} />}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-zinc-800 truncate">{lesson.title}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${KIND_COLORS[lesson.kind]}`}>
                            {KIND_LABELS[lesson.kind]}
                          </span>
                          {lesson.video && (
                            <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider bg-zinc-100 text-zinc-600">
                              {lesson.video.provider === 'YOUTUBE' ? <FiYoutube size={10} /> : <FiVideo size={10} />}
                              {lesson.video.provider === 'YOUTUBE' ? 'YouTube' : lesson.video.sourcePath || 'Видео'}
                            </span>
                          )}
                          {lesson.isFreePreview && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider bg-emerald-50 text-emerald-600">
                              Превью
                            </span>
                          )}
                          {lesson.durationSec > 0 && (
                            <span className="text-[10px] text-zinc-400 font-medium">{Math.round(lesson.durationSec / 60)} мин</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => openVideoEditor(lesson)} className="p-2 text-zinc-400 hover:text-indigo-600 transition-colors" title="Видео">
                          <FiVideo size={15} />
                        </button>
                        <button onClick={() => openEditLesson(module.id, lesson)} className="p-2 text-zinc-400 hover:text-indigo-600 transition-colors" title="Редактировать">
                          <FiEdit2 size={15} />
                        </button>
                        <button onClick={() => deleteLesson(lesson)} className="p-2 text-zinc-300 hover:text-red-600 transition-colors" title="Удалить">
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="px-6 py-4 bg-zinc-50/50 border-t border-zinc-100">
                  <button
                    onClick={() => openAddLesson(module.id)}
                    className="flex items-center gap-2 text-xs font-bold text-indigo-600 transition-colors hover:text-indigo-800"
                  >
                    <FiPlus size={14} />
                    Добавить урок
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Course edit form */}
      <AcademyCourseForm
        open={courseFormOpen}
        initial={course}
        onClose={() => setCourseFormOpen(false)}
        onSaved={fetchCourse}
      />

      {/* Module modal */}
      {moduleModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-800">
                {moduleModal.mode === 'edit' ? 'Редактировать модуль' : 'Новый модуль'}
              </h3>
              <button onClick={() => setModuleModal(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={saveModule} className="p-7 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Название</label>
                <input value={moduleTitle} onChange={(e) => setModuleTitle(e.target.value)} required placeholder="Введение в курс" className="w-full border-b border-gray-200 py-2.5 focus:border-indigo-400 outline-none transition-colors bg-transparent" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setModuleModal(null)} className="px-6 py-3 border border-gray-200 text-gray-500 text-xs uppercase tracking-widest font-bold hover:bg-gray-50 transition-all rounded-xl">
                  Отмена
                </button>
                <button type="submit" disabled={moduleSaving} className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-xs uppercase tracking-widest font-bold rounded-xl shadow-md shadow-indigo-200 disabled:opacity-50">
                  {moduleSaving ? <FiLoader className="animate-spin" /> : <FiSave size={14} />}
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lesson modal */}
      {lessonModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-800">
                {lessonModal.mode === 'edit' ? 'Редактировать урок' : 'Новый урок'}
              </h3>
              <button onClick={() => setLessonModal(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={saveLesson} className="p-7 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Название</label>
                <input value={lessonForm.title} onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} required placeholder="Урок 1: Переменные" className="w-full border-b border-gray-200 py-2.5 focus:border-indigo-400 outline-none transition-colors bg-transparent" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Тип урока</label>
                <select value={lessonForm.kind} onChange={(e) => setLessonForm({ ...lessonForm, kind: e.target.value })} className="w-full border-b border-gray-200 py-2.5 focus:border-indigo-400 outline-none transition-colors bg-transparent cursor-pointer">
                  {Object.keys(KIND_LABELS).map((k) => <option key={k} value={k}>{KIND_LABELS[k]}</option>)}
                </select>
              </div>
              <label className="flex items-center gap-3 p-4 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                <input type="checkbox" checked={lessonForm.isFreePreview} onChange={(e) => setLessonForm({ ...lessonForm, isFreePreview: e.target.checked })} className="accent-indigo-600 w-4 h-4" />
                <span className="text-sm font-semibold text-gray-800">Бесплатное превью</span>
              </label>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setLessonModal(null)} className="px-6 py-3 border border-gray-200 text-gray-500 text-xs uppercase tracking-widest font-bold hover:bg-gray-50 transition-all rounded-xl">
                  Отмена
                </button>
                <button type="submit" disabled={lessonSaving} className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-xs uppercase tracking-widest font-bold rounded-xl shadow-md shadow-indigo-200 disabled:opacity-50">
                  {lessonSaving ? <FiLoader className="animate-spin" /> : <FiSave size={14} />}
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Video modal */}
      {videoModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-violet-50/40">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-800">Видео урока</h3>
                <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[380px]">{videoModal.title}</p>
              </div>
              <button onClick={() => setVideoModal(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <FiX size={20} />
              </button>
            </div>

            <div className="p-7 space-y-5 overflow-y-auto">
              {/* Provider toggle */}
              <div className="flex p-1 bg-zinc-100 rounded-xl">
                <button
                  onClick={() => setVideoForm({ ...videoForm, provider: 'HOSTINGER' })}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${
                    videoForm.provider === 'HOSTINGER' ? 'bg-white text-indigo-600 shadow' : 'text-zinc-500 hover:text-zinc-700'
                  }`}
                >
                  <FiVideo size={14} />
                  Media server
                </button>
                <button
                  onClick={() => setVideoForm({ ...videoForm, provider: 'YOUTUBE' })}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${
                    videoForm.provider === 'YOUTUBE' ? 'bg-white text-indigo-600 shadow' : 'text-zinc-500 hover:text-zinc-700'
                  }`}
                >
                  <FiYoutube size={14} />
                  YouTube
                </button>
              </div>

              {videoForm.provider === 'HOSTINGER' ? (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Путь к файлу (sourcePath)</label>
                    <input value={videoForm.sourcePath} onChange={(e) => setVideoForm({ ...videoForm, sourcePath: e.target.value })} required placeholder="academy/js/lesson-1.mp4" className="w-full border-b border-gray-200 py-2.5 focus:border-indigo-400 outline-none transition-colors bg-transparent" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Путь к обложке (posterPath)</label>
                    <input value={videoForm.posterPath} onChange={(e) => setVideoForm({ ...videoForm, posterPath: e.target.value })} placeholder="academy/js/lesson-1.jpg" className="w-full border-b border-gray-200 py-2.5 focus:border-indigo-400 outline-none transition-colors bg-transparent" />
                  </div>
                </>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">YouTube ссылка</label>
                  <input value={videoForm.youtubeUrl} onChange={(e) => setVideoForm({ ...videoForm, youtubeUrl: e.target.value })} required placeholder="https://youtu.be/dQw4w9WgXcQ" className="w-full border-b border-gray-200 py-2.5 focus:border-indigo-400 outline-none transition-colors bg-transparent" />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Длительность (секунд)</label>
                <input type="number" min="0" value={videoForm.durationSec} onChange={(e) => setVideoForm({ ...videoForm, durationSec: e.target.value })} placeholder="612" className="w-full border-b border-gray-200 py-2.5 focus:border-indigo-400 outline-none transition-colors bg-transparent" />
              </div>
            </div>

            <div className="flex justify-between gap-3 p-7 pt-0">
              {videoModal.video && (
                <button onClick={removeVideo} className="flex items-center gap-2 px-5 py-3 border border-red-200 text-red-500 text-xs uppercase tracking-widest font-bold hover:bg-red-50 transition-all rounded-xl">
                  <FiTrash2 size={14} />
                  Удалить
                </button>
              )}
              <div className="flex-1" />
              <button onClick={() => setVideoModal(null)} className="px-6 py-3 border border-gray-200 text-gray-500 text-xs uppercase tracking-widest font-bold hover:bg-gray-50 transition-all rounded-xl">
                Отмена
              </button>
              <button onClick={saveVideo} disabled={videoSaving} className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-xs uppercase tracking-widest font-bold rounded-xl shadow-md shadow-indigo-200 disabled:opacity-50">
                {videoSaving ? <FiLoader className="animate-spin" /> : <FiSave size={14} />}
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}