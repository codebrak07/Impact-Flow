import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, Map as MapIcon, PlusSquare, BarChart3, User, Menu } from 'lucide-react';

const Navbar = () => {
  const { currentUser, userRole } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 w-full flex justify-between items-center px-6 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 z-50">
      <div className="flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2 hover:scale-105 active:scale-95 transition-all">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-xl">I</span>
          </div>
          <span className="font-bold text-xl tracking-tight text-on-surface hidden md:block">ImpactFlow</span>
        </Link>
        
        {currentUser && (
          <nav className="hidden md:flex items-center gap-1">
            {userRole === 'coordinator' ? (
              <>
                <Link to="/coordinator" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-primary hover:bg-slate-50 hover:scale-105 active:scale-95 rounded-lg transition-all flex items-center gap-2">
                  <LayoutDashboard size={18} /> Dashboard
                </Link>
                <Link to="/coordinator/map" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-primary hover:bg-slate-50 hover:scale-105 active:scale-95 rounded-lg transition-all flex items-center gap-2">
                  <MapIcon size={18} /> Live Map
                </Link>
                <Link to="/coordinator/add-need" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-primary hover:bg-slate-50 hover:scale-105 active:scale-95 rounded-lg transition-all flex items-center gap-2">
                  <PlusSquare size={18} /> Add Need
                </Link>
                <Link to="/coordinator/impact" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-primary hover:bg-slate-50 hover:scale-105 active:scale-95 rounded-lg transition-all flex items-center gap-2">
                  <BarChart3 size={18} /> Impact
                </Link>
              </>
            ) : (
              <Link to="/volunteer" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-primary hover:bg-slate-50 hover:scale-105 active:scale-95 rounded-lg transition-all flex items-center gap-2">
                <User size={18} /> My Tasks
              </Link>
            )}
          </nav>
        )}
      </div>

      <div className="flex items-center gap-4">
        {currentUser ? (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-900">{currentUser.displayName || currentUser.email}</p>
              <p className="text-xs text-slate-500 capitalize">{userRole}</p>
            </div>
            <button 
              onClick={() => logout().then(() => navigate('/'))}
              className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 hover:scale-110 active:scale-90 rounded-full transition-all"
            >
              <LogOut size={20} />
            </button>
          </div>
        ) : (
          <Link to="/register-volunteer" className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
            Join as Volunteer
          </Link>
        )}
      </div>
    </header>
  );
};

export default Navbar;
