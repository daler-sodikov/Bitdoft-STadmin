import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { FiCode, FiX, FiExternalLink, FiMaximize2, FiFileText } from "react-icons/fi";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const Homeworks = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [homeworks, setHomeworks] = useState([]);
  const [selectedHomework, setSelectedHomework] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editHomework, setEditHomework] = useState(null);

  const [formQuestion, setFormQuestion] = useState("");
  const [formDeadline, setFormDeadline] = useState("");
  const [formScore, setFormScore] = useState("10");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [submissionsMap, setSubmissionsMap] = useState({});
  const [approvingId, setApprovingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [codeModalOpen, setCodeModalOpen] = useState(false);
  const [activeCode, setActiveCode] = useState("");
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [activeComment, setActiveComment] = useState("");

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectReasonError, setRejectReasonError] = useState("");

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await api.get("/groups");
        setGroups(res.data);
      } catch (err) {
      }
    };
    fetchGroups();
  }, []);

  const fetchHomeworks = async (groupId) => {
    setLoading(true);
    setSelectedHomework(null);
    setSubmissions([]);
    try {
      const res = await api.get(`/homeworks/group/${groupId}`);
      setHomeworks(res.data);
      const subsMap = {};
      await Promise.all(
        res.data.map(async (hw) => {
          try {
            const subRes = await api.get(`/homeworks/${hw.id}/submissions`);
            subsMap[hw.id] = subRes.data;
          } catch {
            subsMap[hw.id] = [];
          }
        })
      );
      setSubmissionsMap(subsMap);
    } catch (err) {
      setHomeworks([]);
    }
    setLoading(false);
  };

  const handleGroupChange = (e) => {
    const gId = e.target.value;
    setSelectedGroupId(gId);
    if (gId) fetchHomeworks(gId);
  };

  const resetForm = () => {
    setFormQuestion("");
    setFormDeadline("");
    setFormScore("10");
    setEditHomework(null);
    setShowForm(false);
    setFormError("");
  };

  const handleEdit = (hw) => {
    setEditHomework(hw);
    setFormQuestion(hw.question || "");
    setFormDeadline(hw.deadline ? hw.deadline.split("T")[0] : "");
    setFormScore(hw.score || "10");
    setShowForm(true);
    setSelectedHomework(null);
  };

  const handleCreate = async () => {
    if (!formQuestion.trim()) {
      setFormError("Введите текст задания");
      return;
    }
    setSubmitting(true);
    setFormError("");
    try {
      const fd = new FormData();
      fd.append("question", formQuestion.trim());
      fd.append("groupId", selectedGroupId);
      fd.append("score", formScore);
      if (formDeadline) fd.append("deadline", new Date(formDeadline).toISOString());
      if (editHomework) {
        await api.put(`/homeworks/${editHomework.id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/homeworks", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      resetForm();
      fetchHomeworks(selectedGroupId);
    } catch (err) {
      setFormError(err.response?.data?.message || "Ошибка сохранения");
    }
    setSubmitting(false);
  };

  const deleteHomeworkById = async (id) => {
    const paths = [`/homeworks/${id}`, `/homework/${id}`];
    let lastError = null;

    for (const path of paths) {
      try {
        return await api.delete(path);
      } catch (err) {
        lastError = err;
        const status = err?.response?.status;
        if (status === 404 || status === 405 || status === 400) {
          continue;
        }
        throw err;
      }
    }

    throw lastError;
  };

  const handleDelete = async (id) => {
    if (!confirm("Удалить домашнее задание?")) return;
    setDeletingId(id);
    try {
      await deleteHomeworkById(id);
      fetchHomeworks(selectedGroupId);
    } catch (err) {
      alert("Ошибка при удалении задания");
    } finally {
      setDeletingId(null);
    }
  };

  const openSubmissions = async (hw) => {
    setSelectedHomework(hw);
    setLoadingSubmissions(true);
    try {
      const res = await api.get(`/homeworks/${hw.id}/submissions`);
      setSubmissions(res.data);
    } catch {
      setSubmissions([]);
    }
    setLoadingSubmissions(false);
  };

  // Backend endi submissionId orqali aynan tanlangan ishni qabul qiladi.
  const handleApprove = async (sub) => {
    setApprovingId(sub.id);
    try {
      await api.post(`/homeworks/accept/${sub.studentId}`, { submissionId: sub.id });
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === sub.id ? { ...s, accepted: true, rejected: false } : s
        )
      );
    } catch (err) {
      alert("Ошибка при принятии");
    }
    setApprovingId(null);
  };

  // Rad etish: avval sabab yoziladigan modal ochiladi
  const openRejectModal = (sub) => {
    setRejectTarget(sub);
    setRejectReason("");
    setRejectReasonError("");
    setRejectModalOpen(true);
  };

  // REJECT tasdiqlash: sabab majburiy, backend ishni O'CHIRMAYDI,
  // rejected=true + rejectionReason saqlaydi, ratingdan 10 ball ayiradi.
  const confirmReject = async () => {
    const reason = rejectReason.trim();
    if (!reason) {
      setRejectReasonError("Напишите причину отклонения");
      return;
    }
    const sub = rejectTarget;
    setRejectingId(sub.id);
    try {
      await api.post(`/homeworks/reject/${sub.studentId}`, { reason, submissionId: sub.id });
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === sub.id
            ? { ...s, rejected: true, accepted: false, rejectionReason: reason }
            : s
        )
      );
      setRejectModalOpen(false);
    } catch (err) {
      alert("Ошибка при отклонении");
    }
    setRejectingId(null);
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
  const formatTime = (seconds) => {
    if (!seconds) return "";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}ч ${m}м`;
    return `${m}мин`;
  };
  const isDeadlineSoon = (d) => {
    if (!d) return false;
    const diff = new Date(d) - new Date();
    return diff > 0 && diff < 86400000 * 2;
  };
  const isPastDeadline = (d) => d && new Date(d) < new Date();

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-4 md:p-8 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-10 h-10 shadow-lg rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-indigo-200">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">Домашние задания</h1>
              <p className="text-sm text-gray-500 mt-0.5">Управление заданиями и проверка работ</p>
            </div>
          </div>
        </div>

        {/* Group Selector */}
        <div className="mb-6">
          <label className="block mb-2 text-xs font-semibold tracking-wider text-gray-500 uppercase">Выберите группу</label>
          <select
            value={selectedGroupId || ""}
            onChange={handleGroupChange}
            className="w-full max-w-md px-4 py-3 font-medium text-gray-800 transition-all duration-200 bg-white border border-gray-200 shadow-sm appearance-none cursor-pointer rounded-xl hover:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.75rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em" }}
          >
            <option value="">-- Выберите группу --</option>
            {groups.map((g) => (
              <option key={g.id} value={String(g.id)}>{g.name}</option>
            ))}
          </select>
        </div>

        {selectedGroupId && (
          <>
            {/* Toolbar */}
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all duration-200 ${showForm
                    ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    : "bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:from-indigo-600 hover:to-violet-700 shadow-indigo-200 hover:shadow-indigo-300"
                  }`}
              >
                <svg className={`w-4 h-4 transition-transform duration-200 ${showForm ? "rotate-45" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                {showForm ? "Отмена" : "Новое задание"}
              </button>
              {selectedHomework && (
                <button
                  onClick={() => setSelectedHomework(null)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 bg-white border border-gray-200 hover:bg-gray-50 transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Назад к списку
                </button>
              )}
            </div>

            {/* Create / Edit Form */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showForm ? "max-h-[500px] opacity-100 mb-6" : "max-h-0 opacity-0"}`}>
              <div className="p-6 bg-white border border-gray-100 shadow-lg rounded-2xl shadow-gray-100/50">
                <h3 className="mb-4 text-lg font-bold text-gray-900">{editHomework ? "Редактирование задания" : "Новое задание"}</h3>
                {formError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl text-sm mb-4">{formError}</div>
                )}
                <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-3">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Текст задания</label>
                    <textarea
                      value={formQuestion}
                      onChange={(e) => setFormQuestion(e.target.value)}
                      placeholder="Опишите задание для учеников..."
                      rows={3}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all duration-200 resize-none"
                    />
                  </div>
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Дедлайн</label>
                      <input
                        type="date"
                        value={formDeadline}
                        onChange={(e) => setFormDeadline(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Баллы</label>
                      <input
                        type="number"
                        value={formScore}
                        onChange={(e) => setFormScore(e.target.value)}
                        min="0"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleCreate}
                    disabled={submitting}
                    className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-200 hover:from-indigo-600 hover:to-violet-700 disabled:opacity-50 transition-all duration-200"
                  >
                    {submitting ? "Сохранение..." : editHomework ? "Обновить" : "Создать"}
                  </button>
                  <button
                    onClick={resetForm}
                    className="px-6 py-2.5 bg-gray-100 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-200 transition-all duration-200"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex items-start gap-6">
              {/* Homework List */}
              <div className={`${selectedHomework ? "hidden md:block md:w-[420px] flex-shrink-0" : "w-full"}`}>
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-indigo-200 rounded-full border-t-indigo-600 animate-spin" />
                      <span className="text-sm font-medium text-gray-400">Загрузка заданий...</span>
                    </div>
                  </div>
                ) : homeworks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 bg-white border border-gray-100 rounded-2xl">
                    <div className="flex items-center justify-center w-16 h-16 mb-4 bg-gray-100 rounded-2xl">
                      <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-500">Нет заданий для этой группы</p>
                    <p className="mt-1 text-xs text-gray-400">Нажмите «Новое задание» чтобы создать</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {homeworks.map((hw, idx) => {
                      const subCount = submissionsMap[hw.id]?.length || 0;
                      const acceptedCount = submissionsMap[hw.id]?.filter((s) => s.accepted).length || 0;
                      const rejectedCount = submissionsMap[hw.id]?.filter((s) => s.rejected).length || 0;
                      const isSelected = selectedHomework?.id === hw.id;
                      const deadlineSoon = isDeadlineSoon(hw.deadline);
                      const pastDeadline = isPastDeadline(hw.deadline);
                      return (
                        <div
                          key={hw.id}
                          onClick={() => openSubmissions(hw)}
                          className={`group relative bg-white rounded-2xl border transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-gray-100/80 ${isSelected
                              ? "border-indigo-300 shadow-lg shadow-indigo-100/60 ring-1 ring-indigo-200"
                              : "border-gray-100 shadow-sm hover:border-indigo-200"
                            }`}
                          style={{ animationDelay: `${idx * 50}ms` }}
                        >
                          <div className="p-5">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="text-[15px] font-bold text-gray-900 line-clamp-2">{hw.question}</h3>
                                  {deadlineSoon && !pastDeadline && (
                                    <span className="flex-shrink-0 px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
                                      Скоро дедлайн
                                    </span>
                                  )}
                                  {pastDeadline && (
                                    <span className="flex-shrink-0 px-2 py-0.5 bg-gray-100 border border-gray-200 text-gray-500 text-[10px] font-bold rounded-full uppercase tracking-wider">
                                      Просрочено
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1 ml-3 transition-opacity duration-200 opacity-0 group-hover:opacity-100">
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleEdit(hw); }}
                                  className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-150"
                                  title="Редактировать"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                  </svg>
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleDelete(hw.id); }}
                                  disabled={deletingId === hw.id}
                                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-30 transition-all duration-150"
                                  title="Удалить"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-400">
                              {hw.deadline && (
                                <span className="flex items-center gap-1.5">
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  {formatDate(hw.deadline)}
                                </span>
                              )}
                              {hw.score && (
                                <span className="flex items-center gap-1.5">
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                                  </svg>
                                  {hw.score} баллов
                                </span>
                              )}
                              <span className="flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                </svg>
                                {acceptedCount}/{subCount} сдано
                              </span>
                              {subCount > 0 && (
                                <div className="flex-1 h-1 ml-2 overflow-hidden bg-gray-100 rounded-full">
                                  <div
                                    className="h-full transition-all duration-500 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500"
                                    style={{ width: `${subCount ? (acceptedCount / subCount) * 100 : 0}%` }}
                                  />
                                </div>
                              )}
                            </div>
                            {rejectedCount > 0 && (
                              <div className="mt-2 text-[11px] text-gray-400">
                                {rejectedCount} отклонено
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Submissions Panel */}
              {selectedHomework && (
                <div className="flex-1 w-full min-w-0">
                  <div className="sticky overflow-hidden bg-white border border-gray-100 shadow-lg rounded-2xl shadow-gray-100/50 top-4">
                    <div className="px-6 py-4 border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-lg font-bold text-gray-900 line-clamp-1">{selectedHomework.question}</h2>
                          <p className="text-sm text-gray-500 mt-0.5">Работы учеников</p>
                        </div>
                        <button
                          onClick={() => setSelectedHomework(null)}
                          className="p-2 text-gray-400 transition-all duration-200 rounded-xl hover:text-gray-600 hover:bg-gray-100 md:hidden"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="max-h-[600px] overflow-y-auto">
                      {loadingSubmissions ? (
                        <div className="flex items-center justify-center py-16">
                          <div className="flex flex-col items-center gap-3">
                            <div className="border-2 border-indigo-200 rounded-full w-7 h-7 border-t-indigo-600 animate-spin" />
                            <span className="text-sm text-gray-400">Загрузка работ...</span>
                          </div>
                        </div>
                      ) : submissions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16">
                          <div className="flex items-center justify-center mb-3 w-14 h-14 rounded-2xl bg-gray-50">
                            <svg className="text-gray-300 w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                            </svg>
                          </div>
                          <p className="text-sm font-medium text-gray-500">Нет отправленных работ</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-50">
                          {submissions.map((sub) => {
                            const isAccepted = sub.accepted;
                            const isRejected = sub.rejected && !sub.accepted;
                            const isPending = !sub.accepted && !sub.rejected;

                            return (
                              <div key={sub.id} className="px-6 py-4 transition-colors duration-150 hover:bg-gray-50/50">
                                <div className="flex items-center gap-4">
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${isAccepted
                                      ? "bg-emerald-100 text-emerald-700"
                                      : isRejected
                                        ? "bg-red-100 text-red-600"
                                        : "bg-indigo-50 text-indigo-600"
                                    }`}>
                                    {isAccepted ? (
                                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                      </svg>
                                    ) : isRejected ? (
                                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    ) : (
                                      sub.student?.name?.[0] || "?"
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 truncate">{sub.student?.name || `Ученик #${sub.studentId}`}</p>
                                    <div className="flex items-center gap-3 mt-0.5">
                                      {sub.usedTime > 0 && (
                                        <span className="text-xs text-gray-400">{formatTime(sub.usedTime)}</span>
                                      )}
                                      {sub.desc && (
                                        <div className="flex items-center min-w-0 gap-2">
                                          <span className="text-xs text-gray-400 truncate max-w-[200px]">{sub.desc}</span>
                                          {sub.desc.length > 60 && (
                                            <button
                                              onClick={() => { setActiveComment(sub.desc); setCommentModalOpen(true); }}
                                              className="flex items-center flex-shrink-0 gap-1 text-xs font-medium text-indigo-500 hover:text-indigo-700"
                                            >
                                              <FiMaximize2 className="w-3 h-3" /> Ещё
                                            </button>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                    {sub.code && (
                                      <div className="mt-1.5">
                                        {sub.code.includes("github.com") || sub.code.startsWith("http") ? (
                                          <a
                                            href={sub.code}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="flex items-center gap-1 text-xs font-medium text-indigo-500 hover:text-indigo-700"
                                          >
                                            <FiExternalLink className="w-3 h-3" /> Открыть ссылку
                                          </a>
                                        ) : (
                                          <button
                                            onClick={() => { setActiveCode(sub.code); setCodeModalOpen(true); }}
                                            className="flex items-center gap-1 text-xs font-medium text-indigo-500 hover:text-indigo-700"
                                          >
                                            <FiCode className="w-3 h-3" /> Посмотреть код
                                          </button>
                                        )}
                                      </div>
                                    )}
                                    {sub.imageUrl && (
                                      <a
                                        href={sub.imageUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 mt-1 text-xs font-medium text-indigo-500 hover:text-indigo-700"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                                        </svg>
                                        Открыть изображение
                                      </a>
                                    )}
                                  </div>
                                  <div className="flex items-center flex-shrink-0 gap-2">
                                    {isAccepted ? (
                                      <span className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-lg">
                                        Принято
                                      </span>
                                    ) : isRejected ? (
                                      <span className="px-3 py-1.5 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-lg">
                                        Не принято
                                      </span>
                                    ) : (
                                      <div className="flex items-center gap-1.5">
                                        <button
                                          onClick={() => handleApprove(sub)}
                                          disabled={approvingId === sub.id}
                                          className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs font-semibold rounded-lg shadow-sm hover:from-emerald-600 hover:to-green-600 disabled:opacity-50 transition-all duration-200"
                                        >
                                          {approvingId === sub.id ? (
                                            <span className="flex items-center gap-1.5">
                                              <div className="w-3 h-3 border-[1.5px] border-white/40 border-t-white rounded-full animate-spin" />
                                            </span>
                                          ) : (
                                            "Принять"
                                          )}
                                        </button>
                                        <button
                                          onClick={() => openRejectModal(sub)}
                                          disabled={rejectingId === sub.id}
                                          className="px-3 py-1.5 bg-white border border-gray-200 text-gray-500 text-xs font-semibold rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 disabled:opacity-50 transition-all duration-200"
                                        >
                                          {rejectingId === sub.id ? "Сохранение..." : "Не принято"}
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Empty State - No Group Selected */}
        {!selectedGroupId && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="flex items-center justify-center w-20 h-20 mb-6 shadow-lg rounded-3xl bg-gradient-to-br from-indigo-100 to-violet-100 shadow-indigo-100/50">
              <svg className="w-10 h-10 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
            </div>
            <h2 className="mb-2 text-xl font-bold text-gray-900">Выберите группу</h2>
            <p className="max-w-sm text-sm leading-relaxed text-center text-gray-500">
              Выберите группу из списка выше, чтобы просмотреть домашние задания и работы учеников
            </p>
          </div>
        )}
      </div>

      {/* CODE VIEW MODAL */}
      {codeModalOpen && (<div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
        <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-sm" onClick={() => setCodeModalOpen(false)}></div>
        <div className="relative bg-[#0F172A] w-full max-w-4xl h-[80vh] rounded-2xl flex flex-col shadow-2xl border border-gray-700 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-900/50">
            <div className="flex items-center gap-3 text-gray-200">
              <FiCode size={16} className="text-indigo-400" />
              <span className="text-sm font-bold tracking-wider uppercase">Код ученика</span>
            </div>
            <button
              onClick={() => { setActiveCode(""); setCodeModalOpen(false); }}
              className="text-gray-400 transition-colors hover:text-white"
            >
              <FiX size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-auto bg-[#0F172A]">
            <SyntaxHighlighter
              language="html"
              style={atomDark}
              customStyle={{ margin: 0, padding: "24px", fontSize: "13px", background: "transparent" }}
              showLineNumbers={true}
            >
              {activeCode}
            </SyntaxHighlighter>
          </div>
        </div>
      </div>
      )}

      {/* COMMENT VIEW MODAL */}
      {commentModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-sm" onClick={() => setCommentModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-2xl max-h-[80vh] rounded-2xl flex flex-col shadow-2xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <FiFileText size={16} className="text-indigo-400" />
                <span className="text-sm font-bold tracking-wider text-gray-800 uppercase">Комментарий ученика</span>
              </div>
              <button
                onClick={() => { setActiveComment(""); setCommentModalOpen(false); }}
                className="text-gray-400 transition-colors hover:text-gray-600"
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="flex-1 p-6 overflow-auto text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">
              {activeComment}
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
              onChange={(e) => { setRejectReason(e.target.value); setRejectReasonError(""); }}
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
                disabled={rejectingId === rejectTarget?.id}
                className="px-4 py-2 text-xs font-bold text-white transition-all bg-red-500 rounded-xl hover:bg-red-600 disabled:opacity-50"
              >
                {rejectingId === rejectTarget?.id ? (
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
    </>
  );
};

export default Homeworks;
