import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import TopBar from '../Menu/TopBar';
import SideBar from '../Menu/SideBar';
import Footer from '../Footer';
import { useInactivityTimer } from '../../hooks/useInactivityTimer';
import { useAuth } from '../../context/AuthContext';
import InactivityWarning from './InactivityWarning';

/**
 * MainLayout — wraps all authenticated pages with the global chrome:
 * TopBar (auto-detects active menu from URL),
 * SideBar (auto-detects which branch to show from URL),
 * Footer, and the routed page content.
 *
 * Can be used in two ways:
 * 1. As a route layout (with <Outlet />) — when nested inside <Routes>
 * 2. As a direct wrapper (with children) — for programmatic use
 */
export default function MainLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // Cambiar esta clave fuerza el remontaje de la vista activa ("recargar" sin F5)
  const [viewRefreshKey, setViewRefreshKey] = useState(0);
  const { logoutDueToInactivity, logoutContext } = useAuth();
  const location = useLocation();

  // Timer de inactividad — 15 min timeout, muestra advertencia 2 min antes
  const { showWarning, remainingSeconds, resetTimer } = useInactivityTimer({
    timeoutMinutes: 15,
    warningMinutes: 2,
    onExpire: logoutDueToInactivity,
  });

  // Resetear el timer en cada navegación (cambio de ruta SPA)
  useEffect(() => {
    resetTimer();
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleExtendSession = () => {
    resetTimer();
  };

  const handleCloseSession = () => {
    logoutContext();
  };

  // Fuerza el remontaje de la ruta activa equivale a "recargar" la vista, sin F5.
  const handleRefreshView = useCallback(() => {
    setViewRefreshKey((key) => key + 1);
  }, []);

  return (
    <div className="min-h-screen bg-[#1e2022] flex flex-col">
      <TopBar onRefreshView={handleRefreshView} />

      <div className="flex flex-1">
        {/* Mobile sidebar toggle */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="sidebar-button lg:hidden fixed top-4 left-4 z-50 text-white px-3 py-2 rounded-md shadow-md"
        >
          MENÚ ☰
        </button>

        <SideBar isSidebarOpen={isSidebarOpen} onRefreshView={handleRefreshView} />

        <main className="workspace flex-1">
          {/* La key remonta la vista cuando se hace clic en la opción de menú ya activa */}
          {children || <Outlet key={viewRefreshKey} />}
        </main>
      </div>

      <Footer />

      {/* Modal de advertencia por inactividad */}
      {showWarning && (
        <InactivityWarning
          remainingSeconds={remainingSeconds}
          onExtend={handleExtendSession}
          onClose={handleCloseSession}
        />
      )}
    </div>
  );
}