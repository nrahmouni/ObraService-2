import React from 'react';
import { Navigate } from 'react-router-dom';
import { User, UserRole, Role } from '../types';
import { ShieldAlert } from 'lucide-react';

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  'MAIN_CONTRACTOR_ADMIN': 3,
  'SITE_MANAGER': 2,
  'SUBCONTRACTOR_USER': 1,
};

interface ProtectedRouteProps {
  currentUser: User | null;
  allowedRoles?: (UserRole | Role)[];
  minRole?: UserRole | Role;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  currentUser,
  allowedRoles,
  minRole,
  fallback,
  children,
}) => {
  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles) {
    const isAllowed = allowedRoles.some((role) => currentUser.role === role);
    if (!isAllowed) {
      return (
        fallback ? (
          <>{fallback}</>
        ) : (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8 bg-white rounded-3xl border border-slate-200 shadow-sm" id="protected-route-fallback">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <ShieldAlert className="w-10 h-10 text-slate-300" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-900 mb-2">Acceso Restringido</h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest max-w-xs leading-relaxed">
              No tienes permisos suficientes para acceder a esta sección.
            </p>
          </div>
        )
      );
    }
  }

  if (minRole) {
    const userLevel = ROLE_HIERARCHY[currentUser.role] || 0;
    const requiredLevel = ROLE_HIERARCHY[minRole as UserRole] || 0;
    if (userLevel < requiredLevel) {
      return (
        fallback ? (
          <>{fallback}</>
        ) : (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8 bg-white rounded-3xl border border-slate-200 shadow-sm" id="protected-route-fallback-min">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <ShieldAlert className="w-10 h-10 text-slate-300" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-900 mb-2">Acceso Restringido</h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest max-w-xs leading-relaxed">
              Esta sección requiere al menos el rol de {minRole === 'MAIN_CONTRACTOR_ADMIN' ? 'Administrador' : minRole === 'SITE_MANAGER' ? 'Jefe de Obra' : 'Operario'}.
            </p>
          </div>
        )
      );
    }
  }

  return <>{children}</>;
};
