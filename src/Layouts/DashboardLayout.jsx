import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  HiOutlineUsers,
  HiOutlineNewspaper,
  HiOutlineClipboardCheck,
  HiOutlineFolderOpen,
  HiOutlineLogout,
  HiOutlineHome,
  HiOutlineDocumentText,
  HiOutlineCloudDownload,
  HiOutlineAcademicCap,
  HiOutlineUserGroup,
  HiOutlineIdentification
} from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { useMode } from '../context/ModeContext';
import Logo from '../images/logo.png';

const OFFLINE_ITEMS = [
  { path: '/', label: 'Обзор', icon: <HiOutlineHome size={20} />, exact: true },
  { path: '/students', label: 'Студенты', icon: <HiOutlineUsers size={20} /> },
  { path: '/news', label: 'Новости', icon: <HiOutlineNewspaper size={20} /> },
  { path: '/task', label: 'Уроки', icon: <HiOutlineClipboardCheck size={20} /> },
  { path: '/groups', label: 'Группы', icon: <HiOutlineFolderOpen size={20} /> },
  { path: '/homeworks', label: 'Домашние задания', icon: <HiOutlineDocumentText size={20} /> },
  { path: '/resources', label: 'Ресурсы', icon: <HiOutlineCloudDownload size={20} /> },
];

const ACADEMY_ITEMS = [
  { path: '/academy/courses', label: 'Курсы', icon: <HiOutlineAcademicCap size={20} />, exact: true },
  { path: '/academy/students', label: 'Пользователи', icon: <HiOutlineUserGroup size={20} /> },
  { path: '/academy/teachers', label: 'Преподаватели', icon: <HiOutlineIdentification size={20} /> },
];

const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { mode, setMode } = useMode();

  const isActive = (path) => location.pathname === path;

  const menuItems = mode === 'academy' ? ACADEMY_ITEMS : OFFLINE_ITEMS;

  const isActiveRoute = (path, exact) => {
    if (exact) return location.pathname === path;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="relative flex min-h-screen overflow-hidden font-sans text-[#334155]">

      {/* AMBIENT BACKDROP — the colour the glass panels blur against */}
      <div className="fixed inset-0 -z-10 bg-[#EEF2FF]">
        <div className="absolute rounded-full -top-40 -left-32 w-[32rem] h-[32rem] bg-indigo-400/40 blur-3xl" />
        <div className="absolute rounded-full top-1/3 -right-24 w-[28rem] h-[28rem] bg-violet-400/30 blur-3xl" />
        <div className="absolute rounded-full bottom-0 left-1/4 w-[26rem] h-[26rem] bg-sky-300/30 blur-3xl" />
      </div>

      {/* SIDEBAR */}
      <aside className="w-72 bg-slate-900/70 backdrop-blur-2xl border-r border-white/10 flex flex-col sticky top-0 h-screen shadow-2xl shadow-slate-900/20">

        {/* LOGO */}
        <div className="flex items-center h-20 px-6 border-b border-white/10">
          <img src={Logo} alt="Logo" className="object-contain mr-3 w-9 h-9" />
          <div className="flex flex-col">
            <span className="text-lg font-extrabold tracking-tight text-white">BITSOFT</span>
            <span className="text-[10px] text-indigo-400 font-bold tracking-[1.5px] -mt-1 uppercase">Admin Panel</span>
          </div>
        </div>

        {/* SECTION TABS */}
        <div className="flex mx-4 mt-4 p-1 rounded-lg bg-white/5 backdrop-blur-md border border-white/10">
          <button
            onClick={() => { setMode('offline'); navigate('/'); }}
            className={`flex-1 px-3 py-2 rounded-md text-xs font-bold uppercase tracking-widest transition-all ${
              mode !== 'academy'
                ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Bitsoft
          </button>
          <button
            onClick={() => { setMode('academy'); navigate('/academy/courses'); }}
            className={`flex-1 px-3 py-2 rounded-md text-xs font-bold uppercase tracking-widest transition-all ${
              mode === 'academy'
                ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Академия
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 px-4 mt-6 space-y-1">
          <p className="px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-4">Управление</p>

          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
                isActiveRoute(item.path, item.exact)
                ? 'bg-white/10 backdrop-blur-md text-white border-l-4 border-indigo-400'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className={`${isActiveRoute(item.path, item.exact) ? 'text-indigo-400' : 'text-slate-500'}`}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* ADMIN PROFILE */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5 backdrop-blur-md border border-white/5">
            <div className="flex items-center justify-center w-10 h-10 text-xs font-bold text-white rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600">
              B
            </div>
            <div className="flex flex-col flex-1 overflow-hidden">
              <span className="text-xs font-bold text-white truncate">Bitsoft</span>
              <span className="text-[10px] text-indigo-400 font-medium">Super Admin</span>
            </div>
            <button
              onClick={() => { logout(); navigate('/login', { replace: true }); }}
              className="transition-colors text-slate-500 hover:text-red-400"
            >
               <HiOutlineLogout size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="z-10 flex items-center justify-between h-16 px-10 bg-white/50 backdrop-blur-xl border-b border-white/60 shadow-sm shadow-slate-900/5">
          <h2 className="text-sm font-bold tracking-widest uppercase text-slate-800">
            {menuItems.find(i => isActiveRoute(i.path, i.exact))?.label || 'Обзор'}
          </h2>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/40 backdrop-blur-md border border-white/50">
               <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
               <span className="text-[11px] font-bold text-slate-500 uppercase">Система онлайн</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <section className="flex-1 overflow-y-auto p-8 lg:p-12">
          <div className="max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </section>
      </main>
    </div>
  );
};

export default DashboardLayout;
