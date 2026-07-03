import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import { 
  LayoutDashboard, 
  Users2, 
  UserCog, 
  FileSpreadsheet, 
  History, 
  LogOut, 
  Menu, 
  X,
  UserCircle,
  BookOpen,
  GraduationCap,
  ChevronRight,
  Building2
} from 'lucide-react';
import { useSession, signOut } from '../lib/auth.client';
import { GlassCard } from '../components/ui/GlassCard';

export const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<string>('master-santri'); // default open
  const { data: sessionData } = useSession();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  type NavChild = { name: string; path: string; icon: React.ReactNode; };
  type NavItem = {
    name: string;
    path?: string;
    icon: React.ReactNode;
    groupKey?: string;
    children?: NavChild[];
  };

  const navItems: NavItem[] = [
    {
      name: 'Dashboard',
      path: '/admin/dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      name: 'Master Santri',
      path: '/admin/santri',
      icon: <Users2 className="w-5 h-5" />,
      groupKey: 'master-santri',
      children: [
        {
          name: 'Alumni & Boyong',
          path: '/admin/alumni',
          icon: <GraduationCap className="w-4 h-4" />,
        },
        {
          name: 'Blok & Kamar',
          path: '/admin/blok-kamar',
          icon: <Building2 className="w-4 h-4" />,
        },
      ],
    },
    {
      name: 'Kelas & Kitab',
      path: '/admin/kelas-kitab',
      icon: <BookOpen className="w-5 h-5" />,
    },
    {
      name: 'Akses & Users',
      path: '/admin/users',
      icon: <UserCog className="w-5 h-5" />,
    },
    {
      name: 'Sync Google Sheets',
      path: '/admin/sync',
      icon: <FileSpreadsheet className="w-5 h-5" />,
    },
    {
      name: 'Audit Logs',
      path: '/admin/logs',
      icon: <History className="w-5 h-5" />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F0F4F8] flex text-slate-800 font-sans antialiased">
      {/* Sidebar for Desktop */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300 md:translate-x-0 md:static md:h-screen ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Sidebar Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center p-1.5 transition-transform hover:scale-105 shadow-inner shrink-0">
              <img 
                src="/logo-3d.png" 
                alt="Logo e-Mubtadi'aat" 
                className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]"
              />
            </div>
            <div>
              <h1 className="font-extrabold text-sm tracking-tight text-white">e-Mubtadi'aat</h1>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Web Admin Portal</p>
            </div>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)} 
            className="md:hidden text-slate-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            const hasChildren = item.children && item.children.length > 0;
            const isGroupOpen = item.groupKey ? expandedGroup === item.groupKey : false;
            const isChildActive = hasChildren && item.children!.some(c => location.pathname === c.path);

            return (
              <div key={item.path || item.name}>
                {/* Parent item */}
                <div className="flex items-center gap-1">
                  <Link
                    to={item.path || '#'}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      (isActive || isChildActive)
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    {item.icon}
                    {item.name}
                  </Link>
                  {hasChildren && (
                    <button
                      onClick={() => setExpandedGroup(isGroupOpen ? '' : (item.groupKey || ''))}
                      className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                    >
                      <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${isGroupOpen ? 'rotate-90' : ''}`} />
                    </button>
                  )}
                </div>

                {/* Sub-menu children */}
                {hasChildren && isGroupOpen && (
                  <div className="ml-4 mt-1 space-y-1 border-l-2 border-slate-700 pl-3">
                    {item.children!.map(child => {
                      const isChildItemActive = location.pathname === child.path;
                      return (
                        <Link
                          key={child.path}
                          to={child.path}
                          onClick={() => setSidebarOpen(false)}
                          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                            isChildItemActive
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : 'text-slate-500 hover:bg-slate-800 hover:text-slate-200'
                          }`}
                        >
                          {child.icon}
                          {child.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <UserCircle className="w-9 h-9 text-slate-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">
                {sessionData?.user?.name || 'Administrator'}
              </p>
              <p className="text-[10px] text-slate-500 truncate">
                {sessionData?.user?.email || 'admin@mubtadiaat.id'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 font-semibold rounded-xl text-sm transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            Keluar Sistem
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Navbar */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)} 
              className="md:hidden p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Mobile Logo & Title */}
            <div className="flex items-center gap-2 md:hidden">
              <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center p-1 shadow-inner">
                <img 
                  src="/logo-3d.png" 
                  alt="Logo e-Mubtadi'aat" 
                  className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]"
                />
              </div>
              <span className="font-extrabold text-sm text-slate-800 tracking-tight">e-Mubtadi'aat</span>
            </div>

            <h2 className="text-lg font-black tracking-tight text-slate-800 uppercase md:block hidden">
              {(() => {
                // Check top-level
                const topLevel = navItems.find(item => location.pathname === item.path);
                if (topLevel) return topLevel.name;
                // Check children
                for (const item of navItems) {
                  if (item.children) {
                    const child = item.children.find(c => location.pathname === c.path);
                    if (child) return child.name;
                  }
                }
                return 'Portal Admin';
              })()}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <GlassCard variant="neumorph" className="px-4 py-1.5 flex items-center gap-2 border-none">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-extrabold text-slate-700 tracking-wide">
                Server Online
              </span>
            </GlassCard>
          </div>
        </header>

        {/* View Content (Scrollable) */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#F4F7FB]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
