import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import DashboardLayout from './Layouts/DashboardLayout';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Signup from './components/Signup';
import News from './components/News';
import CreateTask from './components/CreateTask';
import GetGroup from './components/GetGroup';
import Homeworks from './components/Homeworks';
import Resources from './components/Resources';
import AcademyCourses from './components/academy/AcademyCourses';
import AcademyCourseDetail from './components/academy/AcademyCourseDetail';
import AcademyStudents from './components/academy/AcademyStudents';
import AcademyTeachers from './components/academy/AcademyTeachers';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="students" element={<Signup />} />
        <Route path="news" element={<News />} />
        <Route path="task" element={<CreateTask />} />
        <Route path="groups" element={<GetGroup />} />
        <Route path="homeworks" element={<Homeworks />} />
        <Route path="resources" element={<Resources />} />
        <Route path="academy/courses" element={<AcademyCourses />} />
        <Route path="academy/courses/:id" element={<AcademyCourseDetail />} />
        <Route path="academy/students" element={<AcademyStudents />} />
        <Route path="academy/teachers" element={<AcademyTeachers />} />
      </Route>
      <Route path="*" element={<h1 className="p-10">404 - Страница не найдена</h1>} />
    </Routes>
  );
}

export default App;
