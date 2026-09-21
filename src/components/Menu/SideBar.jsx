import { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation, NavLink, Link, useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

import { findMenuContextByPath } from "../../utils/menu-utils";
import { buildAllPaths } from "../../utils/sidebar-menu-utils";

import HasPermission from "../Shared/HasPermission";

function renderNode(nodes, path = [], onItemClick, activePath, toggleCollapse, collapsed) {
  return (nodes || []).map((node) => {
    const hasChildren = Boolean(node.children?.length);
    const currentPath = [...path, node.id];
    const isActive = JSON.stringify(activePath) === JSON.stringify(currentPath);
    const isCollapsed = collapsed[JSON.stringify(currentPath)] !== false;

    return (
      <div key={node.id} style={{ marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {hasChildren ? (
            <>
              <button className="skip-style-btn arrow-btn" onClick={() => toggleCollapse(JSON.stringify(currentPath))}>
                {isCollapsed ? "▶" : "▼"}
              </button>

              <button
                onClick={() => toggleCollapse(JSON.stringify(currentPath))}
                className={`submenu-btn ${isActive ? 'active' : ''}`}
                style={{
                  textAlign: 'left',
                  background: 'transparent',
                  paddingLeft: 8,
                  color: isActive ? '#fff' : 'inherit',
                  fontWeight: isActive ? 'bold' : 'normal'
                }}
              >
                {node.label || node.id}
              </button>
            </>
          ) : (
            <>
              <div style={{ width: 20 }} />
              <NavLink
                to={node.path || '#'}
                onClick={(e) => onItemClick?.(e, node)}
                className={({ isActive: navActive }) => `submenu-btn ${navActive ? 'active' : ''}`}
                style={({ isActive: navActive }) => ({
                  color: (isActive || navActive) ? "#fff" : "inherit",
                  fontWeight: (isActive || navActive) ? "bold" : "normal",
                  paddingLeft: 8
                })}
              >
                {node.label || node.id}
              </NavLink>
            </>
          )}
        </div>

        {hasChildren && !isCollapsed && (
          <div style={{ marginLeft: 20 }}>
            {renderNode(node.children, currentPath, onItemClick, activePath, toggleCollapse, collapsed)}
          </div>
        )}
      </div>
    );
  });
}

export default function SideBar({ isSidebarOpen, onRefreshView }) {
  const location = useLocation();
  const pathname = location.pathname;
  const navigate = useNavigate();
  const { menu } = useAuth(); // Menú del usuario (ya filtrado por permisos en el backend)
  const context = findMenuContextByPath(pathname, menu);

  const activeMenu = context?.activeMenu || null;
  const activePath = context?.activePath || [];

  // Rama del sidebar: hijos del módulo activo del menú superior
  const branch = menu.find((item) => item.id === activeMenu)?.children || [];

  const initialCollapsed = useMemo(() => buildAllPaths(branch), [branch]);
  const [collapsed, setCollapsed] = useState(initialCollapsed);

  // Reset collapsed state when the computed initialCollapsed actually changes
  useEffect(() => {
    const currKeys = Object.keys(collapsed);
    const initKeys = Object.keys(initialCollapsed);
    let different = false;
    if (currKeys.length !== initKeys.length) different = true;
    else {
      for (const k of initKeys) {
        if (collapsed[k] !== initialCollapsed[k]) { different = true; break; }
      }
    }
    if (different) setCollapsed(initialCollapsed);
  }, [initialCollapsed]);

  // Índice id → item del menú (para etiquetas y rutas de las migas)
  const itemsById = useMemo(() => {
    const map = new Map();
    const walk = (nodes) => {
      for (const n of nodes) {
        map.set(n.id, n);
        if (n.children?.length) walk(n.children);
      }
    };
    walk(menu);
    return map;
  }, [menu]);

  // Resuelve la ruta a la que pertenece un item: su propio path o el primer descendiente con path real 
  // (para contenedores tipo Planificación).
  const resolveItemPath = useCallback((item) => {
    if (!item) return null;
    if (item.path && item.path !== '#') return item.path;
    for (const child of item.children || []) {
      const p = resolveItemPath(child);
      if (p) return p;
    }
    return null;
  }, []);

  // Clic en un item del sidebar que ya corresponde a la ruta actual (o a una ruta padre
  // de la actual): se remonta la vista para volver a pedir la data al backend.
  const handleItemClick = useCallback((e, node) => {
    const target = node.path;
    if (!target || target === '#') return;

    const isCurrentBranch = pathname === target || pathname.startsWith(`${target}/`);
    if (isCurrentBranch) onRefreshView?.();
  }, [pathname, onRefreshView]);

  // Show sidebar when the active module has children to show
  const shouldShow = activeMenu && branch.length > 0 && activeMenu !== 'IA';
  if (!shouldShow) {
    return <aside className="sidebar hidden" />;
  }

  const toggleCollapse = (pathKey) => {
    setCollapsed(prev => ({
      ...prev,
      [pathKey]: !prev[pathKey]
    }));
  };

  // Breadcrumb building helper
  const breadcrumbSegments = activeMenu ? [activeMenu, ...activePath] : [];

  return (
    <aside className={`sidebar
        bg-gray-800 text-white h-full transition-transform duration-300
        lg:translate-x-0 lg:static lg:block
        fixed top-0 left-0 w-64 z-40
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}  text-sm sm:text-base
      `}
    >

      <div className="submenu-title">Secciones</div>

      {/* Breadcrumbs */}
      <div className="mb-3 flex flex-wrap items-center gap-1 rounded-lg bg-[#667eea14] px-2 py-1.5 text-xs">
        {breadcrumbSegments.length > 0 ? (
          breadcrumbSegments.map((seg, idx) => {
            const isLast = idx === breadcrumbSegments.length - 1;
            const item = itemsById.get(seg);
            const label = item?.label || seg;
            const linkPath = resolveItemPath(item);
            return (
              <span key={seg} className="inline-flex items-center gap-1">
                {idx > 0 && <span className="select-none text-gray-500">›</span>}
                {isLast ? (
                  <span className="font-semibold text-white">{label}</span>
                ) : linkPath ? (
                  <Link
                    to={linkPath}
                    className="font-medium text-[#9fd8ff] transition-colors hover:text-white hover:underline"
                  >
                    {label}
                  </Link>
                ) : (
                  <span className="text-gray-400">{label}</span>
                )}
              </span>
            );
          })
        ) : (
          <Link to="/" className="font-medium text-[#9fd8ff] transition-colors hover:text-white hover:underline">
            Inicio
          </Link>
        )}
      </div>

      <div>
        {renderNode(branch, [], handleItemClick, activePath, toggleCollapse, collapsed)}
      </div>
    </aside>
  );
}