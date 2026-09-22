import React from 'react';
import { Navigate } from 'react-router-dom';
import { User, UserRole, Role } from '../types';
import { ShieldAlert } from 'lucide-react';

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  'SUPER_ADMIN': 4,
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
    return <Navigate to="/login" replace />;
  }

  // Super Admin custom claim holders have universal administrative access
  const isSuperAdmin = currentUser.isSuperAdmin === true || currentUser.role === 'SUPER_ADMIN';
  if (isSuperAdmin) {
    return <>{children}</>;
  }


  if (allowedRoles) {
    const isAllowed = allowedRoles.some((role) => currentUser.role === role);
    if (!isAllowed) {
      if (currentUser.role === Role.WORKER) {
        return <Navigate to="/mobile/dashboard" replace />;
      } else {
        return <Navigate to="/admin/dashboard" replace />;
      }
    }
  }

  if (minRole) {
    const userLevel = ROLE_HIERARCHY[currentUser.role] || 0;
    const requiredLevel = ROLE_HIERARCHY[minRole as UserRole] || 0;
    if (userLevel < requiredLevel) {
      if (currentUser.role === Role.WORKER) {
        return <Navigate to="/mobile/dashboard" replace />;
      } else {
        return <Navigate to="/admin/dashboard" replace />;
      }
    }
  }

  return <>{children}</>;
};
