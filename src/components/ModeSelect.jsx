import { useNavigate } from 'react-router-dom';
import { HiOutlineAcademicCap, HiOutlineUserGroup, HiOutlineLogout } from 'react-icons/hi';
import { useMode } from '../context/ModeContext';
import { useAuth } from '../context/AuthContext';
import Logo from '../images/logo.png';

const CARDS = [
  {
    mode: 'offline',
    title: 'Bitsoft',
    subtitle: 'Офлайн студенты, группы, домашние задания',
    icon: <HiOutlineUserGroup size={28} />,
    to: '/',
  },
  {
    mode: 'academy',
    title: 'Академия',
    subtitle: 'Онлайн курсы, уроки, доступ',
    icon: <HiOutlineAcademicCap size={28} />,
    to: '/academy/courses',
  },
];

export default function ModeSelect() {
  const { setMode } = useMode();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const choose = (card) => {
    setMode(card.mode);
    navigate(card.to, { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
          <img src={Logo} alt="BitSoft" className="w-12 h-12 mx-auto mb-3 rounded-xl" />
          <h1 className="text-2xl font-extrabold text-white tracking-tight">BITSOFT</h1>
          <p className="text-sm text-slate-400 mt-1 font-medium">Какой раздел открыть?</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CARDS.map((card) => (
            <button
              key={card.mode}
              onClick={() => choose(card)}
              className="text-left bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm hover:bg-white/10 hover:border-indigo-500/40 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mb-4 text-white shadow-lg shadow-indigo-500/20">
                {card.icon}
              </div>
              <h2 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                {card.title}
              </h2>
              <p className="text-xs text-slate-400 mt-1">{card.subtitle}</p>
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            logout();
            navigate('/login', { replace: true });
          }}
          className="w-full flex items-center justify-center gap-2 mt-8 text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-red-400 transition-colors"
        >
          <HiOutlineLogout size={16} /> Выйти
        </button>
      </div>
    </div>
  );
}
