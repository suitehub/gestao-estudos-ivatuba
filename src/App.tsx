import React, { useState, useEffect } from "react";
import { Student, Lead, StudySeries, UserProfile } from "./types";
import { FirestoreService } from "./services/firestoreService";
import { auth, testConnection } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

// UI Components
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import InteressadosList from "./components/InteressadosList";
import Estudantes from "./components/Estudantes";
import Instrutores from "./components/Instrutores";
import Usuarios from "./components/Usuarios";
import Catalogo from "./components/Catalogo";
import AuthScreen from "./components/AuthScreen";
import InteressadoModal, { extrairMensagemErro } from "./components/InteressadoModal";
import EstudanteModal from "./components/EstudanteModal";

import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, AlertCircle, Info, Cloud } from "lucide-react";

export default function App() {
  // Sessão controlada pelo Firebase Auth (persistência automática)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const [activeSection, setActiveSection] = useState<string>("dashboard");

  // Core Data State from Firestore
  const [students, setStudents] = useState<Student[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [series, setSeries] = useState<StudySeries[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);

  // Filter Presets (from Dashboard selections into Estudantes)
  const [studentStatusPreset, setStudentStatusPreset] = useState<string | undefined>(undefined);
  const [studentSeriesPreset, setStudentSeriesPreset] = useState<string | undefined>(undefined);
  const [studentInterestPreset, setStudentInterestPreset] = useState<string | undefined>(undefined);

  // Modals state
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const [isNewStudentModalOpen, setIsNewStudentModalOpen] = useState(false);
  const [activeEditingStudent, setActiveEditingStudent] = useState<Student | null>(null);

  // Notification Toast state
  const [notification, setNotification] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  function handleShowNotification(text: string, type: "success" | "error" | "info") {
    setNotification({ text, type });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  }

  // Escuta o estado do Firebase Auth: restaura sessão e carrega o perfil
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (fbUser) => {
      try {
        if (fbUser) {
          const profile = await FirestoreService.loadUserProfile(fbUser);
          setCurrentUser(profile);
        } else {
          setCurrentUser(null);
        }
      } catch (err) {
        console.error("Erro ao carregar perfil:", err);
        setCurrentUser(null);
      } finally {
        setIsAuthReady(true);
      }
    });
    return () => unsubAuth();
  }, []);

  // Assinaturas em tempo real do Firestore (somente após login)
  useEffect(() => {
    if (!currentUser) return;

    testConnection();
    if (currentUser.perfil === "admin") {
      FirestoreService.seedInitialSeriesIfEmpty();
    }

    const unsubSeries = FirestoreService.subscribeSeries((data) => setSeries(data));
    const unsubLeads = FirestoreService.subscribeLeads((data) => setLeads(data));
    const unsubStudents = FirestoreService.subscribeStudents((data) => setStudents(data));
    const unsubUsers = FirestoreService.subscribeUsers((data) => setUsers(data));

    return () => {
      unsubSeries();
      unsubLeads();
      unsubStudents();
      unsubUsers();
    };
  }, [currentUser?.id]);

  function handleLoginSuccess(user: UserProfile) {
    setCurrentUser(user);
    handleShowNotification(`Bem-vindo ao painel de Ivatuba, ${user.nome}!`, "success");
  }

  async function handleLogout() {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Erro ao sair:", err);
    }
    setCurrentUser(null);
    handleShowNotification("Sessão encerrada com sucesso.", "info");
  }

  // Study progress quick increment (+1 Cap)
  async function handleAddStudy(studentId: string) {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    try {
      await FirestoreService.advanceStudentStudy(student);
      handleShowNotification(`Estudo para "${student.nome}" avançou lição!`, "success");
    } catch (err: any) {
      console.error("Erro ao avançar estudo:", err);
      handleShowNotification(extrairMensagemErro(err, "Não foi possível avançar a lição."), "error");
    }
  }

  // Student Delete
  async function handleDeleteStudent(studentId: string) {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    const confirmed = window.confirm(`Deseja excluir o estudante "${student.nome}" permanentemente?`);
    if (!confirmed) return;

    try {
      await FirestoreService.deleteStudent(studentId);
      handleShowNotification(`Estudante "${student.nome}" removido.`, "success");
    } catch (err: any) {
      console.error("Erro ao excluir estudante:", err);
      handleShowNotification(extrairMensagemErro(err, "Não foi possível excluir o estudante."), "error");
    }
  }

  // Presets handlers
  function handleClearStudentPresets() {
    setStudentStatusPreset(undefined);
    setStudentSeriesPreset(undefined);
    setStudentInterestPreset(undefined);
  }

  function handleSelectStudentMetric(statusVal: string) {
    handleClearStudentPresets();
    setStudentStatusPreset(statusVal);
    setActiveSection("estudantes");
  }

  function getSectionTitle(): { title: string; desc: string } {
    switch (activeSection) {
      case "dashboard":
        return {
          title: "Painel de Estudos - Ivatuba",
          desc: "Visão estratégica em tempo real de interessados, estudantes da Bíblia, instrutores e decisões espirituais em Ivatuba.",
        };
      case "interessados":
        return {
          title: "Acompanhamento de Interessados",
          desc: "Pessoas contatadas que ainda não iniciaram estudo bíblico. Inicie conversas no WhatsApp com 1 clique e acompanhe o funil missionário.",
        };
      case "estudantes":
        return {
          title: "Estudantes da Bíblia",
          desc: "Alunos com estudos bíblicos em andamento. Monitore capítulos, séries e prepare candidatos para apelo e batismo.",
        };
      case "instrutores":
        return {
          title: "Quadro de Instrutores de Ivatuba",
          desc: "Visualize os obreiros voluntários, classes bíblicas e estudantes acompanhados por cada instrutor.",
        };
      case "usuarios":
        return {
          title: "Usuários & Instrutores",
          desc: "Gerencie permissões de acesso e contas autorizadas para a igreja de Ivatuba.",
        };
      case "catalogo":
        return {
          title: "Catálogo de Estudos Bíblicos",
          desc: "Crie e gerencie séries e lições (Ouvindo a Voz de Deus, O Grande Conflito, Bíblia Fácil, Apocalipse).",
        };
      default:
        return {
          title: "Gestão de Estudos - Ivatuba",
          desc: "Sistema missionário da Igreja Adventista de Ivatuba.",
        };
    }
  }

  if (!isAuthReady) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 text-white">
        <div className="w-10 h-10 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-200">
          Conectando ao Firebase...
        </p>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  const headerMeta = getSectionTitle();

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col lg:flex-row text-slate-800">
      
      {/* 1. Left Sidebar Navigation */}
      <Sidebar 
        user={currentUser}
        activeSection={activeSection}
        onNavigate={(sect) => {
          handleClearStudentPresets();
          setActiveSection(sect);
        }}
        onLogout={handleLogout}
        counts={{
          leadsCount: leads.length,
          studentsCount: students.length,
        }}
      />

      {/* 2. Main Content Wrapper */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 lg:pl-80 overflow-y-auto min-h-screen">
        
        {/* Main Central Header */}
        <Header 
          title={headerMeta.title}
          description={headerMeta.desc}
          onOpenNewLeadModal={() => setIsNewLeadModalOpen(true)}
          onOpenNewStudentModal={() => {
            setActiveEditingStudent(null);
            setIsNewStudentModalOpen(true);
          }}
        />

        {/* Real-time Floating Notification Card */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 p-4 rounded-xl border shadow-lg flex items-center gap-3 max-w-md ${
                notification.type === "success" 
                  ? "bg-emerald-50 border-emerald-200 text-emerald-900" 
                  : notification.type === "error" 
                    ? "bg-rose-50 border-rose-200 text-rose-900" 
                    : "bg-sky-50 border-sky-200 text-sky-900"
              }`}
            >
              {notification.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
              {notification.type === "error" && <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />}
              {notification.type === "info" && <Info className="w-5 h-5 text-sky-600 shrink-0" />}
              <p className="text-xs font-bold leading-relaxed">{notification.text}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Section Router */}
        <div className="mt-2">
          {activeSection === "dashboard" && (
            <Dashboard 
              students={students}
              leads={leads}
              series={series}
              onNavigate={(sect) => {
                handleClearStudentPresets();
                setActiveSection(sect);
              }}
              onSelectStudentStatus={handleSelectStudentMetric}
            />
          )}

          {activeSection === "interessados" && (
            <InteressadosList 
              leads={leads}
              series={series}
              users={users}
              currentUser={currentUser}
              onRefresh={() => {}}
              onShowMessage={handleShowNotification}
              onOpenNewLead={() => setIsNewLeadModalOpen(true)}
              onNavigateToStudents={() => {
                handleClearStudentPresets();
                setActiveSection("estudantes");
              }}
            />
          )}

          {activeSection === "estudantes" && (
            <Estudantes 
              students={students}
              series={series}
              onOpenNewStudentModal={() => {
                setActiveEditingStudent(null);
                setIsNewStudentModalOpen(true);
              }}
              onEdit={(student) => {
                setActiveEditingStudent(student);
                setIsNewStudentModalOpen(true);
              }}
              onDelete={handleDeleteStudent}
              onAddStudy={handleAddStudy}
              statusPreset={studentStatusPreset}
              seriesPreset={studentSeriesPreset}
              interestPreset={studentInterestPreset}
              onClearPresets={handleClearStudentPresets}
              onShowMessage={handleShowNotification}
            />
          )}

          {activeSection === "instrutores" && (
            <Instrutores 
              currentUser={currentUser}
              users={users}
              students={students}
              series={series}
            />
          )}

          {activeSection === "usuarios" && (
            <Usuarios 
              currentUser={currentUser}
              users={users}
              onRefresh={() => {}}
              onShowMessage={handleShowNotification}
            />
          )}

          {activeSection === "catalogo" && (
            <Catalogo 
              series={series}
              students={students}
              onRefresh={() => {}}
              onShowMessage={handleShowNotification}
            />
          )}
        </div>

      </main>

      {/* 3. Modal: Novo Interessado */}
      <InteressadoModal 
        isOpen={isNewLeadModalOpen}
        onClose={() => setIsNewLeadModalOpen(false)}
        activeLead={null}
        currentUser={currentUser}
        users={users}
        onSave={async (newLead) => {
          await FirestoreService.saveLead(newLead);
          handleShowNotification(`Interessado "${newLead.nome}" salvo no Firebase!`, "success");
        }}
        onShowMessage={handleShowNotification}
      />

      {/* 4. Modal: Novo / Editar Estudante */}
      <EstudanteModal 
        isOpen={isNewStudentModalOpen}
        onClose={() => {
          setIsNewStudentModalOpen(false);
          setActiveEditingStudent(null);
        }}
        activeStudent={activeEditingStudent}
        currentUser={currentUser}
        series={series}
        users={users}
        onSave={async (studentData) => {
          await FirestoreService.saveStudent(studentData);
          handleShowNotification(
            activeEditingStudent ? "Estudante atualizado no Firebase!" : "Estudante salvo no Firebase!",
            "success"
          );
        }}
        onShowMessage={handleShowNotification}
      />

    </div>
  );
}
