import React, { useState, useEffect } from "react";
import { Lead, LeadStatus, LeadOrigin, UserProfile } from "../types";
import { X, MessageSquare, MapPin, User, Tag, FileText, CheckCircle2 } from "lucide-react";

interface InteressadoModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeLead: Lead | null;
  currentUser: UserProfile;
  users: UserProfile[];
  onSave: (lead: Lead) => void | Promise<void>;
  onShowMessage: (text: string, type: "success" | "error" | "info") => void;
}

// Extrai uma mensagem legível dos erros do Firestore (que vêm em JSON)
export function extrairMensagemErro(err: any, padrao: string): string {
  const raw = err?.message || "";
  if (raw.includes("permission-denied") || raw.includes("insufficient permissions")) {
    return "Sem permissão para salvar. Verifique se você está logado e se as regras do Firestore foram publicadas.";
  }
  if (raw.includes("unavailable") || raw.includes("offline")) {
    return "Sem conexão com o Firebase. Verifique sua internet e tente novamente.";
  }
  return padrao;
}

const ORIGINS: LeadOrigin[] = [
  "Evangelismo de Colheita",
  "Indicação de Amigo / Família",
  "Redes Sociais / Internet",
  "Distribuição de Livros / Folhetos",
  "Feira de Saúde",
  "Visitação Missionária",
  "Ponto de Pregação / Pequeno Grupo",
  "Escola Sabatina / Igreja",
  "Outro",
];

const STATUSES: LeadStatus[] = [
  "Registrado",
  "Mensagem enviada",
  "Visita realizada",
  "Estudo aceito",
  "Estudo negado",
];

export default function InteressadoModal({
  isOpen,
  onClose,
  activeLead,
  currentUser,
  users,
  onSave,
  onShowMessage,
}: InteressadoModalProps) {
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [endereco, setEndereco] = useState("");
  const [origemContato, setOrigemContato] = useState<LeadOrigin | string>("Evangelismo de Colheita");
  const [status, setStatus] = useState<LeadStatus>("Registrado");
  const [dataContato, setDataContato] = useState(new Date().toISOString().slice(0, 10));
  const [responsavelId, setResponsavelId] = useState(currentUser.id);
  const [observacoes, setObservacoes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (activeLead) {
        setNome(activeLead.nome || "");
        setWhatsapp(activeLead.whatsapp || "");
        setEndereco(activeLead.endereco || "");
        setOrigemContato(activeLead.origemContato || "Evangelismo de Colheita");
        setStatus(activeLead.status || "Registrado");
        setDataContato(activeLead.dataContato || new Date().toISOString().slice(0, 10));
        setResponsavelId(activeLead.responsavelId || currentUser.id);
        setObservacoes(activeLead.observacoes || "");
      } else {
        setNome("");
        setWhatsapp("");
        setEndereco("");
        setOrigemContato("Evangelismo de Colheita");
        setStatus("Registrado");
        setDataContato(new Date().toISOString().slice(0, 10));
        setResponsavelId(currentUser.id);
        setObservacoes("");
      }
    }
  }, [isOpen, activeLead, currentUser]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!nome.trim()) {
      onShowMessage("Por favor, informe o nome do interessado.", "error");
      return;
    }

    if (!whatsapp.trim()) {
      onShowMessage("Por favor, informe o WhatsApp para contato.", "error");
      return;
    }

    const assignedUser = users.find((u) => u.id === responsavelId) || currentUser;

    const leadData: Lead = {
      id: activeLead?.id || `lead_${Date.now()}`,
      nome: nome.trim(),
      whatsapp: whatsapp.trim(),
      endereco: endereco.trim() || "Ivatuba - PR",
      origemContato,
      status,
      dataContato,
      responsavelId: assignedUser.id,
      responsavelNome: assignedUser.nome,
      observacoes: observacoes.trim(),
      igrejaId: "ivatuba",
      igrejaNome: "Ivatuba",
      criadoEm: activeLead?.criadoEm || new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
      convertidoParaEstudo: activeLead?.convertidoParaEstudo || false,
      estudanteId: activeLead?.estudanteId,
    };

    if (isSaving) return;
    setIsSaving(true);
    try {
      await onSave(leadData);
      onClose();
    } catch (err: any) {
      // Não fecha o modal: o usuário precisa ver que deu erro e tentar de novo
      console.error("Erro ao salvar interessado:", err);
      onShowMessage(extrairMensagemErro(err, "Não foi possível salvar o interessado."), "error");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between select-none bg-slate-50">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block mb-0.5">
              Ivatuba • Pessoas em Contato
            </span>
            <h3 className="font-display font-bold text-slate-900 text-xl">
              {activeLead ? "Editar Interessado" : "Novo Interessado"}
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">
              Pessoas que ainda não iniciaram estudo bíblico formal.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-smooth"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          
          {/* Nome */}
          <div className="space-y-1">
            <label className="block font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-600" />
              <span>Nome Completo *</span>
            </label>
            <input
              type="text"
              placeholder="Exemplo: João da Silva"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium text-slate-800 transition-smooth placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* WhatsApp */}
            <div className="space-y-1">
              <label className="block font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp com DDD *</span>
              </label>
              <input
                type="text"
                placeholder="Exemplo: (44) 99876-5432"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium text-slate-800 transition-smooth placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white"
              />
            </div>

            {/* Origem do Contato */}
            <div className="space-y-1">
              <label className="block font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-emerald-600" />
                <span>De onde iniciou o contato? *</span>
              </label>
              <select
                value={origemContato}
                onChange={(e) => setOrigemContato(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-700 transition-smooth focus:border-emerald-500 focus:bg-white"
              >
                {ORIGINS.map((orig) => (
                  <option key={orig} value={orig}>
                    {orig}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Endereço */}
          <div className="space-y-1">
            <label className="block font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>Endereço (em Ivatuba)</span>
            </label>
            <input
              type="text"
              placeholder="Exemplo: Rua Curitiba, 140 - Centro, Ivatuba"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium text-slate-800 transition-smooth placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Status */}
            <div className="space-y-1">
              <label className="block font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Status do Contato</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as LeadStatus)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-700 transition-smooth focus:border-emerald-500 focus:bg-white"
              >
                {STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st === "Registrado" && "1. Registrado (adicionado)"}
                    {st === "Mensagem enviada" && "2. Mensagem de contato enviada"}
                    {st === "Visita realizada" && "3. Visita realizada"}
                    {st === "Estudo aceito" && "4. Estudo aceito ✅"}
                    {st === "Estudo negado" && "4. Estudo negado ❌"}
                  </option>
                ))}
              </select>
            </div>

            {/* Responsável pelo contato */}
            <div className="space-y-1">
              <label className="block font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-600" />
                <span>Instrutor / Responsável</span>
              </label>
              <select
                value={responsavelId}
                onChange={(e) => setResponsavelId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-700 transition-smooth focus:border-emerald-500 focus:bg-white"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-1">
            <label className="block font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              <span>Observações e Detalhes</span>
            </label>
            <textarea
              rows={3}
              placeholder="Ex: Melhor horário de visita, interesse em temas específicos, pedidos de oração, etc."
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
              {isSaving ? "Salvando..." : activeLead ? "Salvar Alterações" : "Registrar Interessado"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
