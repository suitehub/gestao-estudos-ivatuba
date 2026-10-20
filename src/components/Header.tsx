import React from "react";
import { UserPlus, GraduationCap } from "lucide-react";

interface HeaderProps {
  title: string;
  description: string;
  onOpenNewLeadModal: () => void;
  onOpenNewStudentModal: () => void;
}

export default function Header({ 
  title, 
  description, 
  onOpenNewLeadModal, 
  onOpenNewStudentModal 
}: HeaderProps) {
  return (
    <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 bg-white p-6 shadow-sm border border-slate-200 rounded-2xl">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Ivatuba • Gestão de Estudos
          </span>
        </div>
        <h1 className="font-display font-bold text-2xl lg:text-3xl text-slate-900 tracking-tight leading-tight">
          {title}
        </h1>
        <p className="text-slate-500 text-xs md:text-sm leading-relaxed max-w-2xl">
          {description}
        </p>
      </div>

      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
        <button
          onClick={onOpenNewLeadModal}
          className="flex-1 sm:flex-none bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl px-4 py-2.5 text-xs font-bold transition-smooth shadow-sm flex items-center justify-center gap-2 select-none active:scale-[0.98]"
          title="Cadastrar pessoa que ainda não iniciou estudo bíblico"
        >
          <UserPlus className="w-4 h-4 text-emerald-700" />
          <span>+ Interessado</span>
        </button>

        <button
          onClick={onOpenNewStudentModal}
          className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 py-2.5 text-xs font-bold transition-smooth shadow-sm hover:shadow flex items-center justify-center gap-2 select-none active:scale-[0.98]"
          title="Cadastrar aluno de estudo bíblico"
        >
          <GraduationCap className="w-4 h-4 text-white" />
          <span>+ Estudante</span>
        </button>
      </div>
    </header>
  );
}
