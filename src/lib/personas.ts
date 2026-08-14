import renatoImg from "@/assets/persona-renato.jpg";
import claudiaImg from "@/assets/persona-claudia.jpg";
import rodrigoImg from "@/assets/persona-rodrigo.jpg";
import sergioCeImg from "@/assets/persona-sergio_ce.jpg";
import henriqueCeImg from "@/assets/persona-henrique_ce.jpg";
import esterCeImg from "@/assets/persona-ester_ce.jpg";
import paulaCeImg from "@/assets/persona-paula_ce.jpg";
import andersonPrudenteImg from "@/assets/persona-anderson_prudente.svg";
import sergioPrudenteImg from "@/assets/persona-sergio_prudente.svg";

export type InterestLevel = "ALTO" | "MÉDIO" | "BAIXO";

export type PersonaContext = "plaenge" | "aquiraz" | "prudente";

export type PersonaSummary = {
  id: string;
  context: PersonaContext;
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
    context: "plaenge",
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
    context: "plaenge",
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
    context: "plaenge",
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
  {
    id: "sergio_ce",
    context: "aquiraz",
    name: "Sérgio Cavalcante",
    initials: "SC",
    color: "bg-amber-600",
    age: 52,
    city: "Fortaleza/CE",
    occupation: "Empresário — Varejo e Combustível",
    profile: "Casado, 1 filha",
    income: "~R$ 200–250k/mês",
    priceCeiling: "R$ 3–3,5 mi (negociável)",
    preferredProduct: "Apartamento vertical de resort",
    initialInterest: "ALTO",
    decisionCriteria: [
      "Localização Porto das Dunas",
      "Materiais resistentes à maresia",
      "Vagas fixas + carregador elétrico exclusivo",
      "Resort completo com academia e restaurante",
      "Transporte elétrico interno para idosos",
    ],
    mainObjections: [
      "Vagas rotativas — fator de exclusão",
      "Condomínio compartilhado com outro empreendimento",
      "Maresia sem solução técnica demonstrada",
      "Preço acima de R$ 4 mi sem justificativa",
    ],
    suggestedPrompts: [
      "Me conta como você pensa em imóvel de praia como investimento hoje?",
      "O que faria um empreendimento em Porto das Dunas superar o seu condomínio atual?",
      "Quais especificações técnicas você mais questiona num imóvel litorâneo?",
    ],
    avatar: sergioCeImg,
    markdownPath: "/persona-md/sergio_ce.md",
    role: "Empresário — Varejo e Combustível",
    tagline: "52 anos · Fortaleza/CE · teto R$ 3–3,5 mi",
    bio: "Empresário cearense com holdings no varejo e combustível, já frequenta a região de Aquiraz e busca um imóvel de praia com potencial de investimento e uso pessoal.",
  },
  {
    id: "henrique_ce",
    context: "aquiraz",
    name: "Henrique Matos",
    initials: "HM",
    color: "bg-cyan-700",
    age: 45,
    city: "Fortaleza/CE",
    occupation: "Médico Cardiologista",
    profile: "Casado, 2 filhos",
    income: "~R$ 180–220k/mês",
    priceCeiling: "R$ 3–3,5 mi",
    preferredProduct: "Apartamento 3 suítes + wellness",
    initialInterest: "MÉDIO",
    decisionCriteria: [
      "Proximidade de Fortaleza (20 min)",
      "3 suítes mínimo + varanda gourmet",
      "Academia e wellness com profissional fixo",
      "Potencial de locação explicado",
      "Taxa de condomínio até R$ 4–5 mil",
    ],
    mainObjections: [
      "Custo fixo vs. frequência de uso real",
      "Taxa de condomínio acima de R$ 5 mil",
      "Condomínio compartilhado — fator de exclusão",
      "Preço acima de R$ 5 mi",
    ],
    suggestedPrompts: [
      "Como é hoje sua rotina de família nos fins de semana?",
      "O que pesa mais na decisão de comprar um imóvel de lazer: uso ou investimento?",
      "Que estrutura de bem-estar faria sentido pra sua rotina?",
    ],
    avatar: henriqueCeImg,
    markdownPath: "/persona-md/henrique_ce.md",
    role: "Médico Cardiologista",
    tagline: "45 anos · Fortaleza/CE · teto R$ 3–3,5 mi",
    bio: "Cardiologista em Fortaleza, ainda não deu o salto para um imóvel de lazer — pondera custo fixo, uso real e a opinião da esposa antes de decidir.",
  },
  {
    id: "ester_ce",
    context: "aquiraz",
    name: "Ester Brandão",
    initials: "EB",
    color: "bg-rose-600",
    age: 45,
    city: "Fortaleza/CE",
    occupation: "Empresária — Postos de Combustível",
    profile: "Casada, 3 filhos",
    income: "~R$ 500–600k/mês",
    priceCeiling: "R$ 4–4,4 mi",
    preferredProduct: "Apartamento resort 3+ suítes, entregue pronto",
    initialInterest: "ALTO",
    decisionCriteria: [
      "Conceito de resort com wellness e profissional fixo",
      "3 suítes mínimo, 180 m²+",
      "Varanda gourmet",
      "Condomínio autossuficiente (mercado, salão, padaria, pet)",
      "Entregue pronto para morar",
    ],
    mainObjections: [
      "Apartamento abaixo de 3 suítes — fator de exclusão",
      "Wellness sem profissional fixo — perde apelo",
      "Entrega sem acabamento — não aceita",
      "Preço acima de R$ 5 mi",
    ],
    suggestedPrompts: [
      "Como você imagina um fim de semana ideal num apartamento de praia?",
      "O que te atrai na ideia de um condomínio resort autossuficiente?",
      "Que experiências de bem-estar você não abre mão?",
    ],
    avatar: esterCeImg,
    markdownPath: "/persona-md/ester_ce.md",
    role: "Empresária — Postos de Combustível",
    tagline: "45 anos · Fortaleza/CE · teto R$ 4–4,4 mi",
    bio: "Empresária do setor de combustíveis, busca um apartamento de praia com conceito de resort e bem-estar, fugindo da rotina urbana de Fortaleza.",
  },
  {
    id: "paula_ce",
    context: "aquiraz",
    name: "Paula Drummond",
    initials: "PD",
    color: "bg-indigo-600",
    age: 42,
    city: "Fortaleza/CE",
    occupation: "Advogada Imobiliária e Incorporadora",
    profile: "Casada, 2 filhos",
    income: "~R$ 300–400k/mês",
    priceCeiling: "R$ 8–10 mi (planta 350–450 m²)",
    preferredProduct: "Apartamento 350 m²+ com hall privativo",
    initialInterest: "ALTO",
    decisionCriteria: [
      "Hall privativo + elevador exclusivo por unidade",
      "Localização Porto das Dunas (fundamento de valorização)",
      "Taxa de condomínio até R$ 5 mil",
      "Construtora com histórico comprovado de entrega",
      "Planta a partir de 350 m²",
    ],
    mainObjections: [
      "Taxa de condomínio acima de R$ 6 mil — rejeita",
      "Área compartilhada com outro empreendimento — exclusão",
      "Sem hall privativo — não é o produto que busca",
      "Itens de lazer sem uso real gerando custo de condomínio",
    ],
    suggestedPrompts: [
      "Como você avalia hoje o potencial de valorização de um imóvel na praia?",
      "O que te faz confiar (ou desconfiar) do histórico de uma construtora?",
      "Que diferenciais de projeto justificam pra você uma taxa de condomínio mais alta?",
    ],
    avatar: paulaCeImg,
    markdownPath: "/persona-md/paula_ce.md",
    role: "Advogada Imobiliária e Incorporadora",
    tagline: "42 anos · Fortaleza/CE · teto R$ 8–10 mi",
    bio: "Advogada imobiliária e incorporadora, compra imóvel como investimento — exige fundamento técnico, hall privativo e histórico de entrega comprovado.",
  },
  {
    id: "anderson_prudente",
    context: "prudente",
    name: "Anderson Ribeiro",
    initials: "AR",
    color: "bg-orange-600",
    age: 43,
    city: "Presidente Prudente/SP",
    occupation: "Empresário — Bar-restaurante e Estúdio",
    profile: "União estável, 1 filha (não coabita)",
    income: "~R$ 25 mil/mês (variável)",
    priceCeiling: "R$ 396 mil (lote) + construção",
    preferredProduct: "Lote + construção",
    initialInterest: "ALTO",
    decisionCriteria: [
      "Primeira casa própria em Prudente (hoje mora de aluguel)",
      "Localização tranquila e de fácil acesso ao centro",
      "Lote de 330 m² é suficiente",
      "Área verde e lazer com espaço infantil, piscina e salão de festas",
      "Entrada de ~30% + financiamento (ou à vista se vender o outro imóvel)",
    ],
    mainObjections: [
      "Renda variável de negócio próprio — sensível a parcela e prazo",
      "Agenda corrida — precisa de clareza e praticidade nas condições",
      "Taxa de condomínio aceitável até uns R$ 600–700",
    ],
    suggestedPrompts: [
      "Como é hoje a sua situação de moradia em Prudente?",
      "O que pesa mais pra você na hora de escolher onde construir sua casa?",
      "Como você pensa a forma de pagamento pra uma compra desse tamanho?",
    ],
    avatar: andersonPrudenteImg,
    markdownPath: "/persona-md/prudente/Persona_Prudente_1_Anderson_Ribeiro.md",
    role: "Empresário — Bar-restaurante e Estúdio",
    tagline: "43 anos · Presidente Prudente/SP · teto R$ 396 mil (lote)",
    bio: "Empresário dono de um bar-restaurante e de um estúdio em Presidente Prudente. Mora de aluguel hoje e busca o primeiro imóvel próprio para morar — lote para construir é exatamente o que tinha em mente.",
  },
  {
    id: "sergio_prudente",
    context: "prudente",
    name: "Sérgio Marmuro",
    initials: "SM",
    color: "bg-teal-700",
    age: 56,
    city: "Presidente Prudente/SP",
    occupation: "Aposentado — gerencia a loja de colchões/sofás do filho",
    profile: "Casado, filhos adultos (não coabitam)",
    income: "~R$ 14–15 mil/mês (familiar)",
    priceCeiling: "~R$ 400 mil (lote)",
    preferredProduct: "Lote + construção",
    initialInterest: "ALTO",
    decisionCriteria: [
      "Primeira casa em condomínio fechado (hoje mora em casa de rua)",
      "Segurança como motivador central (desejo da esposa)",
      "Lote de 330 m² (entre 300–400 m² é o ideal)",
      "Localização próxima aos Damas, com área verde",
      "Marca/construtora com reputação local (Dama, Manpei/Funada)",
    ],
    mainObjections: [
      "Teto de preço apertado (~R$ 400 mil no terreno)",
      "À vista 100% inviável — precisa financiar boa parte",
      "Sem experiência com taxa de condomínio (estima R$ 400–600)",
      "Decisão compartilhada com a esposa",
    ],
    suggestedPrompts: [
      "O que te faria sair da casa onde você mora hoje?",
      "Como é a sua relação com a região dos Damas?",
      "Como funciona a decisão de comprar um imóvel desses lá em casa?",
    ],
    avatar: sergioPrudenteImg,
    markdownPath: "/persona-md/prudente/Persona_Prudente_2_Sergio_Marmuro.md",
    role: "Aposentado — gerencia a loja de colchões/sofás do filho",
    tagline: "56 anos · Presidente Prudente/SP · teto ~R$ 400 mil (lote)",
    bio: "Aposentado que ainda ajuda na loja do filho, mora em casa própria de rua no centro de Prudente. A esposa quer mais segurança e ele avalia, pela primeira vez, um condomínio fechado.",
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
