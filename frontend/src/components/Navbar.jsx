import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, LogOut, LayoutDashboard, Upload, AlertTriangle, UserCircle2 } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white/70 backdrop-blur-md border-b border-surface-200/50 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-teal-600 flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:shadow-primary-500/40 transition-all duration-300 group-hover:-translate-y-0.5">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <span className="font-extrabold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-surface-900 to-surface-600 tracking-tight hidden sm:block">
              Citizen Cleanliness
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-2 sm:gap-6">
            {user ? (
              <div className="flex items-center gap-1 sm:gap-4">
                {user.role === 'inspector' && (
                  <NavLink to="/upload" active={isActive('/upload')} icon={<Upload className="w-4 h-4" />} label="Upload" />
                )}
                
                <NavLink to="/dashboard" active={isActive('/dashboard')} icon={<LayoutDashboard className="w-4 h-4" />} label="Dashboard" />

                <div className="h-8 w-px bg-surface-200 mx-2 hidden sm:block"></div>
                
                <div className="hidden md:flex items-center gap-2 bg-surface-100/50 px-3 py-1.5 rounded-full border border-surface-200">
                  <UserCircle2 className="w-4 h-4 text-surface-500" />
                  <span className="text-sm font-medium text-surface-700 capitalize">
                    {user.role}
                  </span>
                </div>

                <button 
                  onClick={handleLogout}
                  className="p-2 sm:px-4 sm:py-2 rounded-xl flex items-center gap-2 text-surface-600 font-medium hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                >
                  <LogOut className="w-4 h-4" /> <span className="hidden sm:block">Logout</span>
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn-primary shadow-lg shadow-primary-600/20 px-6 py-2.5 rounded-xl font-semibold">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

const NavLink = ({ to, active, icon, label, isDanger }) => {
  const baseClasses = "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200";
  const activeClasses = isDanger 
    ? "bg-red-50 text-red-600" 
    : "bg-primary-50 text-primary-700";
  
  const inactiveClasses = "text-surface-500 hover:bg-surface-100 hover:text-surface-900";

  return (
    <Link to={to} className={`${baseClasses} ${active ? activeClasses : inactiveClasses}`}>
      {icon}
      <span className="hidden sm:block">{label}</span>
    </Link>
  );
};

export default Navbar;
