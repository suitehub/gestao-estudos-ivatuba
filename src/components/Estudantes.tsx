import React, { useState } from "react";
import { Student, StudySeries } from "../types";
import { getWhatsAppUrl } from "../services/whatsapp";
import { 
  Search, 
  ChevronUp, 
  Edit, 
  Trash2, 
  MessageSquare, 
  BookOpen, 
  AlertCircle,
  Plus
} from "lucide-react";

interface EstudantesProps {
  students: Student[];
  series: StudySeries[];
  onOpenNewStudentModal: () => void;
  onEdit: (student: Student) => void;
  onDelete: (id: string) => void;
  onAddStudy: (id: string) => void;
  statusPreset?: string;
  seriesPreset?: string;
  interestPreset?: string;
  onClearPresets?: () => void;
  onShowMessage: (text: string, type: "success" | "error" | "info") => void;
}

export default function Estudantes({
  students,
  series,
  onOpenNewStudentModal,
  onEdit,
  onDelete,
  onAddStudy,
  statusPreset,
  seriesPreset,
  interestPreset,
  onClearPresets,
  onShowMessage,
}: EstudantesProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>(statusPreset || "Todos");
  const [selectedInterest, setSelectedInterest] = useState<string>(interestPreset || "Todos");
  const [selectedSerie, setSelectedSerie] = useState<string>(seriesPreset || "Todas");

  const statusOptions = [
    "Todos",
    "Ativo",
    "Pausado",
    "Desinteressado",
    "Concluído",
    "Pronto para apelo",
    "Pronto para batismo",
    "Batismo Realizado",
  ];

  const interestOptions = ["Todos", "Alto", "Médio", "Baixo"];

  function normalize(text: string = ""): string {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  }

  const filteredStudents = students.filter((item) => {
    const search = normalize(searchTerm);
    const instructorsText = item.instrutorNomes?.join(", ") || "";
    const matchesSearch =
      !search ||
      normalize(item.nome).includes(search) ||
      normalize(item.telefone || "").includes(search) ||
      normalize(instructorsText).includes(search) ||
      normalize(item.serieNome || "").includes(search);

    const statFilter = statusPreset && selectedStatus === "Todos" ? statusPreset : selectedStatus;
    const matchesStatus = statFilter === "Todos" || item.status === statFilter;

    const intFilter = interestPreset && selectedInterest === "Todos" ? interestPreset : selectedInterest;
    const matchesInterest = intFilter === "Todos" || item.interesse === intFilter;

    const serFilter = seriesPreset && selectedSerie === "Todas" ? seriesPreset : selectedSerie;
    const matchesSerie = serFilter === "Todas" || item.serieId === serFilter;

    return matchesSearch && matchesStatus && matchesInterest && matchesSerie;
  });

  function getStatusPillClass(statusStr: string): string {
    switch (statusStr) {
      case "Ativo": return "bg-green-100 text-green-800 border-green-200";
      case "Pausado": return "bg-amber-100 text-amber-800 border-amber-200";
      case "Desinteressado": return "bg-rose-100 text-rose-800 border-rose-200";
      case "Concluído": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Pronto para apelo": return "bg-cyan-100 text-cyan-800 border-cyan-200 font-bold";
      case "Pronto para batismo": return "bg-blue-100 text-blue-800 border-blue-200 font-bold";
      case "Batismo Realizado": return "bg-purple-100 text-purple-800 border-purple-200 font-extrabold";
      default: return "bg-slate-100 text-slate-800 border-slate-200";
    }
  }

  function getInterestPillClass(level: string): string {
    switch (level) {
      case "Alto": return "bg-green-100 text-green-800 border-green-200";
      case "Médio": return "bg-amber-100 text-amber-800 border-amber-200";
      case "Baixo": return "bg-rose-100 text-rose-800 border-rose-200";
      default: return "bg-slate-100 text-slate-800 border-slate-200";
    }
  }

  function handleOpenWhatsApp(student: Student) {
    const phone = student.whatsapp || student.telefone || "";
    const url = getWhatsAppUrl(phone, student.nome, "student");
    if (!url) {
      onShowMessage("Estudante sem telefone cadastrado.", "error");
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
    onShowMessage(`Abrindo WhatsApp com o estudante ${student.nome}...`, "info");
  }

  const hasPresetFilters = !!(statusPreset || seriesPreset || interestPreset);

  return (
    <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm space-y-6">
      
      {/* Title & Preset indicator */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Ivatuba • Em Estudo Bíblico
            </span>
          </div>
          <h2 className="font-display font-bold text-slate-900 text-xl lg:text-2xl mt-1">
            Estudantes da Bíblia
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Acompanhe o avanço das lições, instrutores associados e decisões de fé.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasPresetFilters && (
            <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 text-xs text-emerald-800 font-bold">
              <span>Filtro rápido ativo</span>
              <button
                onClick={onClearPresets}
                className="text-[10px] bg-emerald-200/70 hover:bg-emerald-200 px-2 py-0.5 rounded uppercase font-bold"
              >
                Limpar
              </button>
            </div>
          )}

          <button
            onClick={onOpenNewStudentModal}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 py-2.5 text-xs font-bold transition-smooth shadow-sm hover:shadow flex items-center gap-2 select-none"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Estudante</span>
          </button>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por estudante, instrutor ou série..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9.5 pr-4 py-2.5 text-xs font-medium text-slate-800 transition-smooth placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white"
          />
        </div>

        {/* Status */}
        <select
          value={statusPreset || selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          disabled={!!statusPreset}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 transition-smooth focus:border-emerald-500 focus:bg-white disabled:opacity-75"
        >
          {statusOptions.map((opt) => (
            <option key={opt} value={opt}>
              Status: {opt}
            </option>
          ))}
        </select>

        {/* Interest */}
        <select
          value={interestPreset || selectedInterest}
          onChange={(e) => setSelectedInterest(e.target.value)}
          disabled={!!interestPreset}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 transition-smooth focus:border-emerald-500 focus:bg-white disabled:opacity-75"
        >
          {interestOptions.map((opt) => (
            <option key={opt} value={opt}>
              Interesse: {opt}
            </option>
          ))}
        </select>

        {/* Series */}
        <select
          value={seriesPreset || selectedSerie}
          onChange={(e) => setSelectedSerie(e.target.value)}
          disabled={!!seriesPreset}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 transition-smooth focus:border-emerald-500 focus:bg-white disabled:opacity-75"
        >
          <option value="Todas">Todas as séries de estudo</option>
          {series.map((ser) => (
            <option key={ser.id} value={ser.id}>
              {ser.nome}
            </option>
          ))}
        </select>
      </div>

      {/* Table of Students */}
      <div className="w-full overflow-hidden border border-slate-200 rounded-2xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-slate-500 min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500 select-none">
                <th className="px-6 py-4">Estudante & Contato</th>
                <th className="px-5 py-4">Instrutores (Ivatuba)</th>
                <th className="px-5 py-4">Série / Curso</th>
                <th className="px-5 py-4">Progresso de Lições</th>
                <th className="px-5 py-4 text-center">Status</th>
                <th className="px-5 py-4 text-center">Interesse</th>
                <th className="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2 select-none text-slate-400">
                      <AlertCircle className="w-8 h-8 text-slate-300" />
                      <span className="font-semibold text-sm">Nenhum estudante cadastrado no momento.</span>
                      <span className="text-xs">Clique no botão verde acima para cadastrar seu primeiro estudante da Bíblia!</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((item) => {
                  const isFinished = Number(item.estudoAtual || 0) >= Number(item.totalEstudos || 0);

                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-smooth font-medium text-xs text-slate-700">
                      
                      {/* Name & Phone & Address */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 text-sm leading-snug">
                          {item.nome}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium mt-0.5 flex items-center gap-1.5">
                          <span>{item.telefone || item.whatsapp || "Sem telefone"}</span>
                          {(item.whatsapp || item.telefone) && (
                            <button
                              onClick={() => handleOpenWhatsApp(item)}
                              className="text-[#25D366] hover:text-[#1eb354] p-0.5 inline-flex items-center gap-0.5 font-bold text-[10px]"
                              title="Abrir WhatsApp"
                            >
                              <MessageSquare className="w-3 h-3 fill-current" />
                              <span>WhatsApp</span>
                            </button>
                          )}
                        </div>
                        <div className="text-[10px] text-emerald-800 font-bold mt-0.5 tracking-wider uppercase">
                          {item.endereco || "Ivatuba - PR"}
                        </div>
                      </td>

                      {/* Associated instructors */}
                      <td className="px-5 py-4 text-slate-700 max-w-[170px]">
                        <p className="line-clamp-2 leading-relaxed font-medium">
                          {item.instrutorNomes?.join(", ") || "Sem instrutor vinculado"}
                        </p>
                      </td>

                      {/* Study Series */}
                      <td className="px-5 py-4 font-bold text-slate-900">
                        <span className="inline-flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{item.serieNome || "Bíblia Fácil"}</span>
                        </span>
                      </td>

                      {/* Progress */}
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-600 mb-1 select-none">
                          <span>Lição {item.estudoAtual} de {item.totalEstudos}</span>
                          <span className="font-mono text-emerald-800">{item.porcentagem || 0}%</span>
                        </div>
                        <div className="w-28 bg-slate-200 h-2 rounded-full overflow-hidden select-none border border-slate-200">
                          <div 
                            className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                            style={{ width: `${item.porcentagem || 0}%` }}
                          />
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4 text-center select-none">
                        <span className={`inline-block px-2.5 py-1 text-[9px] font-bold border uppercase tracking-wider rounded-full ${getStatusPillClass(item.status)}`}>
                          {item.status}
                        </span>
                      </td>

                      {/* Interest */}
                      <td className="px-5 py-4 text-center select-none">
                        <span className={`inline-block px-2.5 py-1 text-[9px] font-bold border uppercase tracking-wider rounded-full ${getInterestPillClass(item.interesse)}`}>
                          {item.interesse}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 select-none">
                        <div className="flex items-center justify-center gap-1.5 shrink-0">
                          
                          {/* Advance 1 lesson */}
                          <button
                            onClick={() => onAddStudy(item.id)}
                            disabled={isFinished}
                            title={isFinished ? "Estudos concluídos" : "Avançar +1 Lição"}
                            className="p-1.5 px-2 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 disabled:opacity-40 disabled:pointer-events-none rounded-xl transition-smooth flex items-center gap-1"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">+1 Cap</span>
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => onEdit(item)}
                            title="Editar estudante"
                            className="p-2 text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-smooth shadow-sm"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => onDelete(item.id)}
                            title="Excluir cadastro"
                            className="p-2 text-rose-600 bg-white hover:bg-rose-50 border border-rose-200 rounded-xl transition-smooth shadow-sm"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
