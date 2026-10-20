import React, { useState } from "react";
import { Lead, LeadStatus, StudySeries, UserProfile } from "../types";
import { getWhatsAppUrl } from "../services/whatsapp";
import { FirestoreService } from "../services/firestoreService";
import { extrairMensagemErro } from "./InteressadoModal";
import { 
  Search, 
  Plus, 
  MessageSquare, 
  MapPin, 
  Tag, 
  CheckCircle2, 
  XCircle, 
  Send, 
  Home, 
  Sparkles, 
  Trash2, 
  Edit,
  ExternalLink,
  Users
} from "lucide-react";
import InteressadoModal from "./InteressadoModal";
import IniciarEstudoModal from "./IniciarEstudoModal";

interface InteressadosListProps {
  leads: Lead[];
  series: StudySeries[];
  users: UserProfile[];
  currentUser: UserProfile;
  onRefresh: () => void;
  onShowMessage: (text: string, type: "success" | "error" | "info") => void;
  onOpenNewLead: () => void;
  onNavigateToStudents?: () => void;
}

export default function InteressadosList({
  leads,
  series,
  users,
  currentUser,
  onRefresh,
  onShowMessage,
  onOpenNewLead,
  onNavigateToStudents,
}: InteressadosListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("Todos");
  const [selectedOrigin, setSelectedOrigin] = useState<string>("Todas");

  // Edit / Convert state modals
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [convertingLead, setConvertingLead] = useState<Lead | null>(null);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);

  // Status counts for funnel view
  const totalCount = leads.length;
  const countRegistrado = leads.filter((l) => l.status === "Registrado").length;
  const countMsgEnviada = leads.filter((l) => l.status === "Mensagem enviada" || l.status === "Mensagem de contato enviada").length;
  const countVisita = leads.filter((l) => l.status === "Visita realizada").length;
  const countAceito = leads.filter((l) => l.status === "Estudo aceito").length;
  const countNegado = leads.filter((l) => l.status === "Estudo negado").length;

  // Filter list
  const filteredLeads = leads.filter((lead) => {
    const search = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !search ||
      lead.nome.toLowerCase().includes(search) ||
      lead.whatsapp.includes(search) ||
      (lead.endereco || "").toLowerCase().includes(search) ||
      (lead.origemContato || "").toLowerCase().includes(search) ||
      (lead.observacoes || "").toLowerCase().includes(search);

    const matchesStatus = selectedStatus === "Todos" || lead.status === selectedStatus;
    const matchesOrigin = selectedOrigin === "Todas" || lead.origemContato === selectedOrigin;

    return matchesSearch && matchesStatus && matchesOrigin;
  });

  // 1-Click WhatsApp Opener
  function handleOpenWhatsApp(lead: Lead) {
    const url = getWhatsAppUrl(lead.whatsapp, lead.nome, "lead");
    if (!url) {
      onShowMessage("Número de WhatsApp inválido ou incompleto.", "error");
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
    onShowMessage(`Abrindo conversa no WhatsApp com ${lead.nome}...`, "info");
  }

  // Quick Status Update
  async function handleQuickStatusChange(lead: Lead, newStatus: LeadStatus) {
    const updatedLead: Lead = {
      ...lead,
      status: newStatus,
      atualizadoEm: new Date().toISOString(),
    };
    try {
      await FirestoreService.saveLead(updatedLead);
      onShowMessage(`Status de "${lead.nome}" atualizado para: ${newStatus}`, "success");
    } catch (err: any) {
      console.error("Erro ao atualizar status:", err);
      onShowMessage(extrairMensagemErro(err, "Não foi possível atualizar o status no Firebase."), "error");
      return;
    }

    if (newStatus === "Estudo aceito" && !lead.convertidoParaEstudo) {
      setConvertingLead(updatedLead);
      setIsConvertModalOpen(true);
    }
  }

  // Delete lead
  async function handleDeleteLead(lead: Lead) {
    const confirmed = window.confirm(`Deseja remover o interessado "${lead.nome}" do registro?`);
    if (!confirmed) return;

    try {
      await FirestoreService.deleteLead(lead.id);
      onShowMessage(`Interessado "${lead.nome}" removido do Firebase.`, "success");
    } catch (err: any) {
      console.error("Erro ao excluir interessado:", err);
      onShowMessage(extrairMensagemErro(err, "Não foi possível excluir o interessado."), "error");
    }
  }

  // Confirm conversion to student
  async function handleConfirmConversion(leadId: string, serieId: string, instrutorIds: string[]) {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;

    const serie = series.find((s) => s.id === serieId) || series[0];
    const resolvedInstructors = instrutorIds.map((id) => {
      const u = users.find((usr) => usr.id === id);
      return { id, nome: u ? u.nome : "Instrutor" };
    });

    try {
      await FirestoreService.convertLeadToStudent(lead, serie, resolvedInstructors, currentUser);
      onShowMessage(`Sucesso! ${lead.nome} agora é um Estudante da Bíblia na série "${serie.nome}".`, "success");
      if (onNavigateToStudents) {
        onNavigateToStudents();
      }
    } catch (err: any) {
      console.error("Erro ao converter interessado:", err);
      onShowMessage(extrairMensagemErro(err, "Não foi possível converter o interessado em estudante."), "error");
    }
  }

  function getStatusBadge(status: LeadStatus) {
    switch (status) {
      case "Registrado":
        return {
          bg: "bg-slate-100 text-slate-800 border-slate-200",
          step: 1,
          label: "1. Registrado",
          dot: "bg-slate-400",
        };
      case "Mensagem enviada":
      case "Mensagem de contato enviada":
        return {
          bg: "bg-sky-50 text-sky-800 border-sky-200",
          step: 2,
          label: "2. Mensagem enviada",
          dot: "bg-sky-500",
        };
      case "Visita realizada":
        return {
          bg: "bg-amber-50 text-amber-800 border-amber-200",
          step: 3,
          label: "3. Visita realizada",
          dot: "bg-amber-500",
        };
      case "Estudo aceito":
        return {
          bg: "bg-emerald-50 text-emerald-800 border-emerald-300 font-bold",
          step: 4,
          label: "4. Estudo aceito ✅",
          dot: "bg-emerald-500",
        };
      case "Estudo negado":
        return {
          bg: "bg-rose-50 text-rose-800 border-rose-200 font-semibold",
          step: 4,
          label: "4. Estudo negado ❌",
          dot: "bg-rose-500",
        };
      default:
        return {
          bg: "bg-slate-100 text-slate-800 border-slate-200",
          step: 1,
          label: "1. Registrado",
          dot: "bg-slate-400",
        };
    }
  }

  const originsList = [
    "Todas",
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

  return (
    <div className="space-y-6">
      
      {/* 1. Funnel Stages Header Card */}
      <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Funil Missionário de Ivatuba
              </span>
            </div>
            <h2 className="font-display font-bold text-slate-900 text-xl lg:text-2xl mt-1">
              Interessados (Pré-Estudo Bíblico)
            </h2>
            <p className="text-slate-500 text-xs mt-0.5 max-w-xl">
              Registre pessoas contatadas em Ivatuba, inicie conversas no WhatsApp com 1 clique e acompanhe o status até a aceitação do estudo bíblico.
            </p>
          </div>

          <button
            onClick={onOpenNewLead}
            className="self-start md:self-auto bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 py-2.5 text-xs font-bold transition-smooth shadow-sm hover:shadow flex items-center gap-2 select-none active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Interessado</span>
          </button>
        </div>

        {/* 5 Funnel Stages Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
          
          <div 
            onClick={() => setSelectedStatus("Registrado")}
            className={`p-3.5 rounded-xl border transition-smooth cursor-pointer ${
              selectedStatus === "Registrado"
                ? "bg-slate-100 border-slate-400 shadow-sm" 
                : "bg-slate-50 border-slate-200 hover:bg-slate-100"
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500 block">
              1. Registrados
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-bold font-display text-slate-900">{countRegistrado}</span>
              <span className="text-[10px] text-slate-400 font-medium">Contato inicial</span>
            </div>
          </div>

          <div 
            onClick={() => setSelectedStatus("Mensagem enviada")}
            className={`p-3.5 rounded-xl border transition-smooth cursor-pointer ${
              selectedStatus === "Mensagem enviada" 
                ? "bg-sky-50 border-sky-400 shadow-sm" 
                : "bg-sky-50/50 border-sky-200 hover:bg-sky-50"
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wide text-sky-700 block">
              2. Mensagem Enviada
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-bold font-display text-sky-900">{countMsgEnviada}</span>
              <span className="text-[10px] text-sky-600 font-medium">Via WhatsApp</span>
            </div>
          </div>

          <div 
            onClick={() => setSelectedStatus("Visita realizada")}
            className={`p-3.5 rounded-xl border transition-smooth cursor-pointer ${
              selectedStatus === "Visita realizada" 
                ? "bg-amber-50 border-amber-400 shadow-sm" 
                : "bg-amber-50/50 border-amber-200 hover:bg-amber-50"
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wide text-amber-700 block">
              3. Visita Realizada
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-bold font-display text-amber-900">{countVisita}</span>
              <span className="text-[10px] text-amber-600 font-medium">Presencial</span>
            </div>
          </div>

          <div 
            onClick={() => setSelectedStatus("Estudo aceito")}
            className={`p-3.5 rounded-xl border transition-smooth cursor-pointer ${
              selectedStatus === "Estudo aceito" 
                ? "bg-emerald-50 border-emerald-400 shadow-sm ring-2 ring-emerald-300" 
                : "bg-emerald-50/50 border-emerald-200 hover:bg-emerald-50"
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-800 block">
              4. Estudo Aceito 🎉
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-bold font-display text-emerald-900">{countAceito}</span>
              <span className="text-[10px] text-emerald-700 font-bold">Pronto p/ aula</span>
            </div>
          </div>

          <div 
            onClick={() => setSelectedStatus("Estudo negado")}
            className={`p-3.5 rounded-xl border transition-smooth cursor-pointer ${
              selectedStatus === "Estudo negado" 
                ? "bg-rose-50 border-rose-400 shadow-sm" 
                : "bg-rose-50/40 border-rose-200 hover:bg-rose-50"
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wide text-rose-700 block">
              Estudo Negado
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-bold font-display text-rose-900">{countNegado}</span>
              <span className="text-[10px] text-rose-600 font-medium">Orar pelo contato</span>
            </div>
          </div>

        </div>
      </div>

      {/* 2. Filter Bar */}
      <div className="bg-white p-4 border border-slate-200 rounded-2xl shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nome, whatsapp, endereço..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9.5 pr-4 py-2.5 text-xs font-medium text-slate-800 transition-smooth placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 transition-smooth focus:border-emerald-500 focus:bg-white"
            >
              <option value="Todos">Status: Todos ({totalCount})</option>
              <option value="Registrado">1. Registrado ({countRegistrado})</option>
              <option value="Mensagem enviada">2. Mensagem de contato enviada ({countMsgEnviada})</option>
              <option value="Visita realizada">3. Visita realizada ({countVisita})</option>
              <option value="Estudo aceito">4. Estudo aceito ({countAceito})</option>
              <option value="Estudo negado">4. Estudo negado ({countNegado})</option>
            </select>
          </div>

          {/* Origin Filter */}
          <div>
            <select
              value={selectedOrigin}
              onChange={(e) => setSelectedOrigin(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 transition-smooth focus:border-emerald-500 focus:bg-white"
            >
              {originsList.map((orig) => (
                <option key={orig} value={orig}>
                  Origem: {orig}
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* 3. Cards & List of Interessados */}
      <div className="space-y-3">
        {filteredLeads.length === 0 ? (
          <div className="bg-white p-12 border border-dashed border-slate-200 rounded-2xl text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <Users className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Nenhum interessado encontrado</h4>
            <p className="text-slate-500 text-xs max-w-sm mx-auto">
              {searchTerm || selectedStatus !== "Todos" || selectedOrigin !== "Todas"
                ? "Nenhum resultado corresponde aos filtros aplicados."
                : "Nenhum interessado registrado em Ivatuba no momento. Cadastre novas pessoas contatadas!"}
            </p>
            <button
              onClick={onOpenNewLead}
              className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 py-2 text-xs font-bold transition-smooth shadow-sm"
            >
              + Adicionar Primeiro Interessado
            </button>
          </div>
        ) : (
          filteredLeads.map((lead) => {
            const badge = getStatusBadge(lead.status);

            return (
              <div
                key={lead.id}
                className="bg-white p-5 border border-slate-200 hover:border-emerald-300 rounded-2xl shadow-sm transition-smooth flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Left: Contact Info */}
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="font-bold text-base text-slate-900 leading-snug">
                      {lead.nome}
                    </h3>

                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.8 rounded-full border ${badge.bg}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                      <span>{badge.label}</span>
                    </span>

                    {lead.convertidoParaEstudo && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-300">
                        <Sparkles className="w-3 h-3 text-emerald-700" />
                        Iniciou Estudo Bíblico
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <Tag className="w-3.5 h-3.5 text-emerald-600" />
                      Origem: <strong className="text-emerald-800">{lead.origemContato}</strong>
                    </span>

                    <span className="flex items-center gap-1 text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {lead.endereco || "Ivatuba - PR"}
                    </span>

                    {lead.responsavelNome && (
                      <span className="text-[11px] text-slate-400">
                        Responsável: <strong className="text-slate-600">{lead.responsavelNome}</strong>
                      </span>
                    )}
                  </div>

                  {lead.observacoes && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed font-normal">
                      "{lead.observacoes}"
                    </p>
                  )}
                </div>

                {/* Right: 1-Click WhatsApp & Status Workflow Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  
                  {/* 1-CLICK WHATSAPP BUTTON */}
                  <button
                    onClick={() => handleOpenWhatsApp(lead)}
                    className="bg-[#25D366] hover:bg-[#20bd5a] text-white px-3.5 py-2.5 rounded-xl font-bold text-xs transition-smooth shadow-sm flex items-center justify-center gap-2 select-none active:scale-[0.98]"
                    title={`Abrir conversa no WhatsApp com ${lead.nome}`}
                  >
                    <MessageSquare className="w-4 h-4 fill-white" />
                    <span>WhatsApp</span>
                    <ExternalLink className="w-3 h-3 opacity-80" />
                  </button>

                  {/* Status Progression Controls */}
                  <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200">
                    
                    {lead.status === "Registrado" && (
                      <button
                        onClick={() => handleQuickStatusChange(lead, "Mensagem enviada")}
                        className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-sky-50 text-sky-800 font-bold text-[11px] border border-slate-200 transition-smooth flex items-center gap-1 shadow-sm"
                        title="Marcar que já enviou mensagem de contato"
                      >
                        <Send className="w-3 h-3 text-sky-600" />
                        <span>Mensagem Enviada</span>
                      </button>
                    )}

                    {(lead.status === "Mensagem enviada" || lead.status === "Mensagem de contato enviada") && (
                      <button
                        onClick={() => handleQuickStatusChange(lead, "Visita realizada")}
                        className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-amber-50 text-amber-800 font-bold text-[11px] border border-slate-200 transition-smooth flex items-center gap-1 shadow-sm"
                        title="Marcar que a visita presencial foi feita"
                      >
                        <Home className="w-3 h-3 text-amber-600" />
                        <span>Visita Realizada</span>
                      </button>
                    )}

                    {lead.status === "Visita realizada" && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleQuickStatusChange(lead, "Estudo aceito")}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-smooth flex items-center gap-1 shadow-sm"
                          title="Interessado aceitou iniciar o estudo bíblico!"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Estudo Aceito</span>
                        </button>

                        <button
                          onClick={() => handleQuickStatusChange(lead, "Estudo negado")}
                          className="px-2 py-1.5 rounded-lg bg-white hover:bg-rose-50 text-rose-700 font-bold text-[11px] border border-slate-200 transition-smooth flex items-center gap-1"
                          title="Não aceitou o estudo no momento"
                        >
                          <XCircle className="w-3 h-3" />
                          <span>Negado</span>
                        </button>
                      </div>
                    )}

                    {lead.status === "Estudo aceito" && !lead.convertidoParaEstudo && (
                      <button
                        onClick={() => {
                          setConvertingLead(lead);
                          setIsConvertModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-[11px] shadow-sm hover:brightness-105 transition-smooth flex items-center gap-1.5"
                        title="Cadastrar pessoa na aba de Estudantes de Estudo Bíblico"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Mover para Estudantes</span>
                      </button>
                    )}

                    <select
                      value={lead.status}
                      onChange={(e) => handleQuickStatusChange(lead, e.target.value as LeadStatus)}
                      className="bg-transparent border-0 text-[10px] font-bold text-slate-500 hover:text-slate-800 cursor-pointer focus:ring-0 py-1"
                    >
                      <option value="Registrado">1. Registrado</option>
                      <option value="Mensagem enviada">2. Mensagem enviada</option>
                      <option value="Visita realizada">3. Visita realizada</option>
                      <option value="Estudo aceito">4. Estudo aceito</option>
                      <option value="Estudo negado">4. Estudo negado</option>
                    </select>

                  </div>

                  {/* Actions: Edit & Delete */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingLead(lead);
                        setIsEditModalOpen(true);
                      }}
                      className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-smooth"
                      title="Editar cadastro"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeleteLead(lead)}
                      className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-smooth"
                      title="Remover interessado"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit Lead Modal */}
      <InteressadoModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingLead(null);
        }}
        activeLead={editingLead}
        currentUser={currentUser}
        users={users}
        onSave={async (updated) => {
          await FirestoreService.saveLead(updated);
          onShowMessage("Interessado atualizado com sucesso no Firebase!", "success");
        }}
        onShowMessage={onShowMessage}
      />

      {/* Conversion Modal (Lead -> Student) */}
      <IniciarEstudoModal
        isOpen={isConvertModalOpen}
        onClose={() => {
          setIsConvertModalOpen(false);
          setConvertingLead(null);
        }}
        lead={convertingLead}
        series={series}
        users={users}
        onConfirm={handleConfirmConversion}
      />

    </div>
  );
}
