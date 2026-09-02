import api from './axios';

// Thin wrapper around /api/academy/admin/* — mirrors
// STB-BACKEND/src/modules/academy/admin/admin.routes.ts one endpoint per
// function, so a route added on the backend shows up here as one new line.
const unwrap = (promise) => promise.then((res) => res.data.data);

export const academyAdmin = {
  // --- People ---------------------------------------------------------------
  lookupPhone: (phone) =>
    unwrap(api.get('/academy/admin/students/lookup', { params: { phone } })),

  listUsers: (params) => unwrap(api.get('/academy/admin/users', { params })),

  /** Creates an ACADEMY account: phone, name and the password they log in with. */
  createStudent: (data) => unwrap(api.post('/academy/admin/students', data)),

  setAccountType: (id, accountType) =>
    unwrap(api.patch(`/academy/admin/students/${id}`, { accountType })),

  // --- Course access --------------------------------------------------------
  listStudentAccess: (studentId) =>
    unwrap(api.get(`/academy/admin/students/${studentId}/access`)),

  grantStudentAccess: (studentId, { courseIds, expiresAt, note }) =>
    unwrap(
      api.post(`/academy/admin/students/${studentId}/access`, {
        courseIds,
        expiresAt,
        note,
      }),
    ),

  revokeStudentAccess: (studentId, courseId) =>
    unwrap(api.delete(`/academy/admin/students/${studentId}/access/${courseId}`)),

  listCourseAccess: (courseId) =>
    unwrap(api.get(`/academy/admin/courses/${courseId}/access`)),

  grantCourseAccess: (courseId, { studentIds, expiresAt, note }) =>
    unwrap(
      api.post(`/academy/admin/courses/${courseId}/access`, {
        studentIds,
        expiresAt,
        note,
      }),
    ),

  revokeCourseAccess: (courseId, studentId) =>
    unwrap(api.delete(`/academy/admin/courses/${courseId}/access/${studentId}`)),

  // --- Courses --------------------------------------------------------------
  listCourses: (status) =>
    unwrap(api.get('/academy/admin/courses', { params: status ? { status } : {} })),

  getCourse: (id) => unwrap(api.get(`/academy/admin/courses/${id}`)),

  createCourse: (data) => unwrap(api.post('/academy/admin/courses', data)),

  updateCourse: (id, data) => unwrap(api.patch(`/academy/admin/courses/${id}`, data)),

  setCourseStatus: (id, status) =>
    unwrap(api.patch(`/academy/admin/courses/${id}/status`, { status })),

  deleteCourse: (id) => unwrap(api.delete(`/academy/admin/courses/${id}`)),

  // --- Curriculum -----------------------------------------------------------
  createModule: (courseId, data) =>
    unwrap(api.post(`/academy/admin/courses/${courseId}/modules`, data)),

  updateModule: (moduleId, data) =>
    unwrap(api.patch(`/academy/admin/modules/${moduleId}`, data)),

  deleteModule: (moduleId) => unwrap(api.delete(`/academy/admin/modules/${moduleId}`)),

  createLesson: (moduleId, data) =>
    unwrap(api.post(`/academy/admin/modules/${moduleId}/lessons`, data)),

  updateLesson: (lessonId, data) =>
    unwrap(api.patch(`/academy/admin/lessons/${lessonId}`, data)),

  deleteLesson: (lessonId) => unwrap(api.delete(`/academy/admin/lessons/${lessonId}`)),

  setLessonVideo: (lessonId, data) =>
    unwrap(api.put(`/academy/admin/lessons/${lessonId}/video`, data)),

  deleteLessonVideo: (lessonId) =>
    unwrap(api.delete(`/academy/admin/lessons/${lessonId}/video`)),
};

export default academyAdmin;
