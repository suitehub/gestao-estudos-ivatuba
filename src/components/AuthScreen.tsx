import React, { useState } from "react";
import { UserProfile } from "../types";
import { auth } from "../firebase";
import { FirestoreService } from "../services/firestoreService";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { User, Lock, ChevronRight, MapPin, Mail } from "lucide-react";

interface AuthScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
}

// Converte erros do Firebase Auth em mensagens amigáveis
function mapAuthError(err: any): string {
  const code = err?.code || "";
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/invalid-password":
      return "E-mail ou senha incorretos.";
    case "auth/user-not-found":
      return "Conta não encontrada. Verifique o e-mail cadastrado pelo administrador.";
    case "auth/email-already-in-use":
      return "Este e-mail já possui uma conta. Tente entrar com a senha definida.";
    case "auth/weak-password":
      return "A senha precisa ter pelo menos 6 caracteres.";
    case "auth/invalid-email":
      return "O e-mail informado é inválido.";
    case "auth/too-many-requests":
      return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
    case "auth/popup-blocked":
      return "O navegador bloqueou a janela do Google. Libere pop-ups ou use e-mail e senha.";
    case "auth/popup-closed-by-user":
      return "A janela do Google foi fechada antes de concluir o login.";
    case "auth/operation-not-allowed":
      return "Login por e-mail/senha não está ativado no Firebase. Ative em Authentication > Sign-in method.";
    case "auth/network-request-failed":
      return "Falha de conexão. Verifique sua internet.";
    default:
      return err?.message ? String(err.message) : "Não foi possível entrar. Tente novamente.";
  }
}

export default function AuthScreen({ onLoginSuccess }: AuthScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function finishLogin(firebaseUser: any) {
    // Carrega (ou cria) o perfil no Firestore vinculado ao UID do Auth
    const profile = await FirestoreService.loadUserProfile(firebaseUser);
    onLoginSuccess(profile);
  }

  async function handleGoogleLogin() {
    setIsLoading(true);
    setErrorMsg("");
    setInfoMsg("");
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await finishLogin(result.user);
    } catch (err: any) {
      console.error("Google Auth error:", err);
      // Se o login com Google falhar, o usuário pode usar e-mail e senha abaixo
      setErrorMsg(mapAuthError(err));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setInfoMsg("");

    if (!email.trim() || !password) {
      setErrorMsg("Preencha o e-mail e a senha.");
      return;
    }

    setIsLoading(true);
    try {
      // 1) Tenta entrar com a conta existente
      try {
        const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
        await finishLogin(cred.user);
      } catch (inner: any) {
        // Primeiro acesso: a conta ainda não existe no Firebase Auth.
        // Criamos a conta automaticamente (só funciona se o e-mail já
        // estiver pré-cadastrado pelo administrador — regra do Firestore).
        const notFound =
          inner?.code === "auth/user-not-found" ||
          (inner?.code === "auth/invalid-credential" && !inner?.message?.includes("wrong-password"));

        if (notFound) {
          try {
            const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
            setInfoMsg("Conta criada! Bem-vindo ao sistema.");
            await finishLogin(cred.user);
          } catch (createErr: any) {
            // A conta já existe (a senha informada estava errada)
            if (createErr?.code === "auth/email-already-in-use") {
              throw new Error("E-mail ou senha incorretos.");
            }
            throw createErr;
          }
        } else {
          throw inner;
        }
      }
    } catch (err: any) {
      console.error("Email/Password Auth error:", err);
      setErrorMsg(mapAuthError(err));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-8 select-none bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden grid md:grid-cols-[1.1fr_0.9fr]">
        
        {/* Left Panel: Information & Branding */}
        <div className="bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-900 p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Brand */}
          <div>
            <div className="flex items-center gap-3.5 mb-8">
              <div className="w-12 h-12 bg-white/15 rounded-xl border border-white/20 flex items-center justify-center shadow-md p-2.5 shrink-0">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full text-white">
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                  <path d="M6 6h10" />
                  <path d="M6 10h10" />
                  <path d="M12 2v20" />
                </svg>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-200 block">
                  Igreja Adventista do Sétimo Dia
                </span>
                <h3 className="font-display font-bold text-white text-base">
                  Ivatuba - PR
                </h3>
              </div>
            </div>

            <h1 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl tracking-tight leading-none mb-3">
              Gestão de Estudos
            </h1>
            <p className="text-emerald-100/90 text-sm md:text-base leading-relaxed max-w-sm mb-8">
              Conectado ao Firebase Cloud para armazenamento em tempo real dos interessados e estudantes em Ivatuba.
            </p>
          </div>

          {/* Key Pillars */}
          <div className="space-y-3">
            <div className="p-3.5 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm">
              <h4 className="text-xs font-bold text-emerald-200">Firebase Firestore Cloud</h4>
              <p className="text-[11px] text-emerald-100/80 mt-0.5">
                Sincronização em tempo real na nuvem para toda a liderança de Ivatuba.
              </p>
            </div>

            <div className="p-3.5 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm">
              <h4 className="text-xs font-bold text-emerald-200">Acesso Protegido</h4>
              <p className="text-[11px] text-emerald-100/80 mt-0.5">
                Cada instrutor entra com Google ou e-mail + senha. Dados protegidos pelas regras do Firestore.
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel: Login Form */}
        <div className="p-8 md:p-10 flex flex-col justify-center">
          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 text-emerald-800 rounded-md text-[10px] font-bold uppercase tracking-wider mb-2 border border-emerald-200">
              <MapPin className="w-3 h-3 text-emerald-600" />
              <span>Acesso Seguro • Ivatuba</span>
            </div>
            <h2 className="font-display font-bold text-2xl text-slate-900">
              Entrar no Sistema
            </h2>
            <p className="text-slate-500 text-xs mt-0.5">
              Acesse com o Google ou com o e-mail + senha cadastrados pelo administrador.
            </p>
          </div>

          <div className="space-y-4">
            {/* Google Sign In Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs py-3 px-4 rounded-xl border border-slate-300 shadow-sm transition-smooth hover:shadow disabled:opacity-60"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Entrar com o Google</span>
            </button>

            <div className="flex items-center gap-2 my-2">
              <div className="h-px bg-slate-200 flex-1" />
              <span className="text-[10px] text-slate-400 font-bold uppercase">Ou com e-mail e senha</span>
              <div className="h-px bg-slate-200 flex-1" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  E-mail
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    placeholder="seu.email@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 font-medium text-slate-800 transition-smooth placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Senha
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 font-medium text-slate-800 transition-smooth placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white text-xs"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Primeiro acesso? Use o e-mail cadastrado e defina uma senha de 6+ caracteres — a conta será criada automaticamente.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 font-bold text-xs">
                  {errorMsg}
                </div>
              )}

              {infoMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 font-bold text-xs">
                  {infoMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-2.5 font-bold text-xs transition-smooth shadow-sm hover:shadow disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <span>{isLoading ? "Aguarde..." : "Acessar Painel"}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>

            {/* Info about secure access */}
            <div className="pt-3 border-t border-slate-100">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs flex items-center justify-between">
                <div>
                  <strong className="block text-slate-900 font-bold">Pastor Ricky</strong>
                  <span className="text-[10px] text-emerald-700 font-semibold uppercase">Administrador • Ivatuba</span>
                </div>
                <span className="text-slate-400 font-bold text-[10px] uppercase">Entre com Google</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
