import React, { useState, useEffect } from "react";
import { Student, StudentStatus, StudySeries, UserProfile, InstructorRef } from "../types";
import { X, BookOpen, Plus, Trash2 } from "lucide-react";
import { DISTRITO_FIXO, IGREJA_FIXA, IGREJA_ID_FIXA } from "../services/firestoreService";
import { extrairMensagemErro } from "./InteressadoModal";

interface EstudanteModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeStudent: Student | null;
  currentUser: UserProfile;
  series: StudySeries[];
  users: UserProfile[];
  onSave: (student: Student) => void | Promise<void>;
  onShowMessage: (text: string, type: "success" | "error" | "info") => void;
}

const STATUS_OPTIONS: StudentStatus[] = [
  "Ativo",
  "Pausado",
  "Desinteressado",
  "Concluído",
  "Pronto para apelo",
  "Pronto para batismo",
  "Batismo Realizado",
];

export default function EstudanteModal({
  isOpen,
  onClose,
  activeStudent,
  currentUser,
  series,
  users,
  onSave,
  onShowMessage,
}: EstudanteModalProps) {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");
  const [serieId, setSerieId] = useState(series[0]?.id || "");
  const [estudoAtual, setEstudoAtual] = useState<number>(0);
  const [status, setStatus] = useState<StudentStatus>("Ativo");
  const [interesse, setInteresse] = useState<"Alto" | "Médio" | "Baixo">("Alto");
  const [ultimoContato, setUltimoContato] = useState(new Date().toISOString().slice(0, 10));
  const [observacoes, setObservacoes] = useState("");
  const [instrutorIds, setInstrutorIds] = useState<string[]>([currentUser.id]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (activeStudent) {
        setNome(activeStudent.nome || "");
        setTelefone(activeStudent.telefone || activeStudent.whatsapp || "");
        setEndereco(activeStudent.endereco || "");
        setSerieId(activeStudent.serieId || series[0]?.id || "");
        setEstudoAtual(activeStudent.estudoAtual || 0);
        setStatus(activeStudent.status || "Ativo");
        setInteresse(activeStudent.interesse || "Alto");
        setUltimoContato(activeStudent.ultimoContato || new Date().toISOString().slice(0, 10));
        setObservacoes(activeStudent.observacoes || "");
        setInstrutorIds(activeStudent.instrutorIds && activeStudent.instrutorIds.length > 0 
          ? activeStudent.instrutorIds 
          : [currentUser.id]);
      } else {
        setNome("");
        setTelefone("");
        setEndereco("");
        setSerieId(series[0]?.id || "");
        setEstudoAtual(0);
        setStatus("Ativo");
        setInteresse("Alto");
        setUltimoContato(new Date().toISOString().slice(0, 10));
        setObservacoes("");
        setInstrutorIds([currentUser.id]);
      }
    }
  }, [isOpen, activeStudent, currentUser, series]);

  if (!isOpen) return null;

  const selectedSerieObj = series.find((s) => s.id === serieId) || series[0];
  const totalStudies = selectedSerieObj ? selectedSerieObj.totalEstudos : 24;

  const cappedEstudos = Math.min(Math.max(0, estudoAtual), totalStudies);
  const calculatedPercentage = totalStudies > 0 ? Math.round((cappedEstudos / totalStudies) * 100) : 0;
  const remainingStudies = Math.max(0, totalStudies - cappedEstudos);

  function handleAddInstructor() {
    setInstrutorIds([...instrutorIds, ""]);
  }

  function handleRemoveInstructor(idx: number) {
    if (instrutorIds.length === 1) return;
    const next = [...instrutorIds];
    next.splice(idx, 1);
    setInstrutorIds(next);
  }

  function handleChangeInstructor(idx: number, val: string) {
    const next = [...instrutorIds];
    next[idx] = val;
    setInstrutorIds(next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!nome.trim()) {
      onShowMessage("Por favor, preencha o nome do estudante.", "error");
      return;
    }

    const uniqueInstructorIds = [...new Set(instrutorIds.filter(Boolean))];
    if (uniqueInstructorIds.length === 0) {
      onShowMessage("Selecione ao menos um instrutor para o estudante.", "error");
      return;
    }

    const resolvedInstructors: InstructorRef[] = uniqueInstructorIds
      .map((id) => {
        const u = users.find((item) => item.id === id);
        return u ? { id: u.id, nome: u.nome, perfil: u.perfil } : null;
      })
      .filter(Boolean) as InstructorRef[];

    const studentData: Student = {
      id: activeStudent?.id || `std_${Date.now()}`,
      nome: nome.trim(),
      telefone: telefone.trim(),
      whatsapp: telefone.trim(),
      endereco: endereco.trim() || "Ivatuba - PR",
      igrejaId: IGREJA_ID_FIXA,
      igrejaNome: IGREJA_FIXA,
      distrito: DISTRITO_FIXO,
      instrutorIds: uniqueInstructorIds,
      instrutorNomes: resolvedInstructors.map((i) => i.nome),
      instrutores: resolvedInstructors,
      criadoPorId: activeStudent?.criadoPorId || currentUser.id,
      criadoPorNome: activeStudent?.criadoPorNome || currentUser.nome,
      criadoPorPerfil: activeStudent?.criadoPorPerfil || currentUser.perfil,
      serieId: selectedSerieObj?.id || "",
      serieNome: selectedSerieObj?.nome || "Estudo Bíblico",
      estudoAtual: cappedEstudos,
      totalEstudos: totalStudies,
      porcentagem: calculatedPercentage,
      faltantes: remainingStudies,
      status,
      interesse,
      observacoes: observacoes.trim(),
      ultimoContato: ultimoContato || new Date().toISOString().slice(0, 10),
      criadoEm: activeStudent?.criadoEm || new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
      leadIdOrigem: activeStudent?.leadIdOrigem,
    };

    if (isSaving) return;
    setIsSaving(true);
    try {
      await onSave(studentData);
      onClose();
    } catch (err: any) {
      console.error("Erro ao salvar estudante:", err);
      onShowMessage(extrairMensagemErro(err, "Não foi possível salvar o estudante."), "error");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between select-none bg-slate-50">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block mb-0.5">
              Ivatuba • Estudos Bíblicos
            </span>
            <h3 className="font-display font-bold text-slate-900 text-xl">
              {activeStudent ? "Editar Estudante da Bíblia" : "Novo Estudante da Bíblia"}
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">
              Acompanhe a série de lições, o progresso e o instrutor responsável.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-smooth"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nome */}
            <div className="space-y-1 sm:col-span-2">
              <label className="block font-bold text-slate-700 uppercase tracking-wider">Nome Completo *</label>
              <input
                type="text"
                placeholder="Exemplo: Maria Souza de Oliveira"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium text-slate-800 transition-smooth placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white"
              />
            </div>

            {/* Telefone / WhatsApp */}
            <div className="space-y-1">
              <label className="block font-bold text-slate-700 uppercase tracking-wider">Telefone / WhatsApp</label>
              <input
                type="text"
                placeholder="(44) 99876-5432"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium text-slate-800 transition-smooth placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white"
              />
            </div>

            {/* Endereço */}
            <div className="space-y-1">
              <label className="block font-bold text-slate-700 uppercase tracking-wider">Endereço (Ivatuba)</label>
              <input
                type="text"
                placeholder="Exemplo: Rua Curitiba, 120"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium text-slate-800 transition-smooth placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Série e Progresso */}
          <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-emerald-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-emerald-700" />
                <span>Série de Estudos & Lição Atual</span>
              </label>
              <span className="text-[11px] font-bold text-emerald-800">
                {calculatedPercentage}% Concluído
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <span className="text-[10px] text-slate-500 font-bold block">Curso / Série</span>
                <select
                  value={serieId}
                  onChange={(e) => {
                    setSerieId(e.target.value);
                    setEstudoAtual(0);
                  }}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 text-xs"
                >
                  {series.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nome} ({s.totalEstudos} lições)
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-bold block">Lição Concluída</span>
                <input
                  type="number"
                  min="0"
                  max={totalStudies}
                  value={estudoAtual}
                  onChange={(e) => setEstudoAtual(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 text-xs"
                />
              </div>
            </div>

            {/* Visual mini progress bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-medium text-slate-500">
                <span>Capítulo {cappedEstudos} de {totalStudies}</span>
                <span>Restam {remainingStudies} capítulos</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${calculatedPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Status & Grau de Interesse */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="block font-bold text-slate-700 uppercase tracking-wider">Status Geral</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StudentStatus)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-700 text-xs"
              >
                {STATUS_OPTIONS.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700 uppercase tracking-wider">Grau de Interesse</label>
              <select
                value={interesse}
                onChange={(e) => setInteresse(e.target.value as "Alto" | "Médio" | "Baixo")}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-700 text-xs"
              >
                <option value="Alto">Alto</option>
                <option value="Médio">Médio</option>
                <option value="Baixo">Baixo</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700 uppercase tracking-wider">Último Contato</label>
              <input
                type="date"
                value={ultimoContato}
                onChange={(e) => setUltimoContato(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-medium text-slate-800 text-xs"
              />
            </div>
          </div>

          {/* Instrutores em Ivatuba */}
          <div className="border border-slate-200 p-4 rounded-xl bg-slate-50 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                Instrutores Responsáveis
              </span>
              <button
                type="button"
                onClick={handleAddInstructor}
                className="text-[10px] font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-2 py-0.5 rounded-lg transition-smooth flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>+ Instrutor</span>
              </button>
            </div>

            <div className="space-y-2">
              {instrutorIds.map((instId, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <select
                    value={instId}
                    onChange={(e) => handleChangeInstructor(index, e.target.value)}
                    required
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800"
                  >
                    <option value="">Selecione o instrutor de Ivatuba</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.nome} ({u.perfil})
                      </option>
                    ))}
                  </select>

                  {instrutorIds.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveInstructor(index)}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-smooth"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-1">
            <label className="block font-bold text-slate-700 uppercase tracking-wider">Histórico & Observações</label>
            <textarea
              rows={3}
              placeholder="Detalhes sobre o estudante, dificuldades, dúvidas, temas que mais gostou..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium text-slate-800 transition-smooth placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white resize-y"
            />
          </div>

          {/* Footer Controls */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3 select-none">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-smooth text-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-smooth shadow-sm text-xs disabled:opacity-60"
            >
              {isSaving ? "Salvando..." : activeStudent ? "Salvar Alterações" : "Cadastrar Estudante"}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
