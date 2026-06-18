import renatoImg from "@/assets/persona-renato.jpg";
import claudiaImg from "@/assets/persona-claudia.jpg";
import rodrigoImg from "@/assets/persona-rodrigo.jpg";

export type PersonaSummary = {
  id: string;
  name: string;
  role: string;
  tagline: string;
  bio: string;
  avatar: string;
  accent: string;
  initialInterest: "ALTO" | "MEDIO" | "BAIXO";
  decisionCriteria: string[];
  mainObjections: string[];
  suggestedPrompts: string[];
};

// Personas sintéticas portadas do POC PLAENGE — entrevistas qualitativas BRAIN Research
// sobre empreendimento imobiliário em Governador Celso Ramos/SC.
export const PERSONAS: PersonaSummary[] = [
  {
    id: "renato",
    name: "Renato Borges",
    role: "Empresário — Tecnologia & Gestão",
    tagline: "57 anos · Curitiba/PR · teto R$ 4–4,5 mi",
    bio: "Casado, 2 filhos adultos. Renda ~R$ 100k/mês, trabalho remoto, divide tempo entre Curitiba e o litoral catarinense. Prefere lote para construir.",
    avatar: renatoImg,
    accent: "from-sky-200 to-slate-100",
    initialInterest: "MEDIO",
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
  },
  {
    id: "claudia",
    name: "Claudia Mendes",
    role: "Empresária — Consultoria de RH",
    tagline: "52 anos · São Paulo/SP · teto R$ 4,5–5 mi",
    bio: "Casada, 1 filho. Sócia de consultoria de RH. Tem apartamento no Guarujá mas quer uma casa de praia de verdade, com mais privacidade, natureza e espaço.",
    avatar: claudiaImg,
    accent: "from-rose-200 to-amber-100",
    initialInterest: "MEDIO",
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
  },
  {
    id: "rodrigo",
    name: "Rodrigo Faria",
    role: "Empresário — Seguros e Mentoria",
    tagline: "42 anos · Goiânia/GO · teto R$ 7–7,5 mi",
    bio: "Casado, 2 filhas (10 e 3 anos), 1 cachorro. ~7 imóveis no patrimônio. Já tem apto em Balneário Camboriú mas busca algo mais exclusivo e com natureza.",
    avatar: rodrigoImg,
    accent: "from-emerald-200 to-stone-100",
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
  },
];

export function getPersona(id: string): PersonaSummary | undefined {
  return PERSONAS.find((p) => p.id === id);
}
