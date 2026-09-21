import { useState } from "react";
import { useNavigate, useLocation, Link } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';

import logo from './../../assets/logo.png';
import { findMenuContextByPath } from '../../utils/menu-utils';
import { BellIcon } from '@heroicons/react/24/solid';
import NotificationPanel from "../Shared/NotificationPanel";
import NameApp from "../Shared/NameApp";

export default function TopBar({ onRefreshView }) {

  const location = useLocation();
  const navigate = useNavigate();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [loadingLogout, setLoadingLogout] = useState(false);
  const { user, menu, logoutContext } = useAuth();

  // Menú superior: viene del backend ya filtrado por permisos.
  // Los módulos con hideFromTop se mantienen en estructura (sidebar) pero no salen en el topBar.
  const filteredTopItems = menu.filter((item) => !item.hideFromTop);

  // Derive active menu from the current URL
  const context = findMenuContextByPath(location.pathname, menu);
  const activeMenu = context?.activeMenu || null;

  // Clic en el módulo que YA está activo: vuelve al inicio del módulo y remonta la vista.
  const handleMenuClick = (item) => {
    if (activeMenu === item.id) {
      if (item.path && location.pathname !== item.path) navigate(item.path);
      onRefreshView?.();
      return;
    }
    navigate(item.path || '/');
  };

  const handleLogout = async (e) => {

    e.preventDefault(); 
    setLoadingLogout(true);
    const data = await logoutContext();

    if (data.status === 'success') {
      navigate('/login');
    }
    setLoadingLogout(false);
  };
// console.log("user", user)
  return (
    <header className="topbar">
      <div className="brand-area">
        <div onClick={() => navigate('/')}>
          <NameApp />
        </div>
        <nav className="top-menu" aria-label="Main menu">
          {filteredTopItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item)}
              className={activeMenu === item.id ? 'active' : ''}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="user-block flex items-center gap-5 ">
        <div className="relative">
          <div
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className={`shrink-0 rounded-full bg-[#2f3d44] border p-2 transition-all duration-200
              ${isNotifOpen ? 'border-[#63bffd] shadow-[0_0_10px_#9fd8ff44]' : 'border-[#ffffff21] hover:border-[#9fd8ff]'}
            `}
          >
            <BellIcon className='w-7 h-7 text-white' />
            <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-[#9fd8ff] border-2 border-[#2f3d44]"></span>
          </div>

          <NotificationPanel isOpen={isNotifOpen} />
        </div>
        <div className="flex flex-col">
          <div className="name">{user?.name}</div>
          <div className="dept">{user.roleName ?? ''}</div>
          <div className="sesion">
            <Link
              to="/"
              onClick={ (e) => handleLogout(e)}
              className="text-sm text-[#9fd8ff]! hover:text-white! transition-colors font-medium"
            >
              {loadingLogout ? 'Cerrando Sesión...' : 'Cerrar sesión'}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}