export type UserRole = "admin" | "distrital" | "local" | "membro";

export interface UserProfile {
  id: string;
  nome: string;
  email?: string;
  emailAuth?: string;
  perfil: UserRole;
  username?: string;
  igrejaId: string; // Fixo "ivatuba"
  igrejaNome: string; // Fixo "Ivatuba"
  distrito: string; // "Ivatuba"
  ativo: boolean;
  criadoEm?: string;
  atualizadoEm?: string;
}

export interface StudySeries {
  id: string;
  nome: string;
  totalEstudos: number;
  ativo: boolean;
  criadoEm?: string;
  atualizadoEm?: string;
}

export interface InstructorRef {
  id: string;
  nome: string;
  perfil?: string;
}

// Estudantes (quem já iniciou estudo bíblico)
export type StudentStatus = 
  | "Ativo"
  | "Pausado"
  | "Desinteressado"
  | "Concluído"
  | "Pronto para apelo"
  | "Pronto para batismo"
  | "Batismo Realizado";

export interface Student {
  id: string;
  nome: string;
  telefone?: string;
  whatsapp?: string;
  endereco?: string;
  igrejaId: string; // "ivatuba"
  igrejaNome: string; // "Ivatuba"
  distrito: string; // "Ivatuba"
  instrutorIds?: string[];
  instrutorNomes?: string[];
  instrutores?: InstructorRef[];
  criadoPorId?: string;
  criadoPorNome?: string;
  criadoPorPerfil?: string;
  serieId?: string;
  serieNome?: string;
  estudoAtual: number;
  totalEstudos: number;
  porcentagem: number;
  faltantes: number;
  status: StudentStatus;
  interesse: "Alto" | "Médio" | "Baixo";
  observacoes?: string;
  ultimoContato: string;
  criadoEm?: string;
  atualizadoEm?: string;
  leadIdOrigem?: string; // Se veio da aba de Interessados
}

// Compatibilidade
export type InterestedPerson = Student;

// Interessados (quem AINDA NÃO iniciou estudo bíblico)
export type LeadStatus = 
  | "Registrado"
  | "Mensagem enviada"
  | "Mensagem de contato enviada"
  | "Visita realizada"
  | "Estudo aceito"
  | "Estudo negado";

export type LeadOrigin =
  | "Evangelismo de Colheita"
  | "Indicação de Amigo / Família"
  | "Redes Sociais / Internet"
  | "Distribuição de Livros / Folhetos"
  | "Feira de Saúde"
  | "Visitação Missionária"
  | "Ponto de Pregação / Pequeno Grupo"
  | "Escola Sabatina / Igreja"
  | "Outro";

export interface Lead {
  id: string;
  nome: string;
  endereco: string;
  whatsapp: string;
  origemContato: LeadOrigin | string;
  status: LeadStatus;
  observacoes?: string;
  dataContato?: string;
  responsavelNome?: string;
  responsavelId?: string;
  igrejaId: string; // Fixo "ivatuba"
  igrejaNome: string; // "Ivatuba"
  criadoEm: string;
  atualizadoEm: string;
  convertidoParaEstudo?: boolean;
  estudanteId?: string;
}
