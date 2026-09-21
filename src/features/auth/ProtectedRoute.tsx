import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { Layers } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { ready, user } = useAuth();
  const location = useLocation();
  if (!ready) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center animate-pulse"><Layers className="h-6 w-6 text-white" /></div></div>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (allowedRoles?.length && !allowedRoles.includes(user.role)) return <Navigate to="/unauthorized" replace />;
  return <>{children}</>;
}
