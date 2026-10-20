import React, { useState } from "react";
import { StudySeries, Student } from "../types";
import { FirestoreService } from "../services/firestoreService";
import { extrairMensagemErro } from "./InteressadoModal";
import { BookOpen, Plus, Edit, Trash2, Library } from "lucide-react";

interface CatalogoProps {
  series: StudySeries[];
  students: Student[];
  onRefresh: () => void;
  onShowMessage: (text: string, type: "success" | "error" | "info") => void;
}

export default function Catalogo({
  series,
  students,
  onRefresh,
  onShowMessage,
}: CatalogoProps) {
  const [nome, setNome] = useState("");
  const [totalEstudos, setTotalEstudos] = useState("");

  function getStudentCountBySerie(serieId: string): number {
    return students.filter((s) => s.serieId === serieId).length;
  }

  async function handleEdit(item: StudySeries) {
    const novoNome = window.prompt("Editar nome da série de estudos:", item.nome);
    if (novoNome === null) return;
    if (!novoNome.trim()) {
      onShowMessage("O nome da série não pode ser vazio.", "error");
      return;
    }

    const novoTotalStr = window.prompt("Editar total de lições:", String(item.totalEstudos));
    if (novoTotalStr === null) return;
    const novoTotal = parseInt(novoTotalStr, 10);
    if (isNaN(novoTotal) || novoTotal < 1) {
      onShowMessage("O total de lições precisa ser um número maior que zero.", "error");
      return;
    }

    try {
      await FirestoreService.saveSeries({
        ...item,
        nome: novoNome.trim(),
        totalEstudos: novoTotal,
      });
      onShowMessage(`Série "${novoNome}" atualizada com sucesso no Firebase!`, "success");
    } catch (err: any) {
      console.error("Erro ao atualizar série:", err);
      onShowMessage(extrairMensagemErro(err, "Não foi possível atualizar a série. Somente administradores podem editar o catálogo."), "error");
    }
  }

  async function handleDelete(item: StudySeries) {
    const inUse = getStudentCountBySerie(item.id);
    if (inUse > 0) {
      onShowMessage(
        `Não é possível remover "${item.nome}" porque há ${inUse} estudante(s) ativo(s) nesta série.`,
        "error"
      );
      return;
    }

    const confirmed = window.confirm(`Deseja excluir a série "${item.nome}" do catálogo?`);
    if (!confirmed) return;

    try {
      await FirestoreService.deleteSeries(item.id);
      onShowMessage(`Série "${item.nome}" removida do catálogo no Firebase.`, "success");
    } catch (err: any) {
      console.error("Erro ao remover série:", err);
      onShowMessage(extrairMensagemErro(err, "Não foi possível remover a série. Somente administradores podem editar o catálogo."), "error");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!nome.trim()) {
      onShowMessage("Informe o nome do curso/série.", "error");
      return;
    }

    const total = parseInt(totalEstudos, 10);
    if (isNaN(total) || total < 1) {
      onShowMessage("O total de lições precisa ser maior que zero.", "error");
      return;
    }

    try {
      await FirestoreService.saveSeries({
        nome: nome.trim(),
        totalEstudos: total,
      });

      onShowMessage(`Nova série "${nome}" adicionada com sucesso no Firebase!`, "success");
      setNome("");
      setTotalEstudos("");
    } catch (err: any) {
      console.error("Erro ao criar série:", err);
      onShowMessage(extrairMensagemErro(err, "Não foi possível criar a série. Somente administradores podem editar o catálogo."), "error");
    }
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
      
      {/* 1. Left: Series List */}
      <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm space-y-4">
        <div>
          <h3 className="font-display font-bold text-slate-900 text-lg flex items-center gap-2">
            <Library className="w-5 h-5 text-emerald-600" />
            <span>Catálogo de Estudos Bíblicos</span>
          </h3>
          <p className="text-slate-500 text-xs mt-0.5">
            Cursos e lições bíblicas disponíveis para instrutores e estudantes em Ivatuba.
          </p>
        </div>

        <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
          {series.map((item) => {
            const count = getStudentCountBySerie(item.id);

            return (
              <div 
                key={item.id}
                className="p-4 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl transition-smooth flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center font-bold shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{item.nome}</h4>
                    <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                      Lições: <strong className="text-slate-700">{item.totalEstudos}</strong> • Estudantes ativos: <strong className="text-emerald-800">{count}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 select-none">
                  <button
                    onClick={() => handleEdit(item)}
                    title="Editar série"
                    className="p-2 text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-smooth shadow-sm"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(item)}
                    title="Remover série"
                    className="p-2 text-rose-600 bg-white hover:bg-rose-50 border border-rose-200 rounded-xl transition-smooth shadow-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Right: Add Series Form */}
      <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm space-y-4">
        <div>
          <h3 className="font-display font-bold text-slate-900 text-lg flex items-center gap-2">
            <Plus className="w-5 h-5 text-emerald-600" />
            <span>Cadastrar Nova Série</span>
          </h3>
          <p className="text-slate-500 text-xs mt-0.5">
            Adicione guias de estudo, apostilas e cursos personalizados.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div className="space-y-1">
            <label className="block font-bold text-slate-700 uppercase tracking-wider">Nome da Série / Curso *</label>
            <input
              type="text"
              placeholder="Exemplo: Revelações do Apocalipse"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium text-slate-800 transition-smooth placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-slate-700 uppercase tracking-wider">Total de Lições (Capítulos) *</label>
            <input
              type="number"
              min="1"
              max="200"
              placeholder="Exemplo: 24"
              value={totalEstudos}
              onChange={(e) => setTotalEstudos(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium text-slate-800 transition-smooth placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl py-2.5 transition-smooth shadow-sm text-xs mt-2"
          >
            Adicionar Série ao Catálogo
          </button>
        </form>

        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-900 leading-relaxed font-medium">
          Ao adicionar uma série, ela fica imediatamente disponível para seleção ao cadastrar novos estudantes ou converter interessados em Ivatuba.
        </div>
      </div>

    </div>
  );
}
