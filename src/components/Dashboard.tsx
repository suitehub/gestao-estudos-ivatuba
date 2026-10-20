import React from "react";
import { Student, Lead, StudySeries } from "../types";
import { 
  Users, 
  UserCheck, 
  GraduationCap, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle, 
  Sparkles, 
  Award, 
  MessageSquare, 
  ChevronRight,
  BookOpen,
  Send,
  Home,
  Plus
} from "lucide-react";

interface DashboardProps {
  students: Student[];
  leads: Lead[];
  series: StudySeries[];
  onNavigate: (section: string) => void;
  onSelectLeadStatus?: (status: string) => void;
  onSelectStudentStatus?: (status: string) => void;
}

export default function Dashboard({
  students,
  leads,
  series,
  onNavigate,
  onSelectLeadStatus,
  onSelectStudentStatus,
}: DashboardProps) {

  function daysSince(dateStr: string): number {
    if (!dateStr) return 999;
    const today = new Date();
    const date = new Date(`${dateStr}T00:00:00`);
    const diff = today.getTime() - date.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  // --- LEADS METRICS ---
  const totalLeads = leads.length;
  const leadsRegistrados = leads.filter((l) => l.status === "Registrado").length;
  const leadsMensagemEnviada = leads.filter((l) => l.status === "Mensagem enviada" || l.status === "Mensagem de contato enviada").length;
  const leadsVisitaRealizada = leads.filter((l) => l.status === "Visita realizada").length;
  const leadsEstudoAceito = leads.filter((l) => l.status === "Estudo aceito").length;

  // --- STUDENTS METRICS ---
  const totalStudents = students.length;
  const studentsAtivos = students.filter((s) => s.status === "Ativo").length;
  const studentsConcluidos = students.filter((s) => s.status === "Concluído").length;
  const studentsDecisao = students.filter((s) => s.status === "Pronto para apelo" || s.status === "Pronto para batismo").length;
  const studentsBatizados = students.filter((s) => s.status === "Batismo Realizado").length;

  const isAtRisk = (item: Student) => {
    const active = ["Ativo", "Pronto para apelo", "Pronto para batismo"];
    return active.includes(item.status) && daysSince(item.ultimoContato) > 14;
  };

  const studentsAtRisk = students.filter(isAtRisk).length;

  const avgProgress = totalStudents > 0 
    ? Math.round(students.reduce((acc, curr) => acc + (curr.porcentagem || 0), 0) / totalStudents)
    : 0;

  // Group origins
  const originCounts: Record<string, number> = {};
  leads.forEach((l) => {
    const orig = l.origemContato || "Outro";
    originCounts[orig] = (originCounts[orig] || 0) + 1;
  });

  // Top series
  const seriesCounts: Record<string, number> = {};
  students.forEach((s) => {
    const name = s.serieNome || "Bíblia Fácil";
    seriesCounts[name] = (seriesCounts[name] || 0) + 1;
  });

  const studentsNeedingAttention = students.filter((s) => isAtRisk(s) || s.status === "Pronto para apelo" || s.status === "Pronto para batismo").slice(0, 4);
  const leadsNeedingContact = leads.filter((l) => l.status === "Registrado" || l.status === "Mensagem enviada" || l.status === "Mensagem de contato enviada").slice(0, 4);

  return (
    <div className="space-y-6">
      
      {/* 1. Welcome Card with Ivatuba Banner */}
      <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white p-6 lg:p-8 rounded-2xl shadow-sm border border-emerald-700/50 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-emerald-200 border border-white/15">
            <span>Igreja Adventista do Sétimo Dia • Ivatuba</span>
          </div>
          <h2 className="font-display font-bold text-2xl lg:text-3xl tracking-tight">
            Panorama Missionário de Ivatuba
          </h2>
          <p className="text-emerald-100/90 text-xs sm:text-sm leading-relaxed">
            Acompanhe o funil de interessados desde o primeiro contato até a aceitação do estudo e o batismo.
          </p>
        </div>
      </div>

      {/* 2. Key Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Interessados */}
        <div 
          onClick={() => onNavigate("interessados")}
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-smooth cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Interessados
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-smooth border border-emerald-100">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display font-bold text-3xl text-slate-900">{totalLeads}</span>
            <span className="text-xs text-emerald-700 font-bold">em Ivatuba</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium block mt-1">
            {leadsEstudoAceito} com estudo aceito
          </span>
        </div>

        {/* Estudantes Ativos */}
        <div 
          onClick={() => onNavigate("estudantes")}
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-smooth cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Estudantes Ativos
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center group-hover:scale-105 transition-smooth border border-teal-100">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display font-bold text-3xl text-teal-900">{studentsAtivos}</span>
            <span className="text-xs text-teal-700 font-bold">estudando</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium block mt-1">
            De {totalStudents} cadastrados
          </span>
        </div>

        {/* Decisões Espirituais */}
        <div 
          onClick={() => onNavigate("estudantes")}
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-sky-400 hover:shadow-md transition-smooth cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Prontos para Decisão
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center group-hover:scale-105 transition-smooth border border-sky-100">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display font-bold text-3xl text-sky-900">{studentsDecisao}</span>
            <span className="text-xs text-sky-700 font-bold">apelo / batismo</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium block mt-1">
            Fase final das lições
          </span>
        </div>

        {/* Batismos Realizados */}
        <div 
          onClick={() => onNavigate("estudantes")}
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-purple-400 hover:shadow-md transition-smooth cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Batismos Confirmados
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center group-hover:scale-105 transition-smooth border border-purple-100">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display font-bold text-3xl text-purple-900">{studentsBatizados}</span>
            <span className="text-xs text-purple-700 font-bold">vidas salvas</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium block mt-1">
            Frutos do evangelismo
          </span>
        </div>

      </div>

      {/* 3. The Two Missionary Pillars Side by Side */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Left Column: Funil de Interessados (Pré-Estudo) */}
        <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Fase 1: Prospecção
              </span>
              <h3 className="font-display font-bold text-slate-900 text-lg mt-1">
                Funil de Interessados
              </h3>
              <p className="text-slate-400 text-xs">Avanço dos contatos até a aceitação do estudo bíblico.</p>
            </div>
            <button
              onClick={() => onNavigate("interessados")}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>Ver todos</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {totalLeads === 0 ? (
            <div className="p-8 border border-dashed border-slate-200 bg-slate-50 rounded-xl text-center space-y-2">
              <p className="text-xs text-slate-500 font-medium">Nenhum interessado cadastrado ainda.</p>
              <button
                onClick={() => onNavigate("interessados")}
                className="text-xs text-emerald-700 font-bold hover:underline"
              >
                + Cadastrar primeiro interessado
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {[
                { label: "1. Registrados no sistema", count: leadsRegistrados, color: "bg-slate-400", total: totalLeads },
                { label: "2. Mensagem de contato enviada", count: leadsMensagemEnviada, color: "bg-sky-500", total: totalLeads },
                { label: "3. Visita realizada", count: leadsVisitaRealizada, color: "bg-amber-500", total: totalLeads },
                { label: "4. Estudo Bíblico Aceito", count: leadsEstudoAceito, color: "bg-emerald-600", total: totalLeads },
              ].map((step, idx) => {
                const pct = step.total > 0 ? Math.round((step.count / step.total) * 100) : 0;
                return (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">{step.label}</span>
                      <span className="font-bold text-slate-900">{step.count} pessoa(s)</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`${step.color} h-full rounded-full transition-all duration-500`}
                        style={{ width: `${pct || 4}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Top Contact Origins */}
          {Object.keys(originCounts).length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                De onde iniciaram os contatos em Ivatuba:
              </span>
              <div className="flex flex-wrap gap-2">
                {Object.entries(originCounts).map(([origin, cnt]) => (
                  <span key={origin} className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700">
                    <span>{origin}:</span>
                    <strong className="text-emerald-800">{cnt}</strong>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Estudantes da Bíblia (Em Estudo) */}
        <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                Fase 2: Discipulado
              </span>
              <h3 className="font-display font-bold text-slate-900 text-lg mt-1">
                Estudantes da Bíblia
              </h3>
              <p className="text-slate-400 text-xs">Progresso médio das lições: <strong className="text-emerald-700">{avgProgress}%</strong></p>
            </div>
            <button
              onClick={() => onNavigate("estudantes")}
              className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
            >
              <span>Ver todos</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {totalStudents === 0 ? (
            <div className="p-8 border border-dashed border-slate-200 bg-slate-50 rounded-xl text-center space-y-2">
              <p className="text-xs text-slate-500 font-medium">Nenhum estudante de estudo bíblico cadastrado.</p>
              <button
                onClick={() => onNavigate("estudantes")}
                className="text-xs text-emerald-700 font-bold hover:underline"
              >
                + Cadastrar primeiro estudante
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {[
                { label: "Lições Iniciais (0 a 25%)", filter: (s: Student) => s.porcentagem <= 25, color: "from-rose-500 to-rose-400" },
                { label: "Em Desenvolvimento (26 a 50%)", filter: (s: Student) => s.porcentagem > 25 && s.porcentagem <= 50, color: "from-amber-500 to-amber-400" },
                { label: "Avançados (51 a 75%)", filter: (s: Student) => s.porcentagem > 50 && s.porcentagem <= 75, color: "from-teal-500 to-teal-400" },
                { label: "Fase de Decisão (76 a 100%)", filter: (s: Student) => s.porcentagem > 75, color: "from-emerald-600 to-emerald-500" },
              ].map((bucket, idx) => {
                const count = students.filter(bucket.filter).length;
                const pct = totalStudents > 0 ? Math.round((count / totalStudents) * 100) : 0;
                return (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">{bucket.label}</span>
                      <span className="font-bold text-slate-900">{count} estudante(s) ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`bg-gradient-to-r ${bucket.color} h-full rounded-full transition-all duration-500`}
                        style={{ width: `${pct || 4}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Top Series studied */}
          {Object.keys(seriesCounts).length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Séries bíblicas ativas em Ivatuba:
              </span>
              <div className="flex flex-wrap gap-2">
                {Object.entries(seriesCounts).map(([serName, cnt]) => (
                  <span key={serName} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] font-bold text-emerald-900">
                    <BookOpen className="w-3 h-3 text-emerald-600" />
                    <span>{serName}:</span>
                    <strong className="text-emerald-800">{cnt}</strong>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* 4. Attention Points Lists (Bottom) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Estudantes precisando de atenção / apelo */}
        <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-slate-900 text-base flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>Estudantes que precisam de atenção</span>
            </h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Ivatuba</span>
          </div>

          <div className="space-y-2.5">
            {studentsNeedingAttention.length === 0 ? (
              <div className="p-6 border border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-xs">
                Nenhum caso crítico ou pendente no momento.
              </div>
            ) : (
              studentsNeedingAttention.map((s) => {
                const atRisk = isAtRisk(s);
                return (
                  <div key={s.id} className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 text-xs truncate">{s.nome}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Lição {s.estudoAtual} de {s.totalEstudos} • {s.serieNome}
                      </p>
                    </div>
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-md border shrink-0 ${
                      atRisk ? "bg-amber-100 text-amber-800 border-amber-200" : "bg-sky-100 text-sky-800 border-sky-200"
                    }`}>
                      {atRisk ? "Sem contato 14+ dias" : s.status}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Interessados aguardando contato / visita */}
        <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-slate-900 text-base flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>Interessados para contatar / visitar</span>
            </h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Ivatuba</span>
          </div>

          <div className="space-y-2.5">
            {leadsNeedingContact.length === 0 ? (
              <div className="p-6 border border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-xs">
                Nenhum contato pendente de visita no momento.
              </div>
            ) : (
              leadsNeedingContact.map((l) => (
                <div key={l.id} className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 text-xs truncate">{l.nome}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Origem: {l.origemContato} • {l.whatsapp}
                    </p>
                  </div>
                  <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-md border shrink-0 bg-slate-100 text-slate-700 border-slate-200">
                    {l.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
