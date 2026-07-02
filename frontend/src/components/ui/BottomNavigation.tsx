import React from 'react';
import { motion } from 'framer-motion';
import { NavLink } from 'react-router';
import { Home, Users, Award, User } from 'lucide-react';
import { cn } from '../../lib/cn';

// Professionally optimized for mobile viewport bottom tap targets (4 core menus)
const navItems = [
  { icon: Home, label: 'Beranda', path: '/dashboard' },
  { icon: Users, label: 'Kelas Saya', path: '/kelas' },
  { icon: Award, label: 'Setoran', path: '/hafalan' },
  { icon: User, label: 'Profil', path: '/profil' },
];

export const BottomNavigation: React.FC = () => {
  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-xl px-4 z-50">
      <motion.nav 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="neumorph rounded-full px-4 py-2.5 flex items-center justify-around shadow-neu-floating border border-white/60"
      >
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex flex-col items-center gap-0.5 px-3 py-1 rounded-full transition-all duration-300 relative",
              isActive 
                ? "neumorph-pressed text-blue-600 font-bold" 
                : "text-slate-400 hover:text-slate-600 font-medium"
            )}
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn("w-5 h-5 transition-transform duration-300", isActive && "scale-110 text-blue-600")} />
                <span className="text-[10px] tracking-tight">{item.label}</span>
                
                {isActive && (
                  <motion.div 
                    layoutId="neuNavIndicator"
                    className="absolute -bottom-1 w-1 h-1 rounded-full bg-blue-600"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </motion.nav>
    </div>
  );
};
