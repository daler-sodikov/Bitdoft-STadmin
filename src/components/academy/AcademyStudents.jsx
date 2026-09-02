import React, { useState, useEffect, useCallback } from 'react';
import academyApi from '../../api/academyApi';
import AcademyStudentForm from './AcademyStudentForm';
import { FiPlus, FiUsers, FiLoader, FiChevronLeft, FiChevronRight, FiSearch } from 'react-icons/fi';

const PAGE_SIZE = 10;

export default function AcademyStudents() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('STUDENT');
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await academyApi.get('/admin/users', {
        params: {
          type: type || undefined,
          search: search.trim() || undefined,
          page,
          pageSize: PAGE_SIZE,
        },
      });
      const data = res.data?.data;
      setItems(data?.items ?? []);
      setTotal(data?.total ?? 0);
      setPageCount(data?.pageCount ?? 1);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [type, search, page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-4 lg:p-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col justify-between gap-6 mb-8 md:flex-row md:items-end">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-200">
              <FiUsers size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Студенты академии</h1>
              <p className="text-sm text-zinc-500 mt-1.5">Всего зарегистрировано: {total}</p>
            </div>
          </div>

          <button
            onClick={() => setFormOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white transition-all bg-gradient-to-r from-indigo-500 to-violet-600 rounded-xl hover:from-indigo-600 hover:to-violet-700 active:scale-[0.97] shadow-lg shadow-indigo-200"
          >
            <FiPlus size={16} />
            Новый студент
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-300" size={16} />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Поиск по имени или телефону..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-zinc-200 rounded-xl outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <div className="flex items-center gap-2">
            {[
              { value: 'STUDENT', label: 'Студенты' },
              { value: 'ACADEMY', label: 'Аккаунты' },
            ].map((f) => (
              <button
                key={f.value || 'all'}
                onClick={() => { setType(f.value); setPage(1); }}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
                  type === f.value
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200'
                    : 'bg-white text-zinc-500 border-zinc-200 hover:border-indigo-300'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50">
                <th className="p-5 text-xs font-bold text-zinc-500 uppercase tracking-wider">Студент</th>
                <th className="p-5 text-xs font-bold text-zinc-500 uppercase tracking-wider hidden md:table-cell">Телефон</th>
                <th className="p-5 text-xs font-bold text-zinc-500 uppercase tracking-wider hidden lg:table-cell">Родитель</th>
                <th className="p-5 text-xs font-bold text-zinc-500 uppercase tracking-wider">Курсы</th>
                <th className="p-5 text-xs font-bold text-zinc-500 uppercase tracking-wider hidden lg:table-cell">Дата</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <FiLoader className="inline animate-spin text-indigo-500" size={24} />
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-zinc-400 italic text-sm">
                    Студентов не найдено
                  </td>
                </tr>
              ) : (
                items.map((s) => (
                  <tr key={s.id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
                          {s.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-zinc-900">{s.name || 'Без имени'}</p>
                          <span className={`inline-flex mt-0.5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md border ${
                            s.accountType === 'ACADEMY'
                              ? 'bg-violet-50 text-violet-600 border-violet-100'
                              : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                          }`}>
                            {s.accountType}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-5 text-sm text-zinc-700 hidden md:table-cell">{s.phone || '—'}</td>
                    <td className="p-5 text-sm text-zinc-500 hidden lg:table-cell">{s.parentPhoneNumber || '—'}</td>
                    <td className="p-5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-lg">
                        {s._count?.academyAccess ?? 0}
                      </span>
                    </td>
                    <td className="p-5 text-xs text-zinc-400 hidden lg:table-cell">{formatDate(s.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && pageCount > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-xs text-zinc-400 font-medium">Страница {page} из {pageCount}</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="flex items-center gap-1 px-4 py-2 text-xs font-bold text-zinc-600 bg-white border border-zinc-200 rounded-xl hover:border-indigo-300 disabled:opacity-40"
              >
                <FiChevronLeft size={14} />
                Назад
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                disabled={page >= pageCount}
                className="flex items-center gap-1 px-4 py-2 text-xs font-bold text-zinc-600 bg-white border border-zinc-200 rounded-xl hover:border-indigo-300 disabled:opacity-40"
              >
                Вперед
                <FiChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      <AcademyStudentForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={() => { fetchUsers(); }}
      />
    </div>
  );
}