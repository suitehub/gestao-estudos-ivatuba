import React from "react";
import { UserProfile } from "../types";
import { 
  LayoutDashboard, 
  UserCheck, 
  GraduationCap, 
  BookOpen, 
  Settings, 
  BookMarked, 
  LogOut,
  MapPin,
  Sparkles
} from "lucide-react";
import { motion } from "motion/react";

interface SidebarProps {
  user: UserProfile;
  activeSection: string;
  onNavigate: (section: string) => void;
  onLogout: () => void;
  counts?: {
    leadsCount?: number;
    studentsCount?: number;
  };
}

export default function Sidebar({ 
  user, 
  activeSection, 
  onNavigate, 
  onLogout,
  counts
}: SidebarProps) {

  function formatRole(role: string = ""): string {
    switch (role) {
      case "admin":
        return "Pastor / Administrador";
      case "distrital":
        return "Coordenador";
      case "local":
        return "Líder Local";
      case "membro":
        return "Instrutor Bíblico";
      default:
        return "Instrutor";
    }
  }

  function getInitials(name: string = ""): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "IV";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  // Notice: Churches/Locais removed, "interessados" is the new lead tab, "estudantes" is the study students tab!
  const menuItems = [
    { 
      id: "dashboard", 
      label: "Dashboard", 
      subtitle: "Visão Geral",
      icon: LayoutDashboard,
      badge: null
    },
    { 
      id: "interessados", 
      label: "Interessados", 
      subtitle: "Novos contatos",
      icon: UserCheck,
      badge: counts?.leadsCount ? String(counts.leadsCount) : null,
      highlight: true
    },
    { 
      id: "estudantes", 
      label: "Estudantes", 
      subtitle: "Estudos bíblicos",
      icon: GraduationCap,
      badge: counts?.studentsCount ? String(counts.studentsCount) : null
    },
    { 
      id: "instrutores", 
      label: "Instrutores", 
      subtitle: "Classes e obreiros",
      icon: BookOpen,
      badge: null
    },
    { 
      id: "usuarios", 
      label: "Usuários", 
      subtitle: "Acessos do sistema",
      icon: Settings,
      badge: null
    },
    { 
      id: "catalogo", 
      label: "Catálogo de Estudos", 
      subtitle: "Cursos e Lições",
      icon: BookMarked,
      badge: null
    },
  ];

  return (
    <aside className="w-full lg:w-72 bg-gradient-to-b from-emerald-950 via-emerald-900 to-teal-950 text-white p-5 lg:h-screen lg:fixed lg:left-0 lg:top-0 lg:z-30 flex flex-col justify-between shadow-2xl border-r border-emerald-800/40">
      
      {/* Upper part */}
      <div className="flex flex-col gap-5">
        
        {/* District & App Title (Fixed Ivatuba) */}
        <div className="flex items-center gap-3 pb-4 border-b border-white/10">
          <div className="w-11 h-11 bg-white/10 rounded-2xl flex items-center justify-center border border-white/15 shadow-inner p-2 shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full text-emerald-300">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
              <path d="M6 6h10" />
              <path d="M6 10h10" />
              <path d="M12 2v20" />
            </svg>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] tracking-widest font-black uppercase text-emerald-300">Gestão de Estudos</span>
            </div>
            <h2 className="font-display font-extrabold text-lg text-white tracking-tight -mt-0.5 flex items-center gap-1.5">
              <span>Ivatuba</span>
              <span className="inline-flex items-center px-1.5 py-0.2 text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-md">
                IASD
              </span>
            </h2>
          </div>
        </div>

        {/* User Card Profile details */}
        <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-400 to-teal-300 font-black text-emerald-950 text-sm flex items-center justify-center shadow-md uppercase select-none shrink-0">
            {getInitials(user.nome)}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold truncate text-white leading-tight">{user.nome}</h4>
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-300/90 block mt-0.5">
              {formatRole(user.perfil)}
            </span>
          </div>
        </div>

        {/* Dynamic Navigation */}
        <nav className="flex flex-col gap-1.5 mt-1">
          {menuItems.map((item) => {
            const isActive = activeSection === item.id;
            const IconComponent = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-smooth relative select-none ${
                  isActive 
                    ? "bg-white text-emerald-950 font-bold shadow-lg" 
                    : "text-emerald-100/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeSidebarIndicator"
                    className="absolute inset-0 bg-white rounded-xl -z-10 shadow-md"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isActive ? "bg-emerald-100 text-emerald-800" : "bg-white/5 text-emerald-300"
                  }`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs block font-bold truncate leading-tight">{item.label}</span>
                    <span className={`text-[9px] block truncate leading-none mt-0.5 ${
                      isActive ? "text-emerald-700 font-semibold" : "text-emerald-200/60"
                    }`}>
                      {item.subtitle}
                    </span>
                  </div>
                </div>

                {item.badge && (
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full select-none ${
                    isActive ? "bg-emerald-800 text-white" : "bg-emerald-500/20 text-emerald-200 border border-emerald-400/30"
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Area: Location summary & Logout */}
      <div className="pt-4 border-t border-white/10 mt-6 lg:mt-0 space-y-3">
        <div className="px-3 py-2 bg-black/20 rounded-xl border border-white/5 flex items-center gap-2 text-[11px] text-emerald-200/80">
          <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="truncate font-semibold">Ivatuba - PR • Brasil</span>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/30 rounded-xl text-rose-200 hover:text-white font-bold text-xs transition-smooth select-none"
        >
          <LogOut className="w-4 h-4 text-rose-400" />
          <span>Sair da Conta</span>
        </button>
      </div>

    </aside>
  );
}
