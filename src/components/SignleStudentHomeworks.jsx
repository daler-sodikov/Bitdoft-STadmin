import React, { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import { 
  FiClock, 
  FiAlertCircle, 
  FiExternalLink, 
  FiCode, 
  FiFileText, 
  FiCalendar, 
  FiX, 
  FiMaximize2, 
  FiImage, 
  FiCheck, 
  FiLoader,
  FiPlay,
  FiXCircle
} from 'react-icons/fi';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const SignleStudentHomeworks = ({ studentId, groupId }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectReasonError, setRejectReasonError] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCode, setActiveCode] = useState('');
  const [modalTab, setModalTab] = useState('code'); 

  const fetchSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/homeworks/student/${studentId}/${groupId}/done`);
      
      const sortedData = Array.isArray(response.data) 
        ? response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        : [];
      
      setSubmissions(sortedData);
    } catch (err) {
      setError("Ошибка при загрузке данных");
    } finally {
      setLoading(false);
    }
  }, [studentId, groupId]);

  useEffect(() => {
    if (studentId) {
      fetchSubmissions();
    }
  }, [studentId, fetchSubmissions]);

  // Backend endi submissionId orqali aynan tanlangan ishni qabul qiladi.
  const handleApprove = async (sub) => {
    if (!window.confirm("Подтвердить выполнение задания?")) return;

    const targetId = sub.submissionId || sub.id;
    setActionLoading('accept-' + targetId);
    try {
      await api.post(`/homeworks/accept/${studentId}`, { submissionId: targetId });
      setSubmissions(prev => prev.map(s =>
        (s.submissionId === sub.submissionId || s.id === sub.id)
          ? { ...s, accepted: true }
          : s
      ));
    } catch (err) {
      alert("Ошибка при подтверждении");
    } finally {
      setActionLoading(null);
    }
  };

  // Rad etish: avval sabab yoziladigan modal ochiladi
  const openRejectModal = (sub) => {
    setRejectTarget(sub);
    setRejectReason('');
    setRejectReasonError('');
    setRejectModalOpen(true);
  };

  // REJECT tasdiqlash: sabab majburiy, backend rejected=true + rejectionReason
  // saqlaydi, ratingdan 10 ball ayiradi, ish tarixda "Rad etildi" deb qoladi.
  const confirmReject = async () => {
    const reason = rejectReason.trim();
    if (!reason) {
      setRejectReasonError('Напишите причину отклонения');
      return;
    }
    const sub = rejectTarget;
    const targetId = sub.submissionId || sub.id;
    setActionLoading('reject-' + targetId);
    try {
      await api.post(`/homeworks/reject/${studentId}`, { reason, submissionId: targetId });
      setSubmissions(prev => prev.map(s =>
        (s.submissionId === sub.submissionId || s.id === sub.id)
          ? { ...s, rejected: true, accepted: false, rejectionReason: reason }
          : s
      ));
      setRejectModalOpen(false);
    } catch (err) {
      alert("Ошибка при отклонении");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (item) => {
    if (item.accepted === true) {
      return {
        label: 'Одобрено',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: <FiCheck size={14} className="text-emerald-600" />
      };
    }
    if (item.rejected === true) {
      return {
        label: 'Отклонено',
        badgeClass: 'bg-red-50 text-red-600 border-red-200',
        icon: <FiXCircle size={14} className="text-red-500" />
      };
    }
    return {
      label: 'На проверке',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-100',
      icon: <FiLoader size={14} className="text-amber-600" />
    };
  };

  const isGithubLink = (text) => text?.startsWith('http') || text?.includes('github.com');

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <FiLoader className="animate-spin mb-2 text-indigo-500" size={24} />
      <span className="text-xs font-bold uppercase tracking-widest">Загрузка...</span>
    </div>
  );

  if (error) return (
    <div className="p-10 text-center text-red-500 bg-red-50 rounded-2xl m-6 border border-red-100">
      <FiAlertCircle className="mx-auto mb-2" size={24} />
      {error}
    </div>
  );

  return (
    <div className="bg-white min-h-full">
      <div className="px-8 py-5 border-b border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 tracking-tight">
          <FiFileText className="text-indigo-400" />
          История выполнений ({submissions.length})
        </h3>
      </div>

      <div className="divide-y divide-gray-50">
        {submissions.length === 0 ? (
          <div className="py-20 text-center text-gray-400 text-sm italic">
            Задания еще не сдавались
          </div>
        ) : (
          submissions.map((item, idx) => {
            const status = getStatusBadge(item);
            const isAccepted = item.accepted === true;
            const isRejected = item.rejected === true;
            const isPending = !isAccepted && !isRejected;
            const submissionId = item.submissionId || item.id;

            return (
              <div key={item.homeworkId + '-' + idx} className="p-8 hover:bg-gray-50/30 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <h4 className="text-base font-bold text-gray-900 tracking-tight">
                      {item.question?.split('\n')[0] || "Без названия"}
                    </h4>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><FiCalendar size={12} /> {new Date(item.submittedAt || item.createdAt).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><FiClock size={12} /> {item.usedTime} мин</span>
                      <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100 font-semibold">
                        {item.score} баллов
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {isPending && (
                      <>
                        <button 
                          onClick={() => handleApprove(item)}
                          disabled={actionLoading === 'accept-' + submissionId}
                          className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 shadow-sm"
                        >
                          {actionLoading === 'accept-' + submissionId ? <FiLoader className="animate-spin" /> : <FiCheck size={14} />}
                          Принять
                        </button>
                        <button 
                          onClick={() => openRejectModal(item)}
                          disabled={actionLoading === 'reject-' + submissionId}
                          className="flex items-center gap-2 bg-white border border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50"
                        >
                          {actionLoading === 'reject-' + submissionId ? <FiLoader className="animate-spin" /> : <FiXCircle size={14} />}
                          Не принято
                        </button>
                      </>
                    )}

                    <span className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider border flex items-center gap-1.5 ${status.badgeClass}`}>
                      {status.icon}
                      {status.label}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Комментарий</span>
                      <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100 leading-relaxed">
                        {item.desc || <span className="italic text-gray-400">Без комментария</span>}
                      </div>
                    </div>
                    {item.submissionUrl && (
                      <div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2 flex items-center gap-1">
                          <FiImage size={12} /> Скриншот
                        </span>
                        <a href={item.submissionUrl} target="_blank" rel="noreferrer" className="block group relative border border-gray-100 rounded-xl overflow-hidden">
                          <img src={item.submissionUrl} alt="Результат" className="w-full h-auto object-cover max-h-60" />
                        </a>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                        <FiCode size={12} /> Код / Ссылка
                      </span>
                      {!isGithubLink(item.code) && item.code && (
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => { setActiveCode(item.code); setModalTab('result'); setIsModalOpen(true); }}
                            className="text-xs font-bold text-emerald-600 uppercase hover:underline flex items-center gap-1"
                          >
                            <FiPlay size={10} /> Результат
                          </button>
                          <button 
                            onClick={() => { setActiveCode(item.code); setModalTab('code'); setIsModalOpen(true); }}
                            className="text-xs font-bold text-indigo-600 uppercase hover:underline flex items-center gap-1"
                          >
                            <FiMaximize2 size={10} /> Развернуть
                          </button>
                        </div>
                      )}
                    </div>
                    {isGithubLink(item.code) ? (
                      <a href={item.code} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-xl text-white hover:from-indigo-600 hover:to-violet-700 transition-all group shadow-md shadow-indigo-200">
                        <span className="font-mono text-xs truncate mr-4">{item.code}</span>
                        <FiExternalLink />
                      </a>
                    ) : (
                      <div className="rounded-xl border border-gray-200 overflow-hidden text-xs max-h-[280px]">
                        <SyntaxHighlighter language="javascript" style={atomDark} customStyle={{ margin: 0, padding: '16px', background: '#0F172A' }}>
                          {item.code || "// Код не предоставлен"}
                        </SyntaxHighlighter>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CODE & RESULT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-[#0F172A] w-full max-w-6xl h-full rounded-2xl flex flex-col shadow-2xl border border-gray-700 overflow-hidden">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-900/50">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setModalTab('code')}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${modalTab === 'code' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  Исходный код
                </button>
                <button 
                  onClick={() => setModalTab('result')}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${modalTab === 'result' ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  Результат
                </button>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <FiX size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-hidden bg-white">
              {modalTab === 'code' ? (
                <div className="h-full overflow-auto bg-[#0F172A]">
                   <SyntaxHighlighter 
                    language="javascript" 
                    style={atomDark} 
                    customStyle={{ margin: 0, padding: '30px', fontSize: '13px', background: 'transparent' }} 
                    showLineNumbers={true}
                  >
                    {activeCode}
                  </SyntaxHighlighter>
                </div>
              ) : (
                <iframe
                  title="Предпросмотр задания"
                  srcDoc={activeCode} 
                  className="w-full h-full border-none bg-white"
                  sandbox="allow-scripts"
                />
              )}
            </div>
          </div>
        </div>
      )}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-sm" onClick={() => setRejectModalOpen(false)}></div>
          <div className="relative w-full max-w-md p-6 bg-white border border-gray-200 shadow-2xl rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold tracking-wider text-gray-800 uppercase">Причина отклонения</span>
              <button
                onClick={() => setRejectModalOpen(false)}
                className="text-gray-400 transition-colors hover:text-gray-600"
              >
                <FiX size={20} />
              </button>
            </div>

            <textarea
              value={rejectReason}
              onChange={(e) => { setRejectReason(e.target.value); setRejectReasonError(''); }}
              placeholder="Например: не пустую работу, неверное решение, плагиата..."
              rows={4}
              autoFocus
              className="w-full px-4 py-3 text-sm text-gray-800 transition-all border resize-none rounded-xl border-slate-200 bg-slate-50/50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:border-red-400 focus:bg-white"
            />
            {rejectReasonError && (
              <p className="mt-2 text-xs font-semibold text-red-500">{rejectReasonError}</p>
            )}

            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-500 transition-all rounded-xl hover:bg-gray-100"
              >
                Отмена
              </button>
              <button
                onClick={confirmReject}
                disabled={actionLoading === 'reject-' + (rejectTarget?.submissionId || rejectTarget?.id)}
                className="px-4 py-2 text-xs font-bold text-white transition-all bg-red-500 rounded-xl hover:bg-red-600 disabled:opacity-50"
              >
                {actionLoading === 'reject-' + (rejectTarget?.submissionId || rejectTarget?.id) ? (
                  <span className="flex items-center gap-1.5">
                    <div className="w-3 h-3 border-[1.5px] border-white/40 border-t-white rounded-full animate-spin" />
                    Отправка...
                  </span>
                ) : (
                  "Отклонить"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignleStudentHomeworks;
