import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FiLoader,
  FiPlus,
  FiTrash2,
  FiX,
  FiAlertCircle,
  FiChevronLeft,
  FiVideo,
  FiFileText,
  FiSave,
} from 'react-icons/fi';
import academyAdmin from '../../api/academyAdmin';

const inputCls =
  'w-full bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none text-sm font-semibold transition-all';
const labelCls = 'text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2';

export default function AcademyCourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [moduleTitle, setModuleTitle] = useState('');
  const [lessonModal, setLessonModal] = useState(null); // { moduleId }
  const [videoModal, setVideoModal] = useState(null); // { lesson }

  const fetchCourse = useCallback(async () => {
    setLoading(true);
    try {
      setCourse(await academyAdmin.getCourse(id));
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Не удалось загрузить курс');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  const addModule = async (e) => {
    e.preventDefault();
    if (!moduleTitle.trim()) return;
    try {
      await academyAdmin.createModule(id, { title: moduleTitle.trim() });
      setModuleTitle('');
      fetchCourse();
    } catch (err) {
      alert(err.response?.data?.message || 'Не удалось создать модуль');
    }
  };

  const deleteModule = async (moduleId) => {
    if (!window.confirm('Удалить модуль вместе с его уроками?')) return;
    try {
      await academyAdmin.deleteModule(moduleId);
      fetchCourse();
    } catch (err) {
      alert(err.response?.data?.message || 'Не удалось удалить модуль');
    }
  };

  const deleteLesson = async (lessonId) => {
    if (!window.confirm('Удалить урок?')) return;
    try {
      await academyAdmin.deleteLesson(lessonId);
      fetchCourse();
    } catch (err) {
      alert(err.response?.data?.message || 'Не удалось удалить урок');
    }
  };

  if (loading) {
    return (
      <div className="py-32 text-center">
        <FiLoader className="animate-spin mx-auto text-indigo-400" size={28} />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="py-32 text-center text-gray-400">
        <FiAlertCircle className="mx-auto mb-3 text-gray-300" size={32} />
        <p className="text-sm font-semibold">{error || 'Курс не найден'}</p>
      </div>
    );
  }

  return (
    <div className="font-[Inter] text-gray-700">
      <button
        onClick={() => navigate('/academy/courses')}
        className="flex items-center gap-1 text-xs font-bold text-gray-400 uppercase tracking-wider hover:text-indigo-600 mb-6"
      >
        <FiChevronLeft size={16} /> К списку курсов
      </button>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{course.title}</h1>
        <p className="text-sm text-gray-500 mt-1">{course.description}</p>
      </div>

      <form onSubmit={addModule} className="flex gap-3 mb-6">
        <input
          className={inputCls}
          placeholder="Название нового модуля"
          value={moduleTitle}
          onChange={(e) => setModuleTitle(e.target.value)}
        />
        <button
          type="submit"
          className="flex items-center gap-2 px-6 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest shrink-0"
        >
          <FiPlus size={16} /> Модуль
        </button>
      </form>

      <div className="space-y-4">
        {course.modules?.map((module) => (
          <div key={module.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-sm font-bold text-gray-800">{module.title}</h3>
              <div className="flex gap-1">
                <button
                  onClick={() => setLessonModal({ moduleId: module.id })}
                  className="flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl text-xs font-bold uppercase"
                >
                  <FiPlus size={14} /> Урок
                </button>
                <button
                  onClick={() => deleteModule(module.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl"
                >
                  <FiTrash2 size={15} />
                </button>
              </div>
            </div>

            <div className="divide-y divide-gray-50">
              {module.lessons?.length === 0 && (
                <p className="px-6 py-6 text-center text-xs text-gray-400">В модуле пока нет уроков</p>
              )}
              {module.lessons?.map((lesson) => (
                <div key={lesson.id} className="flex items-center justify-between px-6 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400">
                      {lesson.kind === 'VIDEO' ? <FiVideo size={15} /> : <FiFileText size={15} />}
                    </span>
                    <div>
                      <div className="text-sm font-semibold text-gray-800">{lesson.title}</div>
                      <div className="text-[11px] text-gray-400">
                        {lesson.kind}
                        {lesson.kind === 'VIDEO' && (lesson.video ? ' · видео добавлено' : ' · без видео')}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setVideoModal({ lesson })}
                      className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl"
                      title="Видео урока"
                    >
                      <FiVideo size={15} />
                    </button>
                    <button
                      onClick={() => deleteLesson(lesson.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl"
                    >
                      <FiTrash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {course.modules?.length === 0 && (
          <div className="py-16 text-center text-gray-400 text-sm bg-white border border-gray-100 rounded-2xl">
            Добавьте первый модуль, чтобы наполнить курс
          </div>
        )}
      </div>

      {lessonModal && (
        <LessonModal
          moduleId={lessonModal.moduleId}
          onClose={() => setLessonModal(null)}
          onSaved={() => {
            setLessonModal(null);
            fetchCourse();
          }}
        />
      )}

      {videoModal && (
        <VideoModal
          lesson={videoModal.lesson}
          onClose={() => setVideoModal(null)}
          onSaved={() => {
            setVideoModal(null);
            fetchCourse();
          }}
        />
      )}
    </div>
  );
}

function LessonModal({ moduleId, onClose, onSaved }) {
  const [title, setTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const lesson = await academyAdmin.createLesson(moduleId, { title, kind: 'VIDEO' });
      if (videoUrl.trim()) {
        await academyAdmin.setLessonVideo(lesson.id, {
          provider: 'YOUTUBE',
          youtubeUrl: videoUrl.trim(),
        });
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Не удалось создать урок');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-[2px]">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-gray-100">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Новый урок</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FiX size={20} />
          </button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div>
            <label className={labelCls}>Название урока</label>
            <input required className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Ссылка на видео (необязательно)</label>
            <input
              type="url"
              className={inputCls}
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>

          {error && (
            <p className="text-xs font-semibold text-red-600 flex items-center gap-2">
              <FiAlertCircle size={14} /> {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 text-xs font-bold text-gray-500 uppercase hover:bg-gray-50 rounded-xl">
              Отмена
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-indigo-500 to-violet-600 text-white py-2 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center"
            >
              {saving ? <FiLoader className="animate-spin" size={16} /> : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function VideoModal({ lesson, onClose, onSaved }) {
  const existing = lesson.video;
  const [provider, setProvider] = useState(existing?.provider === 'HOSTINGER' ? 'HOSTINGER' : 'YOUTUBE');
  const [youtubeUrl, setYoutubeUrl] = useState(existing?.youtubeVideoId || '');
  const [sourcePath, setSourcePath] = useState(existing?.sourcePath || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await academyAdmin.setLessonVideo(lesson.id, {
        provider,
        ...(provider === 'YOUTUBE' ? { youtubeUrl } : { sourcePath }),
      });
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка сохранения видео');
    } finally {
      setSaving(false);
    }
  };

  const removeVideo = async () => {
    if (!window.confirm('Удалить видео у этого урока?')) return;
    setSaving(true);
    try {
      await academyAdmin.deleteLessonVideo(lesson.id);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Не удалось удалить видео');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-[2px]">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-gray-100">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Видео урока</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FiX size={20} />
          </button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div>
            <label className={labelCls}>Источник</label>
            <select className={`${inputCls} cursor-pointer`} value={provider} onChange={(e) => setProvider(e.target.value)}>
              <option value="YOUTUBE">YouTube</option>
              <option value="HOSTINGER">Свой медиа-сервер</option>
            </select>
          </div>

          {provider === 'YOUTUBE' ? (
            <div>
              <label className={labelCls}>Ссылка или ID YouTube-видео</label>
              <input
                required
                className={inputCls}
                placeholder="https://youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
              />
            </div>
          ) : (
            <div>
              <label className={labelCls}>Путь к файлу на медиа-сервере</label>
              <input
                required
                className={inputCls}
                placeholder="courses/react/lesson-1.mp4"
                value={sourcePath}
                onChange={(e) => setSourcePath(e.target.value)}
              />
            </div>
          )}

          {error && (
            <p className="text-xs font-semibold text-red-600 flex items-center gap-2">
              <FiAlertCircle size={14} /> {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            {existing && (
              <button
                type="button"
                onClick={removeVideo}
                disabled={saving}
                className="px-4 py-2 text-xs font-bold text-red-500 uppercase hover:bg-red-50 rounded-xl"
              >
                Удалить видео
              </button>
            )}
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 text-xs font-bold text-gray-500 uppercase hover:bg-gray-50 rounded-xl">
              Отмена
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-indigo-500 to-violet-600 text-white py-2 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2"
            >
              {saving ? <FiLoader className="animate-spin" size={16} /> : <><FiSave size={14} /> Сохранить</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
