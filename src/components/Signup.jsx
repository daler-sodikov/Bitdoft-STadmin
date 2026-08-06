import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios'; 
import { Edit3, Trash2, UserPlus, Users, Mail, Phone, Lock, User, Image as ImageIcon, Loader2, MessageCircle, X, Key } from 'lucide-react';

export default function Signup() {
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    parentPhoneNumber: '',
    groupId: '',
    password: ''
  });
  const [whatsAppCustomMessage, setWhatsAppCustomMessage] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [formModal, setFormModal] = useState(false);
  const [whatsAppModal, setWhatsAppModal] = useState({
    isOpen: false,
    student: null,
    mode: 'parent',
    manualPhone: ''
  });
  const [passwordModal, setPasswordModal] = useState({
    isOpen: false,
    studentId: null,
    studentName: '',
    newPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  const fetchGroups = useCallback(async () => {
    try {
      const res = await api.get('/groups');
      setGroups(res.data.groups || res.data);
    } catch (error) {
    }
  }, []);

  const fetchStudents = useCallback(async () => {
    try {
      const res = await api.get('/students'); 
      setStudents(res.data.students || res.data);
    } catch (err) {
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchStudents(), fetchGroups()]);
      setLoading(false);
    };
    loadData();
  }, [fetchStudents, fetchGroups]); 

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', parentPhoneNumber: '', groupId: '', password: '' });
    setImage(null);
    setPreview('');
    setEditingId(null);
  };

  const openCreateModal = () => {
    resetForm();
    setFormModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append('name', formData.name);
    data.append('email', formData.email);
    data.append('password', formData.password);
    data.append('groupId', formData.groupId);
    data.append('parentPhoneNumber', formData.parentPhoneNumber);
    
    if (image) {
      data.append('file', image); 
    }

    try {
      if (editingId) {
        await api.put(`/students/${editingId}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setEditingId(null);
      } else {
        await api.post('/students/create', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      resetForm();
      setFormModal(false);
      fetchStudents(); 
    } catch (err) {
      alert("Не удалось выполнить действие. Проверьте данные.");
    } finally {
      setLoading(false);
    }
  };

  const deleteStudent = async (id) => {
    if (window.confirm("Вы уверены, что хотите удалить запись?")) {
      try {
        await api.delete(`/students/${id}`);
        fetchStudents();
      } catch (err) {
      }
    }
  };

  const startEdit = (student) => {
    setEditingId(student.id);
    setFormData({
      name: student.name || '',
      email: student.email || '',
      parentPhoneNumber: student.parentPhoneNumber || '',
      groupId: student.groupId || student.groups?.[0]?.id || '',
      password: '' 
    });
    setPreview(student.profileImageUrl || '');
    setFormModal(true);
  };

  const openPasswordModal = (student) => {
    setPasswordModal({
      isOpen: true,
      studentId: student.id,
      studentName: student.name,
      newPassword: ''
    });
  };

  const handlePasswordReset = async () => {
    if (!passwordModal.newPassword || passwordModal.newPassword.length < 4) {
      return alert("Пароль должен содержать минимум 4 символа");
    }
    setPasswordLoading(true);
    try {
      await api.put(`/students/${passwordModal.studentId}/password`, {
        password: passwordModal.newPassword
      });
      alert("Пароль успешно обновлен!");
      setPasswordModal({ isOpen: false, studentId: null, studentName: '', newPassword: '' });
    } catch (err) {
      alert("Ошибка при обновлении пароля");
    } finally {
      setPasswordLoading(false);
    }
  };

  const sendToWhatsApp = (student) => {
    setWhatsAppModal({
      isOpen: true,
      student: student,
      mode: 'parent',
      manualPhone: ''
    });
  };

  const sendToWhatsAppFromForm = () => {
    setWhatsAppModal({
      isOpen: true,
      student: null,
      mode: 'parent',
      manualPhone: ''
    });
  };

  const handleConfirmWhatsApp = () => {
    const { student, mode, manualPhone } = whatsAppModal;
    let targetPhone = '';
    let email = '';
    let password = '';

    if (student) {
      targetPhone = mode === 'parent' ? (student.parentPhoneNumber) : manualPhone;
      email = student.email;
      password = student.password || '********';
    } else {
      targetPhone = mode === 'parent' ? formData.parentPhoneNumber : manualPhone;
      email = formData.email;
      password = formData.password;
    }

    if (!targetPhone) {
      alert("Рақам киритилмади.");
      return;
    }

    const cleanPhone = targetPhone.replace(/[^\d]/g, '');
    let message = `Bitsoft Student App\n\nЛогин: ${email}\nПароль: ${password}\n\nДанные для входа в приложение.`;
    
    if (whatsAppCustomMessage) {
      message += `\n\nДополнительно: ${whatsAppCustomMessage}`;
    }

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
    setWhatsAppModal({ ...whatsAppModal, isOpen: false });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-indigo-50 p-4 md:p-12 font-[Inter] text-gray-700">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                <Users size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Регистрация студентов</h1>
                <p className="text-sm text-gray-500 mt-0.5">Управление аккаунтами и профилями</p>
              </div>
            </div>
            <button 
              onClick={openCreateModal}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-indigo-200 hover:from-indigo-600 hover:to-violet-700 active:scale-95"
            >
              <UserPlus size={16} />
              Новый студент
            </button>
          </div>
        </header>

        {/* WhatsApp Message Section */}
        <div className="mb-6 bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Дополнительное сообщение WhatsApp</label>
          <textarea value={whatsAppCustomMessage} onChange={(e) => setWhatsAppCustomMessage(e.target.value)} placeholder="Текст сообщения..." className="w-full border-b border-gray-200 py-3 focus:border-indigo-400 outline-none transition-colors bg-transparent resize-none h-16 text-sm" />
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="p-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Студент</th>
                <th className="p-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Группа</th>
                <th className="p-6 text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Контакты</th>
                <th className="p-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {students.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-6">
                    <div className="font-medium text-gray-900">{s.name || 'Без имени'}</div>
                  </td>
                  <td className="p-6">
                    <span className="text-[11px] px-3 py-1 bg-indigo-50 text-indigo-600 uppercase tracking-wider rounded-full font-bold border border-indigo-100">
                      {s.groups?.[0]?.name || 'Основная'}
                    </span>
                  </td>
                  <td className="hidden p-6 md:table-cell">
                    <div className="text-[13px] text-gray-700">{s.email}</div>
                    <div className="text-[12px] text-gray-400">{s.parentPhoneNumber}</div>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex justify-end gap-3">
                      <button onClick={() => startEdit(s)} className="text-gray-400 hover:text-indigo-600 transition-colors" title="Редактировать">
                        <Edit3 size={18} />
                      </button>
                      <button onClick={() => openPasswordModal(s)} className="text-gray-400 hover:text-amber-600 transition-colors" title="Сбросить пароль">
                        <Key size={18} />
                      </button>
                      <button onClick={() => sendToWhatsApp(s)} className="text-[#25D366] hover:text-[#128C7E] transition-colors" title="WhatsApp">
                        <MessageCircle size={18} />
                      </button>
                      <button onClick={() => deleteStudent(s.id)} className="text-gray-300 hover:text-red-600 transition-colors" title="Удалить">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {students.length === 0 && !loading && (
            <div className="py-20 text-center text-gray-400 italic font-light">
              Список студентов пуст
            </div>
          )}
        </div>
      </div>

      {/* CREATE/EDIT STUDENT MODAL */}
      {formModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-gray-100 max-h-[90vh] flex flex-col">
            
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-indigo-50/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                  <UserPlus size={18} className="text-white" />
                </div>
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest">
                  {editingId ? 'Редактировать студента' : 'Новый студент'}
                </h3>
              </div>
              <button onClick={() => { setFormModal(false); resetForm(); }} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Имя студента</label>
                  <div className="relative">
                    <User className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                    <input name="name" value={formData.name} onChange={handleChange} placeholder="Иван Иванов" className="w-full border-b border-gray-200 py-3 pl-7 focus:border-indigo-400 outline-none transition-colors bg-transparent" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Электронная почта</label>
                  <div className="relative">
                    <Mail className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                    <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="email@example.com" className="w-full border-b border-gray-200 py-3 pl-7 focus:border-indigo-400 outline-none transition-colors bg-transparent" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Телефон родителей</label>
                  <div className="relative">
                    <Phone className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                    <input name="parentPhoneNumber" value={formData.parentPhoneNumber} onChange={handleChange} placeholder="+992 00 000 0000" className="w-full border-b border-gray-200 py-3 pl-7 focus:border-indigo-400 outline-none transition-colors bg-transparent" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Группа</label>
                  <select 
                    name="groupId" 
                    value={formData.groupId} 
                    onChange={handleChange} 
                    className="w-full border-b border-gray-200 py-3 focus:border-indigo-400 outline-none transition-colors bg-transparent cursor-pointer appearance-none"
                    required
                  >
                    <option value="">Выберите группу...</option>
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>{group.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Пароль</label>
                  <div className="relative">
                    <Lock className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                    <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="********" className="w-full border-b border-gray-200 py-3 pl-7 focus:border-indigo-400 outline-none transition-colors bg-transparent" required={!editingId} />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Фото профиля</label>
                  <div className="flex items-center gap-6 mt-2">
                    <div className="w-20 h-20 border border-gray-200 rounded-full overflow-hidden bg-gray-50 flex items-center justify-center">
                      {preview ? (
                        <img src={preview} alt="Preview" className="object-cover w-full h-full" />
                      ) : (
                        <ImageIcon className="text-gray-300" size={24} />
                      )}
                    </div>
                    <label className="cursor-pointer px-6 py-2 border border-indigo-500 text-indigo-600 text-xs uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all rounded-xl">
                      Выбрать файл
                      <input 
                        type="file" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) { setImage(file); setPreview(URL.createObjectURL(file)); }
                        }} 
                      />
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col justify-center gap-4 pt-4 border-t border-gray-100 md:flex-row md:justify-end">
                <button type="button" onClick={sendToWhatsAppFromForm} className="px-8 py-3 border border-[#25D366] text-[#25D366] text-xs uppercase tracking-[0.2em] hover:bg-[#25D366] hover:text-white transition-all flex items-center justify-center gap-2 rounded-xl">
                  <MessageCircle size={14} /> WhatsApp
                </button>
                <button type="submit" disabled={loading} className="px-12 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-xs uppercase tracking-[0.2em] hover:from-indigo-600 hover:to-violet-700 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-2 rounded-xl shadow-md shadow-indigo-200">
                  {loading && <Loader2 size={14} className="animate-spin" />}
                  {editingId ? 'Обновить данные' : 'Зачислить студента'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WhatsApp Modal */}
      {whatsAppModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-800">WhatsApp</h3>
              <button onClick={() => setWhatsAppModal({ ...whatsAppModal, isOpen: false })} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <p className="text-sm text-gray-600">На какой номер отправить?</p>
              
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <input 
                    type="radio" 
                    name="waMode" 
                    checked={whatsAppModal.mode === 'parent'} 
                    onChange={() => setWhatsAppModal({ ...whatsAppModal, mode: 'parent' })}
                    className="accent-indigo-600"
                  />
                  <span className="text-sm font-medium">Родители ({whatsAppModal.student ? whatsAppModal.student.parentPhoneNumber : formData.parentPhoneNumber})</span>
                </label>
                
                <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <input 
                    type="radio" 
                    name="waMode" 
                    checked={whatsAppModal.mode === 'manual'} 
                    onChange={() => setWhatsAppModal({ ...whatsAppModal, mode: 'manual' })}
                    className="accent-indigo-600"
                  />
                  <span className="text-sm font-medium">Другой номер</span>
                </label>
              </div>

              {whatsAppModal.mode === 'manual' && (
                <div>
                  <label className="text-xs uppercase tracking-wider text-gray-400 block mb-2">Телефон</label>
                  <input 
                    value={whatsAppModal.manualPhone} 
                    onChange={(e) => setWhatsAppModal({ ...whatsAppModal, manualPhone: e.target.value })}
                    placeholder="+998 90 123 45 67" 
                    className="w-full border-b border-gray-200 py-2 focus:border-indigo-400 outline-none text-sm bg-transparent"
                  />
                </div>
              )}

              <button 
                onClick={handleConfirmWhatsApp}
                className="w-full py-4 bg-[#25D366] text-white text-xs uppercase tracking-widest font-bold hover:bg-[#128C7E] transition-all shadow-lg active:scale-[0.98] rounded-xl"
              >
                Подтвердить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PASSWORD RESET MODAL */}
      {passwordModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Key size={20} className="text-amber-500" />
                <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-800">Сброс пароля</h3>
              </div>
              <button onClick={() => setPasswordModal({ isOpen: false, studentId: null, studentName: '', newPassword: '' })} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <p className="text-sm text-gray-600">
                Новый пароль для <span className="font-bold text-gray-900">{passwordModal.studentName}</span>:
              </p>
              
              <input 
                type="password"
                value={passwordModal.newPassword}
                onChange={(e) => setPasswordModal({ ...passwordModal, newPassword: e.target.value })}
                placeholder="Введите новый пароль"
                className="w-full border-b border-gray-200 py-3 focus:border-indigo-400 outline-none text-sm bg-transparent"
              />

              <div className="flex gap-3">
                <button 
                  onClick={() => setPasswordModal({ isOpen: false, studentId: null, studentName: '', newPassword: '' })}
                  className="flex-1 py-3 border border-gray-200 text-gray-500 text-xs uppercase tracking-widest font-bold hover:bg-gray-50 transition-all rounded-xl"
                >
                  Отмена
                </button>
                <button 
                  onClick={handlePasswordReset}
                  disabled={passwordLoading}
                  className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-xs uppercase tracking-widest font-bold hover:from-indigo-600 hover:to-violet-700 transition-all flex items-center justify-center gap-2 rounded-xl shadow-md shadow-indigo-200"
                >
                  {passwordLoading ? <Loader2 size={14} className="animate-spin" /> : 'Сохранить'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
