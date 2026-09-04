import React, { useCallback, useEffect, useState } from 'react';
import {
  FiLoader,
  FiSearch,
  FiUserPlus,
  FiX,
  FiAlertCircle,
  FiEdit2,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiUpload,
  FiCamera,
  FiEye,
  FiEyeOff,
  FiKey,
} from 'react-icons/fi';
import academyAdmin from '../../api/academyAdmin';

const inputCls =
  'w-full bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none text-sm font-semibold transition-all';
const labelCls = 'text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2';

export default function AcademyTeachers() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], total: 0, pageCount: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setData(
        await academyAdmin.listTeachers({
          ...(search ? { search } : {}),
          page,
          pageSize: 20,
        }),
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Не удалось загрузить преподавателей');
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  const openCreate = () => {
    setEditingTeacher(null);
    setFormOpen(true);
  };

  const openEdit = (teacher) => {
    setEditingTeacher(teacher);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await academyAdmin.deleteTeacher(deleteTarget.id);
      setDeleteTarget(null);
      fetchTeachers();
    } catch (err) {
      alert(err.response?.data?.message || 'Не удалось удалить преподавателя');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="font-[Inter] text-gray-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Академия — Преподаватели</h1>
          <p className="text-sm text-gray-500 mt-1">
            Карточки преподавателей: имя, должность и фото — без входа в приложение
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-md shadow-indigo-200 hover:from-indigo-600 hover:to-violet-700 active:scale-95"
        >
          <FiUserPlus size={16} /> Добавить преподавателя
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            className={`${inputCls} pl-11`}
            placeholder="Поиск по имени, должности или номеру"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-lg shadow-gray-100/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Преподаватель</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Должность</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Телефон</th>
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
                data.items.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {teacher.photoUrl ? (
                          <img
                            src={teacher.photoUrl}
                            alt={teacher.name}
                            className="w-9 h-9 rounded-full object-cover border border-gray-100"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center text-xs font-bold uppercase">
                            {teacher.name.slice(0, 2)}
                          </div>
                        )}
                        <span className="font-bold text-gray-800 text-sm">{teacher.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-500">
                      {teacher.headline || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-500">
                      {teacher.phone || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openEdit(teacher)}
                          className="flex items-center gap-2 px-4 py-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all text-xs font-bold uppercase"
                        >
                          <FiEdit2 size={14} /> Изменить
                        </button>
                        <button
                          onClick={() => setDeleteTarget(teacher)}
                          className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
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
              <p>Преподаватели не найдены</p>
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

      {formOpen && (
        <TeacherFormModal
          teacher={editingTeacher}
          onClose={() => setFormOpen(false)}
          onSaved={() => {
            setFormOpen(false);
            fetchTeachers();
          }}
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-[2px]">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl border border-gray-100 p-6">
            <h3 className="text-sm font-bold text-gray-800 mb-2">Удалить преподавателя?</h3>
            <p className="text-xs text-gray-500 mb-6">
              {deleteTarget.name} будет удалён без возможности восстановления.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 px-4 py-2 text-xs font-bold text-gray-500 uppercase hover:bg-gray-50 rounded-xl"
              >
                Отмена
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 bg-red-600 text-white py-2 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center"
              >
                {deleting ? <FiLoader className="animate-spin" size={16} /> : 'Удалить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TeacherFormModal({ teacher, onClose, onSaved }) {
  const isEdit = Boolean(teacher);
  const [name, setName] = useState(teacher?.name || '');
  const [phone, setPhone] = useState(teacher?.phone || '');
  const [headline, setHeadline] = useState(teacher?.headline || '');
  const [bio, setBio] = useState(teacher?.bio || '');
  const [photoUrl, setPhotoUrl] = useState(teacher?.photoUrl || '');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(teacher?.photoUrl || '');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handlePhotoPick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      let uploadedPhotoUrl = photoUrl;
      if (photoFile) {
        setUploadingPhoto(true);
        try {
          const { url } = await academyAdmin.uploadTeacherPhoto(photoFile);
          uploadedPhotoUrl = url;
        } finally {
          setUploadingPhoto(false);
        }
      }

      const payload = {
        name,
        phone: phone.trim() || null,
        headline: headline.trim() || null,
        bio: bio.trim() || null,
        photoUrl: uploadedPhotoUrl || null,
        // Omitted entirely when left blank: on create the backend falls back
        // to its default password, on edit the existing password is kept.
        ...(password.trim() ? { password: password.trim() } : {}),
      };
      if (isEdit) {
        await academyAdmin.updateTeacher(teacher.id, payload);
      } else {
        await academyAdmin.createTeacher(payload);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при сохранении');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-[2px]">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl border border-gray-100 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
            {isEdit ? 'Изменить преподавателя' : 'Добавить преподавателя'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FiX size={20} />
          </button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div>
            <label className={labelCls}>Имя</label>
            <input required className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div>
            <label className={labelCls}>Должность</label>
            <input
              className={inputCls}
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="Senior Backend Engineer"
              maxLength={120}
            />
          </div>

          <div>
            <label className={labelCls}>Телефон</label>
            <input
              className={inputCls}
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="998901234567 (необязательно)"
            />
          </div>

          <div>
            <label className={labelCls}>Пароль для входа</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className={`${inputCls} pr-11`}
                minLength={4}
                maxLength={100}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isEdit ? 'Оставьте пустым, чтобы не менять' : 'По умолчанию: 123456'}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
            <p className="text-[11px] text-gray-400 mt-1.5 flex items-center gap-1.5">
              <FiKey size={11} />
              {isEdit
                ? 'Заполните только если хотите задать новый пароль'
                : 'Если не указать, будет установлен пароль 123456'}
            </p>
          </div>

          <div>
            <label className={labelCls}>Фото</label>
            <div className="flex items-center gap-4">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Предпросмотр"
                  className="w-16 h-16 rounded-full object-cover border border-gray-100"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-400 flex items-center justify-center">
                  <FiCamera size={22} />
                </div>
              )}
              <label className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-all">
                <FiUpload size={14} />
                {photoPreview ? 'Заменить фото' : 'Загрузить фото'}
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoPick} />
              </label>
            </div>
          </div>

          <div>
            <label className={labelCls}>О себе</label>
            <textarea
              className={`${inputCls} min-h-[96px] resize-y`}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={2000}
            />
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
              {uploadingPhoto ? (
                'Загрузка фото…'
              ) : saving ? (
                <FiLoader className="animate-spin" size={16} />
              ) : (
                'Сохранить'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
