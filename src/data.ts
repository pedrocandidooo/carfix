import { Vehicle, DamageReport, Workshop } from "./types";

export const PRESET_CAR_ILLUSTRATION = "https://lh3.googleusercontent.com/aida-public/AB6AXuAh2YfSRduCUxz7hx4vbinPEsz1G1s2Xlh9vhL2iV8MrllF5Tz3ScYCvrnvgHJUS6du-gpXTJAwKXmn9wqzKZBRyudZxAPfvWCYb_cSucXEz5_KoM-mLTTCMiWhvhFDDdjULCTcUtSgom2fa4lZOBM3KTSBqsVny9PkCOx7Xq4N-WY2ZBdYVPytCwPdw8oQbbAuUut6_zwWIdbVAtrypCXYgYsiHf90pVTEH61JKBjSnh5MCPvKBWDFHo1juM_42omA2lsueBrOiT4";
export const SCANNING_CAR_ILLUSTRATION = "https://lh3.googleusercontent.com/aida-public/AB6AXuAecPHvIUhmcRJTawS_-6evupIzLCNrG0OCrjigSEBSzKWteIUYFIhZ89qzxB3VQR4WTZkxMHl1bbC74bc6NcLZEDYMTjSYKIs45TWtucvV5Uxt4C22AnfbmmsF4vCNHc1Rsnq2KXi0OX89CRSs6FMBHtPjmMGp0YFcNq4qjqPiwxMtrgsKN2fTGsKD1TFtIMwno9g7ZntcKgawCOChB360yprzu6vpYx7LyUEKCA1StliRwC3nAX6wm768V0YS83xzseAgA2d77n4";
export const ANALYZED_CAR_ILLUSTRATION = "https://lh3.googleusercontent.com/aida-public/AB6AXuDbcXuwHIrabHb4rKTbJ-CgXfwTABockr4zPGp5jPO1ZCYiFpHL-rEINYKc0ACZMET4xdzm5E3pOJeU_L-RAssRjUX3XF8obpuVhhXSexqItwck1XVxvSI40RrPQy8qdNSaIjpqJbNqVsk4ABtmZdw4XaGdbRERFxg_YlsLVTzr6oNL7d0ENTTtM2adQs-J_HZ7Q_s6Td0aWyeMr7GF_6ORv5onndcnGY8zok0V7MxbhwAtwb8dtA_P06NiUWnSW87N7e4vyHfUvC0";

export const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: "v1",
    model: "Toyota Corolla",
    plate: "ABC-1234",
    color: "Prata",
    year: "2022"
  },
  {
    id: "v2",
    model: "Honda Civic",
    plate: "XYZ-9876",
    color: "Preto",
    year: "2020"
  }
];

export const PRESET_REPORTS: DamageReport[] = [
  {
    id: "rep-toyota",
    vehicleId: "v1",
    date: "06/06/2026",
    estimatedValue: 1850,
    damageLevel: "Médio",
    damagePercentage: 55,
    damages: ["Parachoque dianteiro amassado", "Arranhão na porta lateral"],
    vehicleModel: "Toyota Corolla 2022",
    vehicleDetails: "Prata Metálico • Placa ABC-***1",
    tips: [
      "O amassado no parachoque dianteiro afeta principalmente a estética, mas convém verificar as travas internas nos parabarros.",
      "O risco na porta pode ser revitalizado com polimento profissional caso não tenha atingido a pintura base (primer).",
      "Considere fazer alinhamento se houve impacto relevante na roda ou extremidade da barra."
    ],
    photoUrl: ANALYZED_CAR_ILLUSTRATION
  },
  {
    id: "rep-civic",
    vehicleId: "v2",
    date: "05/06/2026",
    estimatedValue: 5900,
    damageLevel: "Alto",
    damagePercentage: 80,
    damages: ["Farol esquerdo quebrado", "Capô amassado", "Grade frontal trincada"],
    vehicleModel: "Honda Civic 2020",
    vehicleDetails: "Preto Cristal • Placa XYZ-***6",
    tips: [
      "Troque o farol esquerdo de imediato. Trafegar com faróis danificados constitui infração média sob o CTB.",
      "Funilaria do capô impede acúmulo de umidade no motor e garante fechamento redundante de segurança.",
      "Verifique fluidos de arrefecimento: colisões anteriores no bocal comumente causam microfissuras secundárias."
    ],
    photoUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "rep-hb20",
    date: "04/06/2026",
    estimatedValue: 580,
    damageLevel: "Baixo",
    damagePercentage: 20,
    damages: ["Arranhão profundo na lateral traseira", "Capa do retrovisor descascada"],
    vehicleModel: "Hyundai HB20 2021",
    vehicleDetails: "Branco Polar • Placa MNO-***4",
    tips: [
      "Arranhões superficiais podem ser preenchidos por retoque localizado (micro pintura), reduzindo custos.",
      "Comando e espelho retrovisor intactos evitam a troca do espelho completo; substitua apenas de capa externa para economia."
    ],
    photoUrl: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=800"
  }
];

export const WORKSHOPS: Workshop[] = [
  {
    name: "Precision Funilaria & Martelinho",
    address: "Av. Pres. Juscelino Kubitschek, 1500 - Vila Olímpia",
    distance: "1.4 km",
    rating: 4.9,
    phone: "(11) 98765-4321",
    specialties: ["Martelinho de Ouro", "Retoque Express", "Pintura Ultravioleta"]
  },
  {
    name: "Autobahn Reparo Premium",
    address: "Rua Clodomiro Amazonas, 460 - Itaim Bibi",
    distance: "2.3 km",
    rating: 4.8,
    phone: "(11) 91234-5678",
    specialties: ["Polimento Avançado", "Vitrificação Ceramic", "Restauração de Plásticos"]
  },
  {
    name: "Detailing Center Jardim Paulista",
    address: "Alameda Lorena, 1050 - Jardim Paulista",
    distance: "4.1 km",
    rating: 4.7,
    phone: "(11) 97777-8888",
    specialties: ["Estética Automotiva", "Micro Pintura", "Reparo de Rodas"]
  }
];
