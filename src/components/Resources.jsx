import React, { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import {
  FiPlus, FiTrash2, FiFileText, FiLoader, FiCheck,
  FiUploadCloud, FiX, FiDownload, FiFile, FiFolder,
  FiImage, FiArchive, FiGrid
} from 'react-icons/fi';

const getFileIcon = (type) => {
  if (!type) return <FiFile size={20} />;
  if (type.includes('pdf')) return <FiFileText size={20} />;
  if (type.includes('word') || type.includes('document')) return <FiFileText size={20} />;
  if (type.includes('image')) return <FiImage size={20} />;
  if (type.includes('zip') || type.includes('rar')) return <FiArchive size={20} />;
  if (type.includes('excel') || type.includes('sheet')) return <FiGrid size={20} />;
  return <FiFolder size={20} />;
};

const getFileAccent = (type) => {
  if (!type) return 'text-zinc-500 bg-zinc-100';
  if (type.includes('pdf')) return 'text-rose-600 bg-rose-50';
  if (type.includes('word')) return 'text-blue-600 bg-blue-50';
  if (type.includes('image')) return 'text-emerald-600 bg-emerald-50';
  if (type.includes('zip')) return 'text-amber-600 bg-amber-50';
  if (type.includes('excel')) return 'text-green-600 bg-green-50';
  return 'text-zinc-500 bg-zinc-100';
};

const formatFileSize = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

export default function Resources() {
  const [loading, setLoading] = useState(false);
  const [resources, setResources] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', desc: '' });
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');

  const getAllResources = useCallback(async () => {
    try {
      const res = await api.get('/resources');
      setResources(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
    }
  }, []);

  const deleteResource = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот ресурс?')) return;
    try {
      await api.delete(`/resources/${id}`);
      setResources(resources.filter(r => r.id !== id));
    } catch (error) {
      alert('Ошибка при удалении');
    }
  };

  useEffect(() => { getAllResources(); }, [getAllResources]);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setFileName(f.name);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !file) {
      alert('Название и файл обязательны');
      return;
    }

    const fd = new FormData();
    fd.append('name', formData.name);
    fd.append('desc', formData.desc);
    fd.append('file', file);

    setLoading(true);
    try {
      await api.post('/resources', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFormData({ name: '', desc: '' });
      setFile(null);
      setFileName('');
      setIsModalOpen(false);
      getAllResources();
    } catch (error) {
      alert('Ошибка при загрузке');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-4 lg:p-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col justify-between gap-6 mb-10 md:flex-row md:items-end">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-200">
              <FiFileText size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Ресурсы</h1>
              <p className="text-sm text-zinc-500 mt-1.5 max-w-[65ch]">Загруженные файлы доступны всем студентам платформы</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-5 py-2.5 bg-white border border-zinc-200 rounded-xl">
              <span className="text-2xl font-bold text-zinc-900 tabular-nums">{resources.length}</span>
              <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Файлов</span>
            </div>

            <button
              onClick={() => { setFormData({ name: '', desc: '' }); setFile(null); setFileName(''); setIsModalOpen(true); }}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white transition-all bg-gradient-to-r from-violet-500 to-indigo-600 rounded-xl hover:from-violet-600 hover:to-indigo-700 active:scale-[0.97] shadow-lg shadow-violet-200"
            >
              <FiPlus size={16} />
              Добавить
            </button>
          </div>
        </div>

        {resources.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 bg-white border border-zinc-200 border-dashed rounded-2xl">
            <div className="flex items-center justify-center w-14 h-14 mb-4 bg-zinc-100 rounded-2xl">
              <FiFile className="text-zinc-300" size={24} />
            </div>
            <p className="text-sm font-semibold text-zinc-500">Ресурсов пока нет</p>
            <p className="text-xs text-zinc-400 mt-1">Нажмите «Добавить» чтобы загрузить первый файл</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {resources.map((item) => (
              <div key={item.id} className="flex flex-col bg-white border border-zinc-200 rounded-2xl overflow-hidden transition-all hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)] hover:border-zinc-300">
                <div className="relative flex items-center justify-center py-10 bg-zinc-50">
                  <div className={`flex items-center justify-center w-14 h-14 rounded-2xl ${getFileAccent(item.fileType)}`}>
                    {getFileIcon(item.fileType)}
                  </div>
                  <button
                    onClick={() => deleteResource(item.id)}
                    className="absolute top-3 right-3 flex items-center justify-center w-8 h-8 text-zinc-400 transition-colors bg-white border border-zinc-200 rounded-lg hover:text-red-600 hover:border-red-200 hover:bg-red-50 active:scale-95"
                    title="Удалить"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
                <div className="flex flex-col flex-1 p-5">
                  <h3 className="text-sm font-semibold text-zinc-900 truncate">{item.name}</h3>
                  {item.desc && (
                    <p className="mt-1 text-xs text-zinc-500 leading-relaxed line-clamp-2">{item.desc}</p>
                  )}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-100">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                        {item.fileType ? item.fileType.split('/')[1]?.toUpperCase() : 'FILE'}
                      </span>
                      {item.fileSize && (
                        <span className="text-[10px] text-zinc-400 font-medium">{formatFileSize(item.fileSize)}</span>
                      )}
                    </div>
                    <a
                      href={item.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 transition-colors hover:text-indigo-800"
                    >
                      <FiDownload size={13} />
                      Скачать
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl flex flex-col overflow-hidden">
              <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-200 bg-gradient-to-r from-zinc-50 to-indigo-50/30">
                <h2 className="text-sm font-bold tracking-tight text-zinc-900">Добавить ресурс</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-zinc-400 transition-colors rounded-lg hover:text-zinc-600 hover:bg-zinc-100">
                  <FiX size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700">Название</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 text-sm border border-zinc-300 rounded-xl outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 bg-white"
                    placeholder="Введите название файла"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700">Описание</label>
                  <textarea
                    value={formData.desc}
                    onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                    className="w-full h-24 px-4 py-2.5 text-sm border border-zinc-300 rounded-xl outline-none resize-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 bg-white"
                    placeholder="Необязательное описание"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700">Файл</label>
                  {fileName ? (
                    <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl">
                      <div className="flex items-center gap-2.5 truncate">
                        <FiFileText className="text-zinc-400 shrink-0" size={16} />
                        <span className="text-sm font-medium text-zinc-700 truncate">{fileName}</span>
                      </div>
                      <button type="button" onClick={() => { setFile(null); setFileName(''); }} className="p-1 text-zinc-400 hover:text-red-500 shrink-0">
                        <FiX size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-zinc-200 border-dashed rounded-xl bg-zinc-50 cursor-pointer transition-colors hover:border-indigo-400">
                      <FiUploadCloud size={22} className="text-zinc-300 mb-1.5" />
                      <p className="text-xs font-semibold text-zinc-500">Нажмите чтобы загрузить</p>
                      <p className="text-[10px] text-zinc-400 mt-0.5">PDF, DOC, ZIP до 50 MB</p>
                      <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </label>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-zinc-600 transition-colors bg-zinc-100 rounded-xl hover:bg-zinc-200">
                    Отмена
                  </button>
                  <button
                    type="submit" disabled={loading}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white transition-all bg-gradient-to-r from-violet-500 to-indigo-600 rounded-xl hover:from-violet-600 hover:to-indigo-700 active:scale-[0.97] disabled:opacity-50 shadow-lg shadow-violet-200"
                  >
                    {loading ? <FiLoader className="animate-spin" /> : <><FiCheck size={16} /> Загрузить</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
