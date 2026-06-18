import renatoImg from "@/assets/persona-renato.jpg";
import claudiaImg from "@/assets/persona-claudia.jpg";
import rodrigoImg from "@/assets/persona-rodrigo.jpg";

export type InterestLevel = "ALTO" | "MÉDIO" | "BAIXO";

export type PersonaSummary = {
  id: string;
  name: string;
  initials: string;
  color: string; // tailwind bg class for avatar fallback
  age: number;
  city: string;
  occupation: string;
  profile: string;
  income: string;
  priceCeiling: string;
  preferredProduct: string;
  initialInterest: InterestLevel;
  decisionCriteria: string[];
  mainObjections: string[];
  suggestedPrompts: string[];
  avatar: string;
  markdownPath: string; // public path
  // legacy/display
  role: string;
  tagline: string;
  bio: string;
};

export const PERSONAS: PersonaSummary[] = [
  {
    id: "renato",
    name: "Renato Borges",
    initials: "RB",
    color: "bg-emerald-700",
    age: 57,
    city: "Curitiba/PR",
    occupation: "Empresário — Tecnologia & Gestão",
    profile: "Casado, 2 filhos adultos",
    income: "~R$ 100k/mês",
    priceCeiling: "R$ 4–4,5 mi",
    preferredProduct: "Lote + construção",
    initialInterest: "MÉDIO",
    decisionCriteria: [
      "Acesso e localização (rota SC, sem Porto Belo)",
      "Privacidade e área verde generosa",
      "Lote para construir com planta funcional",
      "Estrutura completa: tênis, restaurante, mercado",
      "Infraestrutura médica básica no condomínio",
    ],
    mainObjections: [
      "Preço alto para fase inicial de obras",
      "Acesso no verão — rejeita rotas congestionadas",
      "Distância da praia sem transporte interno",
      "Falta de atendimento médico de emergência",
    ],
    suggestedPrompts: [
      "Me conta um pouco sobre sua rotina entre Curitiba e o litoral.",
      "O que você mais valoriza num empreendimento de praia hoje?",
      "Como você avalia acesso e localização no litoral de SC?",
    ],
    avatar: renatoImg,
    markdownPath: "/persona-md/renato.md",
    role: "Empresário — Tecnologia & Gestão",
    tagline: "57 anos · Curitiba/PR · teto R$ 4–4,5 mi",
    bio: "Empresário, trabalho remoto, divide tempo entre Curitiba e o litoral catarinense. Prefere lote para construir.",
  },
  {
    id: "claudia",
    name: "Claudia Mendes",
    initials: "CM",
    color: "bg-purple-600",
    age: 52,
    city: "São Paulo/SP",
    occupation: "Empresária — Consultoria de RH",
    profile: "Casada, 1 filho",
    income: "~R$ 150–200k/mês",
    priceCeiling: "R$ 4,5–5 mi",
    preferredProduct: "Casa pronta (prefere) ou lote",
    initialInterest: "MÉDIO",
    decisionCriteria: [
      "Vista para o mar (essencial)",
      "Tamanho do lote e privacidade com natureza",
      "Padrão homogêneo do empreendimento",
      "Praia com acesso privilegiado",
      "Áreas de lazer completas (tênis, spa, restaurante)",
    ],
    mainObjections: [
      "Preço acima de R$ 5 mi sem negociação",
      "Mistura de padrões horizontal/vertical",
      "Sem gestão condominial para casa à distância",
      "Distância do comércio sem suporte interno",
    ],
    suggestedPrompts: [
      "Como é sua casa de praia hoje e o que falta nela?",
      "Que tipo de padrão de empreendimento te agrada?",
      "Como você pensa em gestão de uma casa longe de SP?",
    ],
    avatar: claudiaImg,
    markdownPath: "/persona-md/claudia.md",
    role: "Empresária — Consultoria de RH",
    tagline: "52 anos · São Paulo/SP · teto R$ 4,5–5 mi",
    bio: "Sócia de consultoria de RH. Tem apartamento no Guarujá mas quer uma casa de praia com mais privacidade e natureza.",
  },
  {
    id: "rodrigo",
    name: "Rodrigo Faria",
    initials: "RF",
    color: "bg-blue-600",
    age: 42,
    city: "Goiânia/GO",
    occupation: "Empresário — Seguros e Mentoria",
    profile: "Casado, 2 filhas",
    income: "~R$ 120–130k/mês",
    priceCeiling: "R$ 7–7,5 mi (com negociação)",
    preferredProduct: "Lote + construção própria",
    initialInterest: "ALTO",
    decisionCriteria: [
      "Vista e acesso à praia (essencial)",
      "Lote para construir com consórcio",
      "Exclusividade e isolamento (vibe Angra)",
      "Segurança e delimitação da área verde",
      "Serviços de praia e infraestrutura interna",
    ],
    mainObjections: [
      "Risco de modelo hoteleiro no condomínio",
      "Área verde sem delimitação de segurança",
      "Suíte master pequena",
      "Falta de coworking e área pet",
    ],
    suggestedPrompts: [
      "Me conta como funciona seu uso do apê em Balneário hoje.",
      "O que faz um condomínio de praia ser exclusivo pra você?",
      "Como você pensa o equilíbrio entre patrimônio e uso da família?",
    ],
    avatar: rodrigoImg,
    markdownPath: "/persona-md/rodrigo.md",
    role: "Empresário — Seguros e Mentoria",
    tagline: "42 anos · Goiânia/GO · teto R$ 7–7,5 mi",
    bio: "Empresário, 7 imóveis no patrimônio. Já tem apto em Balneário Camboriú mas busca algo mais exclusivo.",
  },
];

export function getPersona(id: string): PersonaSummary | undefined {
  return PERSONAS.find((p) => p.id === id);
}

export function normalizeInteresse(val?: string | null): InterestLevel {
  if (!val) return "MÉDIO";
  const up = val.toUpperCase().trim();
  if (up === "MEDIO" || up === "MÉDIO") return "MÉDIO";
  if (up === "ALTO") return "ALTO";
  if (up === "BAIXO") return "BAIXO";
  return "MÉDIO";
}
