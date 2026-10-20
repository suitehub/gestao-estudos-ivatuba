import React, { useState } from "react";
import { UserProfile, Student, StudySeries } from "../types";
import { 
  Users, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  GraduationCap
} from "lucide-react";

interface InstrutoresProps {
  currentUser: UserProfile;
  users: UserProfile[];
  students: Student[];
  series: StudySeries[];
}

export default function Instrutores({
  currentUser,
  users,
  students,
}: InstrutoresProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function formatRole(role: string = ""): string {
    switch (role) {
      case "admin": return "Pastor / Administrador";
      case "distrital": return "Coordenador";
      case "local": return "Líder Local";
      case "membro": return "Instrutor Bíblico";
      default: return role;
    }
  }

  function getStudentsForInstructor(userId: string): Student[] {
    return students.filter((s) => {
      const isAssigned = s.instrutorIds && s.instrutorIds.includes(userId);
      const isCreator = s.criadoPorId === userId;
      return isAssigned || (isCreator && (!s.instrutorIds || s.instrutorIds.length === 0));
    });
  }

  const filteredUsers = users.filter((u) => {
    if (u.ativo === false) return false;
    const search = searchTerm.toLowerCase().trim();
    if (!search) return true;
    return (
      u.nome.toLowerCase().includes(search) ||
      (u.email || "").toLowerCase().includes(search) ||
      (u.username || "").toLowerCase().includes(search)
    );
  });

  const totalInstructors = filteredUsers.length;
  const totalAssignedStudents = students.length;
  const avgStudentsPerInstructor = totalInstructors > 0 
    ? (totalAssignedStudents / totalInstructors).toFixed(1)
    : "0";

  return (
    <div className="space-y-6">
      
      {/* 1. Header Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-200 shrink-0 text-emerald-700">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
              Instrutores em Ivatuba
            </span>
            <h3 className="font-display font-bold text-2xl text-slate-900 -mt-0.5">
              {totalInstructors}
            </h3>
            <span className="text-[11px] text-emerald-800 font-semibold block mt-0.5">
              Obreiros cadastrados
            </span>
          </div>
        </div>

        <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center border border-teal-200 shrink-0 text-teal-700">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
              Estudantes Atribuídos
            </span>
            <h3 className="font-display font-bold text-2xl text-teal-900 -mt-0.5">
              {totalAssignedStudents}
            </h3>
            <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
              Em classes e estudos individuais
            </span>
          </div>
        </div>

        <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-200 shrink-0 text-indigo-700">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
              Média por Instrutor
            </span>
            <h3 className="font-display font-bold text-2xl text-indigo-900 -mt-0.5">
              {avgStudentsPerInstructor}
            </h3>
            <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
              Estudantes por instrutor
            </span>
          </div>
        </div>

      </div>

      {/* 2. Search */}
      <div className="bg-white p-4 border border-slate-200 rounded-2xl shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar instrutor por nome, email ou usuário..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9.5 pr-4 py-2.5 text-xs font-medium text-slate-800 transition-smooth placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white"
          />
        </div>
      </div>

      {/* 3. Instructors List */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-slate-900 text-lg">
              Quadro de Instrutores de Ivatuba
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">
              Clique no instrutor para ver e acompanhar a lista detalhada de seus estudantes da Bíblia.
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Ivatuba - PR
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredUsers.map((inst) => {
            const myStudents = getStudentsForInstructor(inst.id);
            const activeStudents = myStudents.filter((s) => s.status === "Ativo");
            const isExpanded = expandedId === inst.id;

            return (
              <div key={inst.id} className="transition-smooth hover:bg-slate-50">
                
                {/* Clickable Header Row */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : inst.id)}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-100 to-teal-50 text-emerald-900 font-bold text-sm flex items-center justify-center border border-emerald-200 shadow-sm shrink-0 uppercase">
                      {inst.nome.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm">{inst.nome}</h4>
                        {inst.id === currentUser.id && (
                          <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200">
                            Você
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 font-medium">
                        <span className="font-bold text-emerald-700">{formatRole(inst.perfil)}</span>
                        <span>•</span>
                        <span>{inst.email || `@${inst.username}` || "Ivatuba"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Estudantes</span>
                      <strong className="text-sm font-bold text-slate-900 block">
                        {myStudents.length} ({activeStudents.length} ativos)
                      </strong>
                    </div>

                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Students List */}
                {isExpanded && (
                  <div className="bg-slate-50 p-5 border-t border-slate-200 space-y-3">
                    <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                      Estudantes acompanhados por {inst.nome}:
                    </h5>

                    {myStudents.length === 0 ? (
                      <div className="p-4 bg-white rounded-xl border border-dashed border-slate-200 text-center text-slate-400 text-xs">
                        Nenhum estudante vinculado a este instrutor no momento.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {myStudents.map((stud) => (
                          <div key={stud.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h6 className="font-bold text-slate-900 text-xs">{stud.nome}</h6>
                                <span className="text-[10px] text-slate-400 block mt-0.5">{stud.telefone || stud.whatsapp || "Sem telefone"}</span>
                              </div>
                              <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                                {stud.status}
                              </span>
                            </div>

                            <div className="space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                              <div className="flex justify-between text-[10px] font-bold text-slate-600">
                                <span className="truncate">{stud.serieNome}</span>
                                <span>{stud.porcentagem || 0}%</span>
                              </div>
                              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                <div 
                                  className="bg-emerald-600 h-full rounded-full"
                                  style={{ width: `${stud.porcentagem || 0}%` }}
                                />
                              </div>
                              <span className="text-[9px] text-slate-400 block text-right font-medium">
                                Lição {stud.estudoAtual} de {stud.totalEstudos}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
