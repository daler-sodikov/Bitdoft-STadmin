import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
  FiEdit2, 
  FiTrash2, 
  FiLoader, 
  FiX, 
  FiAlertCircle, 
  FiUsers, 
  FiArrowLeft,
  FiBookOpen,
  FiPlus
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import GroupCreateModal from './CreateGroup';

const COURSES = ['FRONTEND', 'BACKEND', 'FULLSTACK', 'MOBILE', 'GERMANLANUAGE'];

export default function GetGroup() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [editData, setEditData] = useState({ name: '', course: '' });

  const navigate = useNavigate();

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/groups`);
      setGroups(res.data.groups || res.data);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGroups(); }, []);

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await api.delete(`/groups/${selectedGroup.id}`);
      setIsDeleteOpen(false);
      fetchGroups();
    } catch (err) {
      alert("Ошибка при удалении");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await api.put(`/groups/${selectedGroup.id}`, { 
        name: editData.name,
        course: editData.course 
      });
      setIsEditOpen(false);
      fetchGroups();
    } catch (err) {
      alert("Ошибка при обновлении");
    } finally {
      setActionLoading(false);
    }
  };

  const getCourseLabel = (course) => {
    const labels = {
      FRONTEND: 'Frontend',
      BACKEND: 'Backend',
      FULLSTACK: 'Fullstack',
      MOBILE: 'Mobile',
      GERMANLANUAGE: 'Немецкий'
    };
    return labels[course] || course || 'Не указан';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-indigo-50 p-4 lg:p-8 font-[Inter] text-gray-700">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-400 hover:text-gray-700 transition-colors text-xs font-bold uppercase tracking-widest mb-3"
            >
              <FiArrowLeft size={16} /> Назад
            </button>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Управление группами</h1>
            <p className="text-sm text-gray-500 mt-1">Список всех учебных групп в системе</p>
          </div>
          <button 
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-md shadow-indigo-200 hover:from-indigo-600 hover:to-violet-700 active:scale-95"
          >
            <FiPlus size={16} /> Новая группа
          </button>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-lg shadow-gray-100/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Название группы</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Курс</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Студенты</th>
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
                ) : groups.map((group) => (
                  <tr key={group.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100">
                          <FiUsers size={16} />
                        </div>
                        <span className="font-bold text-gray-800 text-sm">{group.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider border border-indigo-100">
                        {getCourseLabel(group.course)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold text-gray-500">
                        {group.students?.length || 0} чел.
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => {
                            setSelectedGroup(group);
                            setEditData({ name: group.name, course: group.course || '' });
                            setIsEditOpen(true);
                          }}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                          title="Изменить"
                        >
                          <FiEdit2 size={16} />
                        </button>

                        <button 
                          onClick={() => {
                            setSelectedGroup(group);
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
                ))}
              </tbody>
            </table>
          </div>
          {!loading && groups.length === 0 && (
            <div className="py-20 text-center text-gray-400 text-sm font-medium">
              <FiBookOpen className="mx-auto mb-3 text-gray-300" size={32} />
              <p>Группы не найдены</p>
              <button onClick={() => setIsCreateOpen(true)} className="mt-4 text-indigo-600 underline text-xs font-bold uppercase">
                Создать первую группу
              </button>
            </div>
          )}
        </div>
      </div>

      {/* EDIT MODAL */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-[2px]">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-gray-100">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Редактировать группу</h3>
              <button onClick={() => setIsEditOpen(false)} className="text-gray-400 hover:text-gray-600"><FiX size={20} /></button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Название группы</label>
                <input 
                  required
                  className="w-full bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none text-sm font-semibold transition-all"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Курс</label>
                <select
                  className="w-full bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none text-sm font-semibold transition-all cursor-pointer"
                  value={editData.course}
                  onChange={(e) => setEditData({ ...editData, course: e.target.value })}
                >
                  {COURSES.map(c => (
                    <option key={c} value={c}>{getCourseLabel(c)}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsEditOpen(false)} className="flex-1 px-4 py-2 text-xs font-bold text-gray-500 uppercase hover:bg-gray-50 rounded-xl">Отмена</button>
                <button 
                  type="submit" 
                  disabled={actionLoading} 
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-violet-600 text-white py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:from-indigo-600 hover:to-violet-700 transition-all flex items-center justify-center shadow-md shadow-indigo-200"
                >
                  {actionLoading ? <FiLoader className="animate-spin" size={16} /> : "Сохранить"}
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
            <h3 className="text-lg font-bold text-gray-900">Удалить группу?</h3>
            <p className="text-gray-500 text-sm mt-2">
              Группа <span className="font-bold text-gray-800">"{selectedGroup?.name}"</span> будет удалена безвозвратно.
            </p>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setIsDeleteOpen(false)} className="flex-1 py-2 text-xs font-bold text-gray-500 uppercase">Отмена</button>
              <button 
                onClick={handleDelete}
                disabled={actionLoading}
                className="flex-1 bg-red-600 text-white py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition-all flex items-center justify-center"
              >
                {actionLoading ? <FiLoader className="animate-spin" size={16} /> : "Удалить"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE GROUP MODAL */}
      <GroupCreateModal 
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={fetchGroups}
      />
    </div>
  );
}
