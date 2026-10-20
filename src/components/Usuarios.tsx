import React, { useState } from "react";
import { UserProfile, UserRole } from "../types";
import { FirestoreService, DISTRITO_FIXO, IGREJA_FIXA, IGREJA_ID_FIXA } from "../services/firestoreService";
import { Users, UserPlus, Edit, Trash2, MapPin } from "lucide-react";

interface UsuariosProps {
  currentUser: UserProfile;
  users: UserProfile[];
  onRefresh: () => void;
  onShowMessage: (text: string, type: "success" | "error" | "info") => void;
}

export default function Usuarios({
  currentUser,
  users,
  onRefresh,
  onShowMessage,
}: UsuariosProps) {
  const [nome, setNome] = useState("");
  const [perfil, setPerfil] = useState<UserRole>("membro");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  function formatRole(role: string = ""): string {
    switch (role) {
      case "admin": return "Pastor / Administrador";
      case "distrital": return "Coordenador";
      case "local": return "Líder Local";
      case "membro": return "Instrutor Bíblico";
      default: return role;
    }
  }

  function handleEditClick(target: UserProfile) {
    setNome(target.nome || "");
    setPerfil(target.perfil || "membro");
    setUsername(target.username || "");
    setEmail(target.email || "");
    setEditingUserId(target.id);
    onShowMessage(`Editando dados de: ${target.nome}`, "info");
  }

  async function handleDeleteClick(target: UserProfile) {
    if (target.id === currentUser.id) {
      onShowMessage("Você não pode remover seu próprio usuário ativo.", "error");
      return;
    }
    const confirmed = window.confirm(`Deseja remover o usuário "${target.nome}" de Ivatuba?`);
    if (!confirmed) return;

    await FirestoreService.deleteUser(target.id);
    onShowMessage(`Usuário "${target.nome}" removido do Firebase.`, "success");
    if (editingUserId === target.id) {
      handleReset();
    }
  }

  function handleReset() {
    setNome("");
    setPerfil("membro");
    setUsername("");
    setEmail("");
    setEditingUserId(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!nome.trim()) {
      onShowMessage("Preencha o nome do usuário.", "error");
      return;
    }

    const userData: UserProfile = {
      id: editingUserId || "",
      nome: nome.trim(),
      email: email.trim() || `${username.trim().toLowerCase()}@ivatuba.org`,
      emailAuth: email.trim() || `${username.trim().toLowerCase()}@ivatuba.org`,
      perfil,
      username: username.trim().toLowerCase() || nome.trim().toLowerCase().replace(/\s+/g, "."),
      igrejaId: IGREJA_ID_FIXA,
      igrejaNome: IGREJA_FIXA,
      distrito: DISTRITO_FIXO,
      ativo: true,
      criadoEm: editingUserId ? undefined : new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };

    await FirestoreService.saveUser(userData);
    onShowMessage(
      editingUserId ? "Usuário atualizado com sucesso no Firebase!" : "Novo usuário cadastrado com sucesso em Ivatuba no Firebase!",
      "success"
    );
    handleReset();
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
      
      {/* 1. Left: List of Users */}
      <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-slate-900 text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              <span>Usuários & Instrutores de Ivatuba</span>
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">
              Contas com autorização para registrar interessados e conduzir estudos bíblicos.
            </p>
          </div>
          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Fixo: Ivatuba
          </span>
        </div>

        <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
          {users.map((u) => {
            const isMe = u.id === currentUser.id;

            return (
              <div 
                key={u.id}
                className="p-4 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl transition-smooth flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-100 to-teal-50 text-emerald-900 font-bold text-sm flex items-center justify-center border border-emerald-200 shadow-sm shrink-0 uppercase">
                    {u.nome.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">{u.nome}</h4>
                      {isMe && (
                        <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200">
                          Sua Sessão
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 font-medium">
                      <span className="font-bold text-emerald-700">{formatRole(u.perfil)}</span>
                      <span>•</span>
                      <span>{u.email || `@${u.username}`}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 select-none">
                  <button
                    onClick={() => handleEditClick(u)}
                    title="Editar usuário"
                    className="p-2 text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-smooth shadow-sm"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>

                  {!isMe && (
                    <button
                      onClick={() => handleDeleteClick(u)}
                      title="Excluir usuário"
                      className="p-2 text-rose-600 bg-white hover:bg-rose-50 border border-rose-200 rounded-xl transition-smooth shadow-sm"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Right: Add / Edit Form */}
      <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm space-y-4">
        <div>
          <h3 className="font-display font-bold text-slate-900 text-lg flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-emerald-600" />
            <span>{editingUserId ? "Editar Usuário" : "Cadastrar Novo Instrutor"}</span>
          </h3>
          <p className="text-slate-500 text-xs mt-0.5">
            Cadastre membros da igreja de Ivatuba para terem acesso ao sistema.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Nome */}
          <div className="space-y-1">
            <label className="block font-bold text-slate-700 uppercase tracking-wider">Nome Completo *</label>
            <input
              type="text"
              placeholder="Exemplo: Gabriel Souza"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium text-slate-800 transition-smooth placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white"
            />
          </div>

          {/* Perfil */}
          <div className="space-y-1">
            <label className="block font-bold text-slate-700 uppercase tracking-wider">Perfil no Sistema</label>
            <select
              value={perfil}
              onChange={(e) => setPerfil(e.target.value as UserRole)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-700 transition-smooth focus:border-emerald-500 focus:bg-white"
            >
              <option value="admin">Pastor / Administrador</option>
              <option value="distrital">Coordenador</option>
              <option value="local">Líder Local</option>
              <option value="membro">Instrutor Bíblico / Membro</option>
            </select>
          </div>

          {/* Fixed Church Indicator */}
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Igreja Local</span>
            </span>
            <strong className="text-emerald-900 font-bold uppercase">Ivatuba - PR (Fixo)</strong>
          </div>

          {/* Username / Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block font-bold text-slate-700 uppercase tracking-wider">Nome de Usuário</label>
              <input
                type="text"
                placeholder="gabriel.souza"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium text-slate-800 transition-smooth placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700 uppercase tracking-wider">E-mail</label>
              <input
                type="email"
                placeholder="gabriel@ivatuba.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium text-slate-800 transition-smooth placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex gap-2 select-none">
            {editingUserId && (
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl py-2.5 transition-smooth"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl py-2.5 transition-smooth shadow-sm"
            >
              {editingUserId ? "Salvar Alterações" : "Cadastrar Instrutor"}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
