import React, { useState } from "react";
import { Lead, StudySeries, UserProfile } from "../types";
import { X, GraduationCap, BookOpen, User, Sparkles } from "lucide-react";

interface IniciarEstudoModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  series: StudySeries[];
  users: UserProfile[];
  onConfirm: (leadId: string, serieId: string, instrutorIds: string[]) => void;
}

export default function IniciarEstudoModal({
  isOpen,
  onClose,
  lead,
  series,
  users,
  onConfirm,
}: IniciarEstudoModalProps) {
  const [selectedSerieId, setSelectedSerieId] = useState(series[0]?.id || "");
  const [selectedInstrutorId, setSelectedInstrutorId] = useState(users[0]?.id || "");

  if (!isOpen || !lead) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!lead || !selectedSerieId) return;
    onConfirm(lead.id, selectedSerieId, [selectedInstrutorId]);
    onClose();
  }

  const selectedSerieObj = series.find((s) => s.id === selectedSerieId);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl border border-slate-200 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center border border-white/20 shrink-0">
              <GraduationCap className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200 block">
                Conversão de Interessado
              </span>
              <h3 className="font-display font-bold text-xl text-white">
                Iniciar Estudo Bíblico
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-smooth"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
          
          {/* Target person preview */}
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Novo Estudante</span>
            <h4 className="text-base font-bold text-slate-900">{lead.nome}</h4>
            <p className="text-slate-600 text-xs">
              Origem: <span className="font-bold text-emerald-800">{lead.origemContato}</span> • WhatsApp: {lead.whatsapp}
            </p>
          </div>

          {/* Select Bible Study Series */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>Série de Estudos Bíblicos</span>
            </label>
            <select
              value={selectedSerieId}
              onChange={(e) => setSelectedSerieId(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 font-bold text-slate-800 transition-smooth focus:border-emerald-500 focus:bg-white text-xs"
            >
              {series.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nome} ({s.totalEstudos} lições)
                </option>
              ))}
            </select>
            {selectedSerieObj && (
              <p className="text-[11px] text-slate-500">
                O aluno iniciará com 0 de {selectedSerieObj.totalEstudos} lições e poderá avançar capítulo a capítulo.
              </p>
            )}
          </div>

          {/* Select Instructor */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4 text-emerald-600" />
              <span>Instrutor Responsável em Ivatuba</span>
            </label>
            <select
              value={selectedInstrutorId}
              onChange={(e) => setSelectedInstrutorId(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 font-bold text-slate-800 transition-smooth focus:border-emerald-500 focus:bg-white text-xs"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
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
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-smooth shadow-sm text-xs flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Cadastrar como Estudante</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
