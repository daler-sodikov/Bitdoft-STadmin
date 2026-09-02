import { useEffect, useState } from 'react';
import academyApi, { withRetry } from '../../api/academyApi';
import { FiX, FiUserPlus, FiLoader, FiCheck, FiCopy, FiBookOpen } from 'react-icons/fi';

const normalizePhone = (value) => (value || '').replace(/\D/g, '');
const isValidPhone = (digits) => digits.length >= 5 && digits.length <= 20;

export default function AcademyStudentForm({ open, onClose, onSaved }) {
  const [form, setForm] = useState({ name: '', phone: '', courseIds: [] });
  const [courses, setCourses] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setForm({ name: '', phone: '', courseIds: [] });
    setResult(null);
    setError('');
    fetchCourses();
  }, [open]);

  const fetchCourses = async () => {
    try {
      const res = await academyApi.get('/admin/courses');
      setCourses(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch {
      setCourses([]);
    }
  };

  const toggleCourse = (courseId) => {
    setForm((f) => ({
      ...f,
      courseIds: f.courseIds.includes(courseId)
        ? f.courseIds.filter((id) => id !== courseId)
        : [...f.courseIds, courseId],
    }));
  };

  const copyPassword = () => {
    if (result?.password) navigator.clipboard?.writeText(result.password);
  };

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
    console.error('Save student error:', err);
    return `${hint}: ${err.message || ''}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const phone = normalizePhone(form.phone);
    const name = form.name.trim();

    if (name.length < 2) {
      setError('Имя должно содержать минимум 2 символа');
      setLoading(false);
      return;
    }
    if (!isValidPhone(phone)) {
      setError('Некорректный номер телефона');
      setLoading(false);
      return;
    }

    try {
      const res = await withRetry(() => academyApi.post('/admin/students', {
        name,
        phone,
        groupIds: [],
      }));
      const data = res.data?.data ?? {};
      const studentId = data.student?.id;

      if (studentId && form.courseIds.length > 0) {
        await withRetry(() => academyApi.post(`/admin/students/${studentId}/access`, {
          courseIds: form.courseIds,
        }));
      }

      onSaved();
      setResult({
        name: data.student?.name || name,
        created: data.created,
        promoted: data.promoted,
        password: data.password || null,
        coursesCourses: form.courseIds.length,
      });
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-gray-100 max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-indigo-50/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200">
              <FiUserPlus size={18} className="text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest">Новый студент</h3>
              <p className="text-xs text-gray-400 mt-0.5">Онлайн академия</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <FiX size={20} />
          </button>
        </div>

        {result ? (
          <div className="p-8 flex flex-col items-center text-center">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 ${result.created ? 'bg-emerald-50 text-emerald-500' : 'bg-indigo-50 text-indigo-500'}`}>
              <FiCheck size={30} />
            </div>
            <h4 className="text-lg font-bold text-gray-900">
              {result.created ? 'Студент зарегистрирован' : result.promoted ? 'Аккаунт конвертирован' : 'Данные обновлены'}
            </h4>
            <p className="text-sm text-gray-500 mt-1">{result.name}</p>
            {result.coursesCourses > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                Открыто курсов: <span className="font-bold text-gray-800">{result.coursesCourses}</span>
              </p>
            )}

            {result.password && (
              <div className="w-full mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-5">
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">Пароль для входа в приложение</p>
                <div className="flex items-center justify-between gap-4 bg-white border border-amber-200 rounded-xl px-4 py-3">
                  <code className="text-sm font-mono font-bold text-gray-900 break-all">{result.password}</code>
                  <button onClick={copyPassword} className="text-amber-600 hover:text-amber-800 transition-colors shrink-0" title="Скопировать">
                    <FiCopy size={16} />
                  </button>
                </div>
                <p className="text-[11px] text-amber-600/80 mt-2">Сохраните пароль и передайте студенту — он больше не будет показан.</p>
              </div>
            )}

            <button onClick={onClose} className="mt-8 px-10 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-xs uppercase tracking-widest font-bold rounded-xl shadow-md shadow-indigo-200 hover:from-indigo-600 hover:to-violet-700 transition-all">
              Готово
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-7 overflow-y-auto space-y-5">
            {error && (
              <div className="px-4 py-3 text-sm font-medium bg-rose-50 border border-rose-100 text-rose-600 rounded-xl">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Имя студента</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Иван Иванов" className="w-full border-b border-gray-200 py-2.5 focus:border-indigo-400 outline-none transition-colors bg-transparent" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Телефон</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required placeholder="+998 90 123 45 67" className="w-full border-b border-gray-200 py-2.5 focus:border-indigo-400 outline-none transition-colors bg-transparent" />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Курсы</label>
                <span className="text-[11px] font-bold text-indigo-500">{form.courseIds.length} выбрано</span>
              </div>
              {courses.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-gray-400 italic border border-dashed border-gray-200 rounded-xl">
                  Курсов пока нет — создайте в разделе «Курсы»
                </div>
              ) : (
                <div className="max-h-56 overflow-y-auto border border-gray-100 rounded-xl divide-y divide-gray-50">
                  {courses.map((course) => {
                    const active = form.courseIds.includes(course.id);
                    return (
                      <button
                        key={course.id}
                        type="button"
                        onClick={() => toggleCourse(course.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 transition-all text-left ${
                          active ? 'bg-indigo-50/70' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${active ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-white border-gray-200 text-indigo-400'}`}>
                          <FiBookOpen size={15} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-bold truncate ${active ? 'text-indigo-700' : 'text-gray-800'}`}>{course.title}</p>
                          <p className="text-[11px] text-gray-400">
                            {course.level} · {course.lessonCount} уроков
                          </p>
                        </div>
                        <span className={`w-4 h-4 rounded-md border-2 shrink-0 ${active ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'} flex items-center justify-center`}>
                          {active && <FiCheck size={10} className="text-white" />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-2">
              <button type="button" onClick={onClose} className="px-6 py-3 border border-gray-200 text-gray-500 text-xs uppercase tracking-widest font-bold hover:bg-gray-50 transition-all rounded-xl">
                Отмена
              </button>
              <button type="submit" disabled={loading} className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-xs uppercase tracking-widest font-bold rounded-xl shadow-md shadow-indigo-200 hover:from-indigo-600 hover:to-violet-700 disabled:opacity-50">
                {loading ? <FiLoader className="animate-spin" /> : <FiUserPlus size={14} />}
                Зарегистрировать
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}