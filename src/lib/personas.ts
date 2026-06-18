import marinaImg from "@/assets/persona-marina.jpg";
import ricardoImg from "@/assets/persona-ricardo.jpg";
import helenaImg from "@/assets/persona-helena.jpg";

export type PersonaSummary = {
  id: string;
  name: string;
  role: string;
  tagline: string;
  bio: string;
  avatar: string;
  accent: string;
  suggestedPrompts: string[];
};

// Personas placeholder — serão substituídas pelos dados do POC.
export const PERSONAS: PersonaSummary[] = [
  {
    id: "marina",
    name: "Marina Andrade",
    role: "Compradora de primeira moradia",
    tagline: "32 anos · São Paulo · buscando o primeiro apartamento",
    bio: "Designer de produto, mora de aluguel há 8 anos. Está pesquisando há 6 meses, considerando financiamento pela Caixa. Insegura sobre o momento certo de comprar.",
    avatar: marinaImg,
    accent: "from-rose-200 to-amber-100",
    suggestedPrompts: [
      "O que mais te assusta na hora de comprar o primeiro imóvel?",
      "Como você está pesquisando imóveis hoje?",
      "O que um corretor poderia fazer pra te ajudar de verdade?",
    ],
  },
  {
    id: "ricardo",
    name: "Ricardo Menezes",
    role: "Investidor em imóveis para renda",
    tagline: "47 anos · Belo Horizonte · 4 imóveis na carteira",
    bio: "Empresário, investe em imóveis há 12 anos focando em locação. Avalia ROI, cap rate e potencial de valorização. Cético com lançamentos e tabelas de venda.",
    avatar: ricardoImg,
    accent: "from-sky-200 to-slate-100",
    suggestedPrompts: [
      "Como você decide entre comprar pronto ou na planta?",
      "Qual sua leitura do mercado de locação hoje?",
      "O que faria você considerar um novo lançamento?",
    ],
  },
  {
    id: "helena",
    name: "Helena Tavares",
    role: "Corretora autônoma sênior",
    tagline: "54 anos · Curitiba · 22 anos de mercado",
    bio: "Corretora experiente, atende classe média e alta. Conhece a fundo as dores de quem compra e vende. Crítica de ferramentas que prometem 'revolucionar' o mercado sem ouvir o corretor.",
    avatar: helenaImg,
    accent: "from-emerald-200 to-stone-100",
    suggestedPrompts: [
      "Como é o dia a dia de um corretor autônomo hoje?",
      "Que tipo de cliente é mais difícil de atender?",
      "O que falta nas ferramentas que você usa?",
    ],
  },
];

export function getPersona(id: string): PersonaSummary | undefined {
  return PERSONAS.find((p) => p.id === id);
}
