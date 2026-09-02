import React, { useCallback, useEffect, useState } from 'react';
import {
  FiLoader,
  FiSearch,
  FiUserPlus,
  FiX,
  FiAlertCircle,
  FiKey,
  FiChevronLeft,
  FiChevronRight,
  FiTrash2,
} from 'react-icons/fi';
import academyAdmin from '../../api/academyAdmin';
import { COUNTRIES, DEFAULT_COUNTRY, dialFor } from '../../data/countries';

const inputCls =
  'w-full bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none text-sm font-semibold transition-all';
const labelCls = 'text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2';

const TYPE_LABEL = {
  STUDENT: { text: 'Офлайн студент', className: 'bg-indigo-50 text-indigo-600' },
  ACADEMY: { text: 'Академия', className: 'bg-violet-50 text-violet-600' },
};

export default function AcademyStudents() {
  const [type, setType] = useState('ACADEMY');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], total: 0, pageCount: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [accessStudent, setAccessStudent] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setData(
        await academyAdmin.listUsers({
          ...(type ? { type } : {}),
          ...(search ? { search } : {}),
          page,
          pageSize: 20,
        }),
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Не удалось загрузить пользователей');
    } finally {
      setLoading(false);
    }
  }, [type, search, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleType = async (student) => {
    const next = student.accountType === 'STUDENT' ? 'ACADEMY' : 'STUDENT';
    if (!window.confirm(`Изменить тип аккаунта на «${TYPE_LABEL[next].text}»?`)) return;
    try {
      await academyAdmin.setAccountType(student.id, next);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Не удалось изменить тип');
    }
  };

  return (
    <div className="font-[Inter] text-gray-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Академия — Пользователи</h1>
          <p className="text-sm text-gray-500 mt-1">
            Аккаунты для онлайн-обучения: вход по номеру телефона и паролю
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-md shadow-indigo-200 hover:from-indigo-600 hover:to-violet-700 active:scale-95"
        >
          <FiUserPlus size={16} /> Добавить студента
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            className={`${inputCls} pl-11`}
            placeholder="Поиск по имени или номеру"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <select
          className={`${inputCls} sm:max-w-[16rem] cursor-pointer`}
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            setPage(1);
          }}
        >
          <option value="ACADEMY">Только академия</option>
          <option value="STUDENT">Только офлайн студенты</option>
          <option value="">Все аккаунты</option>
        </select>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-lg shadow-gray-100/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Студент</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Телефон</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Тип</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Курсы</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-20 text-center">
                    <FiLoader className="animate-spin mx-auto text-indigo-400" size={24} />
                  </td>
                </tr>
              ) : (
                data.items.map((student) => {
                  const label = TYPE_LABEL[student.accountType] || TYPE_LABEL.STUDENT;
                  return (
                    <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-800 text-sm">{student.name}</div>
                        {student.role === 'ADMIN' && (
                          <div className="text-[11px] text-amber-600 font-bold uppercase">Админ</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-500">{student.phone || '—'}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleType(student)}
                          className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${label.className}`}
                          title="Нажмите, чтобы изменить тип"
                        >
                          {label.text}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-gray-500">
                        {student._count?.academyAccess ?? 0} выдано
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end">
                          <button
                            onClick={() => setAccessStudent(student)}
                            className="flex items-center gap-2 px-4 py-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all text-xs font-bold uppercase"
                          >
                            <FiKey size={14} /> Доступ
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

        {!loading && data.items.length === 0 && (
          <div className="py-20 text-center text-gray-400 text-sm font-medium">
            {error ? (
              <p className="text-red-500 font-semibold flex items-center justify-center gap-2">
                <FiAlertCircle size={16} /> {error}
              </p>
            ) : (
              <p>Пользователи не найдены</p>
            )}
          </div>
        )}

        {data.pageCount > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <span className="text-xs font-semibold text-gray-400">
              Страница {page} из {data.pageCount} · всего {data.total}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl disabled:opacity-40"
              >
                <FiChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(data.pageCount, p + 1))}
                disabled={page >= data.pageCount}
                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl disabled:opacity-40"
              >
                <FiChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {createOpen && (
        <CreateStudentModal
          onClose={() => setCreateOpen(false)}
          onSaved={() => {
            setCreateOpen(false);
            fetchUsers();
          }}
        />
      )}

      {accessStudent && (
        <StudentAccessModal student={accessStudent} onClose={() => setAccessStudent(null)} />
      )}
    </div>
  );
}

function CreateStudentModal({ onClose, onSaved }) {
  const [country, setCountry] = useState(DEFAULT_COUNTRY);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const localNumber = phone.trim().replace(/^0+/, '');

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      // Stored with the country code — the backend keeps digits only, and the
      // student logs into the app with this same full number.
      await academyAdmin.createStudent({
        name,
        phone: `${dialFor(country)}${localNumber}`,
        password,
      });
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при добавлении');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-[2px]">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl border border-gray-100 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Добавить студента</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FiX size={20} />
          </button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div>
            <label className={labelCls}>Телефон</label>
            <div className="flex gap-2">
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="bg-gray-50 px-3 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none text-sm font-semibold transition-all cursor-pointer max-w-[9.5rem]"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.dial} {c.name}
                  </option>
                ))}
              </select>
              <input
                required
                inputMode="tel"
                className={inputCls}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="911391022"
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-1.5">
              Сохранится как {dialFor(country)}{localNumber || '…'}
            </p>
          </div>

          <div>
            <label className={labelCls}>Имя</label>
            <input required className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div>
            <label className={labelCls}>Пароль для входа</label>
            <input
              required
              minLength={4}
              className={inputCls}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Минимум 4 символа"
            />
            <p className="text-[11px] text-gray-400 mt-1.5">
              Студент входит в приложение по номеру телефона и этому паролю
            </p>
          </div>

          {error && (
            <p className="text-xs font-semibold text-red-600 flex items-center gap-2">
              <FiAlertCircle size={14} /> {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-xs font-bold text-gray-500 uppercase hover:bg-gray-50 rounded-xl"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-indigo-500 to-violet-600 text-white py-2 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center"
            >
              {saving ? <FiLoader className="animate-spin" size={16} /> : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StudentAccessModal({ student, onClose }) {
  const [access, setAccess] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState([]);
  const [granting, setGranting] = useState(false);
  const [error, setError] = useState('');

  const fetchAccess = useCallback(async () => {
    setLoading(true);
    try {
      setAccess(await academyAdmin.listStudentAccess(student.id));
    } catch (err) {
      setError(err.response?.data?.message || 'Не удалось загрузить доступы');
    } finally {
      setLoading(false);
    }
  }, [student.id]);

  useEffect(() => {
    fetchAccess();
    academyAdmin.listCourses('PUBLISHED').then(setCourses).catch(() => {});
  }, [fetchAccess]);

  const grantedIds = new Set(access.map((a) => a.course.id));
  const availableCourses = courses.filter((c) => !grantedIds.has(c.id));

  const toggleCourse = (id) => {
    setSelectedCourseIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const handleGrant = async () => {
    if (selectedCourseIds.length === 0) return;
    setGranting(true);
    setError('');
    try {
      await academyAdmin.grantStudentAccess(student.id, { courseIds: selectedCourseIds });
      setSelectedCourseIds([]);
      fetchAccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Не удалось выдать доступ');
    } finally {
      setGranting(false);
    }
  };

  const handleRevoke = async (courseId) => {
    if (!window.confirm('Закрыть доступ к этому курсу?')) return;
    try {
      await academyAdmin.revokeStudentAccess(student.id, courseId);
      fetchAccess();
    } catch (err) {
      alert(err.response?.data?.message || 'Не удалось отозвать доступ');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-[2px]">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl border border-gray-100 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <div>
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Доступ к курсам</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {student.name} · {student.phone}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FiX size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Уже выдано</h4>
            {loading ? (
              <FiLoader className="animate-spin text-indigo-400 mx-auto" size={20} />
            ) : access.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">Нет доступа ни к одному курсу</p>
            ) : (
              <div className="divide-y divide-gray-50 border border-gray-100 rounded-xl">
                {access.map((grant) => (
                  <div key={grant.id} className="flex items-center justify-between px-4 py-2.5">
                    <div>
                      <div className="text-sm font-semibold text-gray-700">{grant.course.title}</div>
                      <div className="text-[11px] text-gray-400">
                        {grant.active ? 'активен' : 'истёк'}
                        {grant.expiresAt
                          ? ` · до ${new Date(grant.expiresAt).toLocaleDateString('ru-RU')}`
                          : ''}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRevoke(grant.course.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <FiTrash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Выдать новый доступ</h4>
            <div className="max-h-40 overflow-y-auto border border-gray-100 rounded-xl divide-y divide-gray-50 mb-3">
              {availableCourses.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">Нет доступных курсов</p>
              )}
              {availableCourses.map((course) => (
                <label
                  key={course.id}
                  className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedCourseIds.includes(course.id)}
                    onChange={() => toggleCourse(course.id)}
                    className="w-4 h-4 accent-indigo-600"
                  />
                  <span className="text-sm font-semibold text-gray-700">{course.title}</span>
                </label>
              ))}
            </div>
            {error && (
              <p className="text-xs font-semibold text-red-600 flex items-center gap-2 mb-3">
                <FiAlertCircle size={14} /> {error}
              </p>
            )}
            <button
              onClick={handleGrant}
              disabled={granting || selectedCourseIds.length === 0}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest disabled:opacity-50"
            >
              {granting ? <FiLoader className="animate-spin" size={16} /> : <FiKey size={14} />}
              Выдать ({selectedCourseIds.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
