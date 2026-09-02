import { useEffect, useState } from 'react';
import academyApi, { withRetry } from '../../api/academyApi';
import { FiX, FiSave, FiLoader } from 'react-icons/fi';

const TRACKS = ['FRONTEND', 'BACKEND', 'FULLSTACK', 'MOBILE', 'GERMANLANUAGE'];
const LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

const TRANSLIT = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'zh', з: 'z',
  и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
  с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch',
  ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
  А: 'a', Б: 'b', В: 'v', Г: 'g', Д: 'd', Е: 'e', Ё: 'yo', Ж: 'zh', З: 'z',
  И: 'i', Й: 'y', К: 'k', Л: 'l', М: 'm', Н: 'n', О: 'o', П: 'p', Р: 'r',
  С: 's', Т: 't', У: 'u', Ф: 'f', Х: 'h', Ц: 'ts', Ч: 'ch', Ш: 'sh', Щ: 'sch',
  Ъ: '', Ы: 'y', Ь: '', Э: 'e', Ю: 'yu', Я: 'ya',
};

const slugify = (input) =>
  String(input || '')
    .replace(/[а-яёА-ЯЁ]/g, (c) => TRANSLIT[c] ?? c)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const extractError = (err) => {
  if (err.response) {
    const data = err.response?.data?.error;
    const issue = data?.details?.issues?.[0]?.message;
    return issue || data?.message || `Ошибка сервера (${err.response.status})`;
  }
  const hint =
    err.code === 'ECONNABORTED'
      ? 'Превышено время ожидания ответа от сервера'
      : 'Нет связи с сервером — проверьте соединение';
  console.error('Save course error:', err);
  return `${hint}: ${err.message || ''}`;
};

const emptyForm = {
  slug: '',
  title: '',
  subtitle: '',
  description: '',
  coverImageUrl: '',
  track: '',
  level: 'BEGINNER',
  studentOnly: false,
};

export default function AcademyCourseForm({ open, initial, onClose, onSaved }) {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setError('');
      setForm(initial ? {
        slug: initial.slug || '',
        title: initial.title || '',
        subtitle: initial.subtitle || '',
        description: initial.description || '',
        coverImageUrl: initial.coverImageUrl || '',
        track: initial.track || '',
        level: initial.level || 'BEGINNER',
        studentOnly: Boolean(initial.studentOnly),
      } : emptyForm);
    }
  }, [open, initial]);

  if (!open) return null;

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const slug = slugify(form.slug || form.title);
      const payload = {
        slug,
        title: form.title,
        subtitle: form.subtitle || null,
        description: form.description,
        coverImageUrl: form.coverImageUrl || null,
        track: form.track || null,
        level: form.level,
      };
      if (!slug) {
        setError('Заголовок не даёт валидный slug — укажите slug вручную');
        return;
      }
      if (initial?.id) {
        await withRetry(() => academyApi.patch(`/admin/courses/${initial.id}`, payload));
      } else {
        await withRetry(() => academyApi.post('/admin/courses', payload));
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-gray-100 max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-violet-50/40">
          <div>
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest">
              {initial?.id ? 'Редактировать курс' : 'Новый курс'}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Онлайн академия</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-7 overflow-y-auto space-y-5">
          {error && (
            <div className="px-4 py-3 text-sm font-medium bg-rose-50 border border-rose-100 text-rose-600 rounded-xl">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Заголовок</label>
              <input value={form.title} onChange={(e) => update('title', e.target.value)} required placeholder="Введение в JavaScript" className="w-full border-b border-gray-200 py-2.5 focus:border-indigo-400 outline-none transition-colors bg-transparent" />
            </div>

            {/* <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Slug</label>
              <input value={form.slug} onChange={(e) => update('slug', e.target.value)} placeholder="Автоматически из заголовка" className="w-full border-b border-gray-200 py-2.5 focus:border-indigo-400 outline-none transition-colors bg-transparent" />
            </div> */}

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Подзаголовок</label>
              <input value={form.subtitle} onChange={(e) => update('subtitle', e.target.value)} placeholder="Необязательный короткий текст" className="w-full border-b border-gray-200 py-2.5 focus:border-indigo-400 outline-none transition-colors bg-transparent" />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Описание</label>
              <textarea value={form.description} onChange={(e) => update('description', e.target.value)} required rows={3} placeholder="Что узнает студент..." className="w-full border-b border-gray-200 py-2.5 focus:border-indigo-400 outline-none transition-colors bg-transparent resize-none" />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Обложка (URL)</label>
              <input value={form.coverImageUrl} onChange={(e) => update('coverImageUrl', e.target.value)} placeholder="https://..." className="w-full border-b border-gray-200 py-2.5 focus:border-indigo-400 outline-none transition-colors bg-transparent" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Направление</label>
              <select value={form.track} onChange={(e) => update('track', e.target.value)} className="w-full border-b border-gray-200 py-2.5 focus:border-indigo-400 outline-none transition-colors bg-transparent cursor-pointer">
                <option value="">Без направления</option>
                {TRACKS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Уровень</label>
              <select value={form.level} onChange={(e) => update('level', e.target.value)} className="w-full border-b border-gray-200 py-2.5 focus:border-indigo-400 outline-none transition-colors bg-transparent cursor-pointer">
                {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          {/* <label className="flex items-center gap-3 p-4 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
            <input type="checkbox" checked={form.studentOnly} onChange={(e) => update('studentOnly', e.target.checked)} className="accent-indigo-600 w-4 h-4" />
            <div>
              <p className="text-sm font-semibold text-gray-800">Только для студентов</p>
              <p className="text-xs text-gray-400">Скрыть курс от аккаунтов ACADEMY</p>
            </div>
          </label> */}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-6 py-3 border border-gray-200 text-gray-500 text-xs uppercase tracking-widest font-bold hover:bg-gray-50 transition-all rounded-xl">
              Отмена
            </button>
            <button type="submit" disabled={loading} className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-xs uppercase tracking-widest font-bold hover:from-indigo-600 hover:to-violet-700 transition-all flex items-center justify-center gap-2 rounded-xl shadow-md shadow-indigo-200 disabled:opacity-50">
              {loading ? <FiLoader className="animate-spin" /> : <FiSave size={14} />}
              {initial?.id ? 'Сохранить' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}