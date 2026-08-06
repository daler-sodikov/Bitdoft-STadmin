import api from "./axios";

export const findBackendTargetSubmission = async (studentId) => {
  const res = await api.get(`/homeworks/submissions/student/${studentId}`);
  const list = res?.data?.data;
  if (!Array.isArray(list) || list.length === 0) return null;
  const pending = list.filter((s) => !s.accepted && !s.rejected);
  if (pending.length === 0) return null;
  return [...pending].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )[0];
};

// Blok xabari uchun: qaysi eski ish avval qayta ishlanishi kerakligini ko'rsatadi
export const earliestWorkNote = (target) => {
  const question = target?.homework?.question;
  const date = target?.createdAt
    ? new Date(target.createdAt).toLocaleString("ru-RU", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";
  return question ? `«${question}» (${date})` : date;
};
