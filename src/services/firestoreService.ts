import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from "firebase/firestore";
import { User } from "firebase/auth";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { Student, Lead, StudySeries, UserProfile } from "../types";

export const DISTRITO_FIXO = "Ivatuba";
export const IGREJA_FIXA = "IASD Ivatuba";
export const IGREJA_ID_FIXA = "ivatuba";
export const ADMIN_EMAIL = "rickyjorgecastro@gmail.com";

const INITIAL_SERIES: Omit<StudySeries, "id">[] = [
  {
    nome: "Ouvindo a Voz de Deus",
    totalEstudos: 27,
    ativo: true,
  },
  {
    nome: "O Grande Conflito",
    totalEstudos: 24,
    ativo: true,
  },
  {
    nome: "Apocalipse: Revelação de Esperança",
    totalEstudos: 18,
    ativo: true,
  },
  {
    nome: "Bíblia Fácil",
    totalEstudos: 12,
    ativo: true,
  },
];

export const FirestoreService = {
  // --- SERIES ---
  async seedInitialSeriesIfEmpty(): Promise<void> {
    try {
      const snap = await getDocs(collection(db, "series"));
      if (snap.empty) {
        for (const s of INITIAL_SERIES) {
          await addDoc(collection(db, "series"), {
            ...s,
            criadoEm: new Date().toISOString(),
            atualizadoEm: new Date().toISOString(),
          });
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, "series");
    }
  },

  subscribeSeries(callback: (series: StudySeries[]) => void): () => void {
    const q = collection(db, "series");
    return onSnapshot(
      q,
      (snapshot) => {
        const list: StudySeries[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<StudySeries, "id">),
        }));
        callback(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "series");
      }
    );
  },

  async saveSeries(item: Partial<StudySeries> & { nome: string; totalEstudos: number }): Promise<void> {
    try {
      if (item.id) {
        await updateDoc(doc(db, "series", item.id), {
          nome: item.nome,
          totalEstudos: item.totalEstudos,
          atualizadoEm: new Date().toISOString(),
        });
      } else {
        await addDoc(collection(db, "series"), {
          nome: item.nome,
          totalEstudos: item.totalEstudos,
          ativo: true,
          criadoEm: new Date().toISOString(),
          atualizadoEm: new Date().toISOString(),
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "series");
    }
  },

  async deleteSeries(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, "series", id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `series/${id}`);
    }
  },

  // --- LEADS (INTERESSADOS) ---
  subscribeLeads(callback: (leads: Lead[]) => void): () => void {
    const q = collection(db, "interessados");
    return onSnapshot(
      q,
      (snapshot) => {
        const list: Lead[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<Lead, "id">),
        }));
        callback(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "interessados");
      }
    );
  },

  async saveLead(lead: Partial<Lead> & { nome: string; whatsapp: string }): Promise<string> {
    try {
      const data = {
        nome: lead.nome,
        whatsapp: lead.whatsapp,
        endereco: lead.endereco || "Ivatuba - PR",
        origemContato: lead.origemContato || "Evangelismo de Colheita",
        status: lead.status || "Registrado",
        observacoes: lead.observacoes || "",
        dataContato: lead.dataContato || new Date().toISOString().slice(0, 10),
        responsavelId: lead.responsavelId || "",
        responsavelNome: lead.responsavelNome || "",
        igrejaId: IGREJA_ID_FIXA,
        igrejaNome: IGREJA_FIXA,
        atualizadoEm: new Date().toISOString(),
        convertidoParaEstudo: lead.convertidoParaEstudo || false,
        estudanteId: lead.estudanteId || "",
      };

      if (lead.id) {
        await updateDoc(doc(db, "interessados", lead.id), data);
        return lead.id;
      } else {
        const ref = await addDoc(collection(db, "interessados"), {
          ...data,
          criadoEm: new Date().toISOString(),
        });
        return ref.id;
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "interessados");
    }
  },

  async deleteLead(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, "interessados", id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `interessados/${id}`);
    }
  },

  // --- STUDENTS (ESTUDANTES DA BÍBLIA) ---
  subscribeStudents(callback: (students: Student[]) => void): () => void {
    const q = collection(db, "estudantes");
    return onSnapshot(
      q,
      (snapshot) => {
        const list: Student[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<Student, "id">),
        }));
        callback(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "estudantes");
      }
    );
  },

  async saveStudent(student: Partial<Student> & { nome: string; status: any }): Promise<string> {
    try {
      const data = {
        nome: student.nome,
        telefone: student.telefone || student.whatsapp || "",
        whatsapp: student.whatsapp || student.telefone || "",
        endereco: student.endereco || "Ivatuba - PR",
        igrejaId: IGREJA_ID_FIXA,
        igrejaNome: IGREJA_FIXA,
        distrito: DISTRITO_FIXO,
        instrutorIds: student.instrutorIds || [],
        instrutorNomes: student.instrutorNomes || [],
        serieId: student.serieId || "",
        serieNome: student.serieNome || "",
        estudoAtual: Number(student.estudoAtual || 0),
        totalEstudos: Number(student.totalEstudos || 1),
        porcentagem: Number(student.porcentagem || 0),
        faltantes: Number(student.faltantes || 0),
        status: student.status || "Ativo",
        interesse: student.interesse || "Alto",
        observacoes: student.observacoes || "",
        ultimoContato: student.ultimoContato || new Date().toISOString().slice(0, 10),
        atualizadoEm: new Date().toISOString(),
        leadIdOrigem: student.leadIdOrigem || "",
      };

      if (student.id) {
        await updateDoc(doc(db, "estudantes", student.id), data);
        return student.id;
      } else {
        const ref = await addDoc(collection(db, "estudantes"), {
          ...data,
          criadoPorId: student.criadoPorId || "",
          criadoPorNome: student.criadoPorNome || "",
          criadoPorPerfil: student.criadoPorPerfil || "",
          criadoEm: new Date().toISOString(),
        });
        return ref.id;
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "estudantes");
    }
  },

  async advanceStudentStudy(student: Student): Promise<void> {
    try {
      const nextVal = Math.min((student.estudoAtual || 0) + 1, student.totalEstudos || 0);
      const total = student.totalEstudos || 1;
      const pct = Math.round((nextVal / total) * 100);
      const remains = Math.max(0, total - nextVal);

      let nextStatus = student.status;
      if (pct >= 100 && student.status === "Ativo") {
        nextStatus = "Concluído";
      }

      await updateDoc(doc(db, "estudantes", student.id), {
        estudoAtual: nextVal,
        porcentagem: pct,
        faltantes: remains,
        status: nextStatus,
        atualizadoEm: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `estudantes/${student.id}`);
    }
  },

  async deleteStudent(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, "estudantes", id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `estudantes/${id}`);
    }
  },

  // --- CONVERT LEAD TO STUDENT ---
  async convertLeadToStudent(
    lead: Lead,
    serie: StudySeries,
    instrutores: { id: string; nome: string }[],
    currentUser?: UserProfile
  ): Promise<string> {
    try {
      const newStudentRef = await addDoc(collection(db, "estudantes"), {
        nome: lead.nome,
        telefone: lead.whatsapp,
        whatsapp: lead.whatsapp,
        endereco: lead.endereco || "Ivatuba - PR",
        igrejaId: IGREJA_ID_FIXA,
        igrejaNome: IGREJA_FIXA,
        distrito: DISTRITO_FIXO,
        instrutorIds: instrutores.map((i) => i.id),
        instrutorNomes: instrutores.map((i) => i.nome),
        serieId: serie.id,
        serieNome: serie.nome,
        estudoAtual: 0,
        totalEstudos: serie.totalEstudos,
        porcentagem: 0,
        faltantes: serie.totalEstudos,
        status: "Ativo",
        interesse: "Alto",
        observacoes: `Interessado originado de: ${lead.origemContato}. ${lead.observacoes ? `Obs: ${lead.observacoes}` : ""}`,
        ultimoContato: new Date().toISOString().slice(0, 10),
        criadoPorId: currentUser?.id || "",
        criadoPorNome: currentUser?.nome || "",
        criadoPorPerfil: currentUser?.perfil || "admin",
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
        leadIdOrigem: lead.id,
      });

      // Update lead
      await updateDoc(doc(db, "interessados", lead.id), {
        status: "Estudo aceito",
        convertidoParaEstudo: true,
        estudanteId: newStudentRef.id,
        atualizadoEm: new Date().toISOString(),
      });

      return newStudentRef.id;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "estudantes");
    }
  },

  // --- USERS ---
  /**
   * Carrega (ou cria) o perfil do usuário logado no Firebase Auth.
   * Regra: o doc do perfil usa o UID do Auth como ID. Se o admin já cadastrou
   * um instrutor com o mesmo e-mail (ID automático), o perfil é reaproveitado.
   */
  async loadUserProfile(firebaseUser: User): Promise<UserProfile> {
    const uid = firebaseUser.uid;
    const email = (firebaseUser.email || "").toLowerCase();
    const isAdminEmail = email === ADMIN_EMAIL;

    try {
      // 1) Perfil já indexado pelo UID?
      const byUid = await getDoc(doc(db, "usuarios", uid));
      if (byUid.exists()) {
        const data = byUid.data() as Omit<UserProfile, "id">;
        if (data.ativo === false) {
          throw new Error("Sua conta foi desativada. Fale com o administrador da igreja.");
        }
        return { id: uid, ...data };
      }

      // 2) Perfil pré-cadastrado pelo admin com o mesmo e-mail?
      let existing: UserProfile | null = null;
      if (email) {
        const snap = await getDocs(
          query(collection(db, "usuarios"), where("emailAuth", "==", email))
        );
        if (!snap.empty) {
          const found = snap.docs[0];
          const data = found.data() as Omit<UserProfile, "id">;
          if (data.ativo === false) {
            throw new Error("Sua conta foi desativada. Fale com o administrador da igreja.");
          }
          existing = { id: found.id, ...data };
        }
      }

      // 3) Só permite criar conta quem já foi pré-cadastrado pelo admin
      //    (ou o e-mail do administrador principal).
      if (!existing && !isAdminEmail) {
        throw new Error(
          "Este e-mail ainda não está cadastrado. Peça ao administrador da igreja para cadastrar seu acesso."
        );
      }

      // 3) Bootstrap do perfil no Firestore
      const perfil: UserProfile["perfil"] = isAdminEmail
        ? "admin"
        : existing?.perfil || "membro";

      const profileData: Omit<UserProfile, "id"> = {
        nome: existing?.nome || firebaseUser.displayName || email.split("@")[0] || "Instrutor",
        email: existing?.email || email,
        emailAuth: email,
        perfil,
        username: existing?.username || email.split("@")[0] || "instrutor",
        igrejaId: IGREJA_ID_FIXA,
        igrejaNome: IGREJA_FIXA,
        distrito: DISTRITO_FIXO,
        ativo: true,
        criadoEm: existing?.criadoEm || new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
      };

      await setDoc(doc(db, "usuarios", uid), profileData);
      return { id: uid, ...profileData };
    } catch (err) {
      if (err instanceof Error && err.message.includes("desativada")) throw err;
      handleFirestoreError(err, OperationType.WRITE, `usuarios/${uid}`);
    }
  },

  subscribeUsers(callback: (users: UserProfile[]) => void): () => void {
    const q = collection(db, "usuarios");
    return onSnapshot(
      q,
      (snapshot) => {
        const list: UserProfile[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<UserProfile, "id">),
        }));
        callback(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "usuarios");
      }
    );
  },

  async saveUser(user: Partial<UserProfile> & { nome: string; perfil: any }): Promise<void> {
    try {
      const data = {
        nome: user.nome,
        email: user.email || "",
        emailAuth: user.emailAuth || user.email || "",
        perfil: user.perfil || "membro",
        username: user.username || "",
        igrejaId: IGREJA_ID_FIXA,
        igrejaNome: IGREJA_FIXA,
        distrito: DISTRITO_FIXO,
        ativo: user.ativo ?? true,
        atualizadoEm: new Date().toISOString(),
      };

      if (user.id) {
        await updateDoc(doc(db, "usuarios", user.id), data);
      } else {
        await addDoc(collection(db, "usuarios"), {
          ...data,
          criadoEm: new Date().toISOString(),
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "usuarios");
    }
  },

  async deleteUser(id: string): Promise<void> {
    try {
      await updateDoc(doc(db, "usuarios", id), {
        ativo: false,
        atualizadoEm: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `usuarios/${id}`);
    }
  },
};
