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
  HiOutlineSwitchHorizontal
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
];

const MODE_LABEL = { offline: 'Bitsoft', academy: 'Академия' };

const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { mode } = useMode();

  const isActive = (path) => location.pathname === path;

  const menuItems = mode === 'academy' ? ACADEMY_ITEMS : OFFLINE_ITEMS;

  const isActiveRoute = (path, exact) => {
    if (exact) return location.pathname === path;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-[#334155]">
      
      {/* SIDEBAR */}
      <aside className="w-72 bg-[#0F172A] flex flex-col sticky top-0 h-screen">
        
        {/* LOGO */}
        <div className="flex items-center h-20 px-6 border-b border-white/10">
          <img src={Logo} alt="Logo" className="object-contain mr-3 w-9 h-9" />
          <div className="flex flex-col">
            <span className="text-lg font-extrabold tracking-tight text-white">BITSOFT</span>
            <span className="text-[10px] text-indigo-400 font-bold tracking-[1.5px] -mt-1 uppercase">Admin Panel</span>
          </div>
        </div>

        {/* SECTION SWITCHER */}
        <button
          onClick={() => navigate('/mode')}
          className="flex items-center justify-between mx-4 mt-4 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:border-indigo-500/40 hover:bg-white/10 transition-all group"
        >
          <span className="text-xs font-bold text-white uppercase tracking-widest">
            {MODE_LABEL[mode] || 'Bitsoft'}
          </span>
          <HiOutlineSwitchHorizontal size={16} className="text-slate-500 group-hover:text-indigo-400" />
        </button>

        {/* NAVIGATION */}
        <nav className="flex-1 px-4 mt-6 space-y-1">
          <p className="px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-4">Управление</p>

          {menuItems.map((item) => (
            <Link 
              key={item.path}
              to={item.path} 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
                isActiveRoute(item.path, item.exact) 
                ? 'bg-gradient-to-r from-indigo-500/20 to-violet-500/20 text-white border-l-4 border-indigo-400' 
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
        <div className="p-4 border-t border-white/10 bg-[#0F172A]">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5">
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
        <header className="z-10 flex items-center justify-between h-16 px-10 bg-white border-b shadow-sm border-slate-200">
          <h2 className="text-sm font-bold tracking-widest uppercase text-slate-800">
            {menuItems.find(i => isActiveRoute(i.path, i.exact))?.label || 'Обзор'}
          </h2>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
               <span className="text-[11px] font-bold text-slate-500 uppercase">Система онлайн</span>
            </div>
          </div>
        </header>
        
        {/* Content */}
        <section className="flex-1 overflow-y-auto bg-[#F8FAFC] p-8 lg:p-12">
          <div className="max-w-[1600px] mx-auto">
            <Outlet /> 
          </div>
        </section>
      </main>
    </div>
  );
};

export default DashboardLayout;
