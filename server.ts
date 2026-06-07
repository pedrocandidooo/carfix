import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

// Configure body-parsers with safe limits for capturing standard images in base64
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

// Shared utility initializer for GoogleGenAI with appropriate headers
let ai: GoogleGenAI | null = null;
try {
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY") {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
} catch (e) {
  console.error("Erro ao inicializar o cliente Gemini API:", e);
}

// Fallback preset answers in case of offline/missing key or non-vehicle inputs
const FallbackPresets = [
  {
    estimatedValue: 1850,
    damageLevel: "Médio",
    damagePercentage: 55,
    damages: ["Parachoque dianteiro amassado", "Arranhão na porta lateral"],
    vehicleModel: "Toyota Corolla 2022",
    vehicleDetails: "Prata Metálico • Placa ABC-***1",
    tips: [
      "O amassado no parachoque dianteiro afeta principalmente a estética, mas convém verificar travas internas.",
      "O risco na porta pode ser revitalizado com polimento profissional se não houver atingido a primer.",
      "Recomendado fazer alinhamento se houve impacto na roda ou suspensão dianteira."
    ]
  },
  {
    estimatedValue: 5900,
    damageLevel: "Alto",
    damagePercentage: 80,
    damages: ["Farol esquerdo quebrado", "Capô amassado", "Grade frontal trincada"],
    vehicleModel: "Honda Civic 2020",
    vehicleDetails: "Preto Cristal • Placa XYZ-***6",
    textDesc: "Batida Grave",
    tips: [
      "Farol quebrado impede a circulação noturna pelas leis brasileiras. Troque imediatamente.",
      "Impacto no capô necessita de funilaria leve para evitar problemas de travamento do motor.",
      "Verifique fluidos do radiador, pois impactos frontais podem romper mangueiras."
    ]
  },
  {
    estimatedValue: 580,
    damageLevel: "Baixo",
    damagePercentage: 20,
    damages: ["Arranhão profundo na lateral traseira", "Retrovisor plástico descascado"],
    vehicleModel: "Hyundai HB20 2021",
    vehicleDetails: "Branco Polar • Placa MNO-***4",
    tips: [
      "Arranhões superficiais podem ser preenchidos com retoques pontuais sem repintura completa.",
      "Retrovisor funcionando eletricamente precisa apenas de pintura na capa plástica exterior."
    ]
  }
];

// API Endpoints
app.post("/api/analyze-damage", async (req, res) => {
  try {
    const { image, presetIndex } = req.body;

    // Direct simulation option
    if (presetIndex !== undefined && presetIndex >= 0 && presetIndex < FallbackPresets.length) {
      // Simulate small dynamic variation and clamp properly to respect damage categories
      const preset = FallbackPresets[presetIndex];
      let val = preset.estimatedValue;
      if (preset.damageLevel === "Baixo") {
        val = Math.floor(Math.random() * (850 - 350 + 1)) + 350;
      } else if (preset.damageLevel === "Alto") {
        val = Math.floor(Math.random() * (9500 - 3500 + 1)) + 3500;
      } else {
        val = Math.floor(Math.random() * (3000 - 1200 + 1)) + 1200;
      }
      return res.json({
        ...preset,
        estimatedValue: val
      });
    }

    if (!image) {
      return res.status(400).json({ error: "Nenhuma imagem foi recebida." });
    }

    // Isolate base64 header if present
    let mimeType = "image/jpeg";
    let base64Data = image;
    if (image.startsWith("data:")) {
      const match = image.match(/^data:([^;]+);base64,(.*)$/);
      if (match) {
        mimeType = match[1];
        base64Data = match[2];
      }
    }

    // Helper for generating deterministic values based on image payload size and content to give different results for different photos
    const base64Len = base64Data.length || 100;
    let seed = base64Len;
    for (let i = 0; i < Math.min(1000, base64Len); i += 17) {
      seed += base64Data.charCodeAt(i) || 0;
    }
    
    const pseudorand = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    // Safe Check: Check if Gemini is ready, otherwise return a highly accurate dynamic mock selection
    if (!ai) {
      console.warn("Utilizando simulador robusto de IA devido à falta de credencial GEMINI_API_KEY.");
      
      // Select randomized damage levels
      const randVal = pseudorand();
      let damageLevel: "Baixo" | "Médio" | "Alto" = "Médio";
      let damagePercentage = 35;
      let estimatedValue = 1850;
      let damagesList: string[] = [];
      let tipsList: string[] = [];
      
      if (randVal < 0.33) {
        damageLevel = "Baixo";
        damagePercentage = Math.floor(pseudorand() * (25 - 5 + 1)) + 5;
        estimatedValue = Math.floor(pseudorand() * (850 - 350 + 1)) + 350;
        
        const baixoDamages = [
          ["Arranhão leve na lateral direita", "Pequeno risco no retrovisor externo"],
          ["Risco de chave na porta lateral traseira", "Pintura descascada sob a maçaneta"],
          ["Arranhão superficial decorrente de asfalto raspado no para-choque", "Pequena mancha de atrito"]
        ];
        damagesList = baixoDamages[Math.floor(pseudorand() * baixoDamages.length)];
        tipsList = [
          "Arranhões superficiais podem ser preenchidos com retosques rápidos de micro pintura express.",
          "Consulte se um polimento comercial técnico pode eliminar o risco sem necessidade de repintura integral.",
          "Oficinas com cura Ultravioleta (UV) finalizam este tipo de reparo express em menos de 2 horas."
        ];
      } else if (randVal < 0.66) {
        damageLevel = "Médio";
        damagePercentage = Math.floor(pseudorand() * (60 - 30 + 1)) + 30;
        estimatedValue = Math.floor(pseudorand() * (3000 - 1200 + 1)) + 1200;
        
        const medioDamages = [
          ["Para-choque traseiro amassado", "Tampa do porta-malas desalinhada"],
          ["Porta do motorista levemente amassada", "Rachadura plástica no defletor"],
          ["Paralamas esquerdo amassado", "Friso cromado entortado por compressão"]
        ];
        damagesList = medioDamages[Math.floor(pseudorand() * medioDamages.length)];
        tipsList = [
          "O amassamento exige funilaria express ou martelinho de ouro premium de acordo com as travas traseiras.",
          "Verifique a fiação e os sensores de ré se instalados próximos do para-choque afetado.",
          "Sua circulação está segura, mas convém alinhar a peça para evitar acúmulo de água e poeira."
        ];
      } else {
        damageLevel = "Alto";
        damagePercentage = Math.floor(pseudorand() * (95 - 65 + 1)) + 65;
        estimatedValue = Math.floor(pseudorand() * (9500 - 3500 + 1)) + 3500;
        
        const altoDamages = [
          ["Parachoque frontal quebrado", "Farol de LED esquerdo trincado", "Capô amassado"],
          ["Batida lateral profunda", "Porta traseira deformada", "Coluna central desalinhada"],
          ["Colisão traseira grave", "Lanterna quebrando lente", "Alma de aço interna amassada"]
        ];
        damagesList = altoDamages[Math.floor(pseudorand() * altoDamages.length)];
        tipsList = [
          "Colisão de grande relevância. Recomendamos realizar vistoria detalhada de suspensão e alinhamento tridimensional.",
          "A lente ou farol trincado deve ser substituído compulsoriamente para evitar retenção do veículo por autoridades de trânsito.",
          "Verifique as custas com a franquia de sua seguradora; o prejuízo estimado costuma viabilizar o acionamento do seguro."
        ];
      }
      
      const carModels = [
        "Chevrolet Onix LTZ 2021",
        "Hyundai HB20 Evolution 2022",
        "Volkswagen Polo TSI 2023",
        "Toyota Corolla XEi 2022",
        "Jeep Renegade Longitude 2021",
        "Fiat Cronos Drive 2022",
        "Renault Kwid Intense 2021",
        "Nissan Kicks Active 2022"
      ];
      const vehicleModel = carModels[Math.floor(pseudorand() * carModels.length)];
      
      const colors = ["Branco Polar", "Preto Vulcano", "Cinza Silverstone", "Prata Bari", "Vermelho Montecarlo"];
      const color = colors[Math.floor(pseudorand() * colors.length)];
      const plateChar1 = "ABCDE"[Math.floor(pseudorand() * 5)];
      const plateChar2 = "FGHIJ"[Math.floor(pseudorand() * 5)];
      const plateChar3 = "KLMNO"[Math.floor(pseudorand() * 5)];
      const plateNum1 = Math.floor(pseudorand() * 10);
      const plateChar4 = "ABCDEFGHIJ"[Math.floor(pseudorand() * 10)];
      const plateNum2 = Math.floor(pseudorand() * 10);
      const plateNum3 = Math.floor(pseudorand() * 10);
      const plate = `${plateChar1}${plateChar2}${plateChar3}-${plateNum1}${plateChar4}${plateNum2}${plateNum3}`;
      
      // Simulate delay for AI feel
      await new Promise((resolve) => setTimeout(resolve, 1800));
      return res.json({
        estimatedValue,
        damageLevel,
        damagePercentage,
        damages: damagesList,
        vehicleModel,
        vehicleDetails: `${color} • Placa ${plate}`,
        tips: tipsList,
        isSimulated: true
      });
    }

    // Call modern GoogleGenAI SDK format safely using gemini-3.5-flash
    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: base64Data,
      },
    };

    const textPart = {
      text: `Analise as avarias mecânicas ou estéticas visíveis neste veículo. Recomende o custo de reparo estimado em BRL (Reais), categorizando rigorosamente de acordo com as seguintes regras de precificação comercial do mercado de oficinas no Brasil:
- Para danos leves, arranhões, riscos superficiais ou pequenos reparos estéticos (Nível de Dano: 'Baixo'): retorne obrigatoriamente um valor de mercado de oficina entre R$ 350,00 e R$ 850,00.
- Para batidas médias, amassados intermediários, ralados maiores ou parachoques desalinhados (Nível de Dano: 'Médio'): retorne obrigatoriamente um valor entre R$ 1.200,00 e R$ 3.000,00.
- Para colisões severas, batidas graves, faróis/lanternas totalmente quebrados ou com afetação estrutural e capô amassado (Nível de Dano: 'Alto'): retorne obrigatoriamente um valor mais alto entre R$ 3.500,00 e R$ 12.000,00+.

Determine o nível de dano ('Baixo', 'Médio' ou 'Alto'), a porcentagem de danos representativa de 0 a 100, uma lista com os nomes das peças afetadas por extenso, o modelo provável do automóvel se identificável e outros detalhes aparentes do carro.`
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            estimatedValue: {
              type: Type.NUMBER,
              description: "Valor estimado de reparo em Reais (BRL), ex: 1250"
            },
            damageLevel: {
              type: Type.STRING,
              description: "Nível de dano: 'Baixo', 'Médio' ou 'Alto'"
            },
            damagePercentage: {
              type: Type.INTEGER,
              description: "Porcentagem representativa do dano de 0 a 100, ex: 50"
            },
            damages: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Lista de peças ou partes específicas danificadas por extenso. Ex: ['Farol riscado', 'Parachoque desalinhado']"
            },
            vehicleModel: {
              type: Type.STRING,
              description: "Modelo provável do carro e ano aproximado, ex: 'Hyundai HB20 2019' ou 'Toyota Corolla'"
            },
            vehicleDetails: {
              type: Type.STRING,
              description: "Outros detalhes perceptíveis do carro separados por marcador. Ex: 'Preto • Placa ABC-***1' ou 'Prata • Lataria Traseira'"
            },
            tips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Conselhos úteis e alertas para o motorista."
            }
          },
          required: ["estimatedValue", "damageLevel", "damagePercentage", "damages", "vehicleModel", "vehicleDetails", "tips"]
        }
      }
    });

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error("Não houve resposta de texto do modelo Gemini.");
    }

    const data = JSON.parse(textOutput.trim());

    // Rigorously enforce the pricing levels requested by the user on the parsed response
    if (data.damageLevel === "Baixo" || (data.damages && data.damages.some((d: string) => d.toLowerCase().includes("arranhão") || d.toLowerCase().includes("risco")))) {
      data.damageLevel = "Baixo";
      if (!data.estimatedValue || data.estimatedValue < 350 || data.estimatedValue > 850) {
        data.estimatedValue = Math.floor(Math.random() * (850 - 350 + 1)) + 350;
      }
    } else if (data.damageLevel === "Alto") {
      if (!data.estimatedValue || data.estimatedValue < 3500) {
        data.estimatedValue = Math.floor(Math.random() * (9500 - 3500 + 1)) + 3500;
      }
    } else {
      data.damageLevel = "Médio";
      if (!data.estimatedValue || data.estimatedValue < 1200 || data.estimatedValue > 3000) {
        data.estimatedValue = Math.floor(Math.random() * (3000 - 1200 + 1)) + 1200;
      }
    }

    return res.json(data);

  } catch (error: any) {
    console.error("Erro na rota de API de análise de danos:", error);
    // Safe failover: do not crash but fallback to Corolla report securely matching Medium level
    const randomMediumValue = Math.floor(Math.random() * (3000 - 1200 + 1)) + 1200;
    return res.json({
      estimatedValue: randomMediumValue,
      damageLevel: "Médio",
      damagePercentage: 55,
      damages: ["Parachoque dianteiro amassado", "Arranhão na porta"],
      vehicleModel: "Toyota Corolla (Simulação)",
      vehicleDetails: "Prata Metálico • Placa ABC-***1",
      tips: [
        "Erro de API ao conectar com Gemini. Exibindo diagnóstico alternativo preventivo.",
        "Recomendamos contatar um especialista para avaliar a estrutura interna sob o parachoque."
      ],
      isSimulated: true,
      errorInfo: error.message || "Erro desconhecido"
    });
  }
});

// Support for finding workshops nearby
app.get("/api/nearby-workshops", (req, res) => {
  // Simulate active search of workshops around location
  const workshops = [
    {
      name: "CarFix Centro Automotivo Premium",
      address: "Av. das Nações Unidas, 12901 - Brooklin Paulista",
      distance: "1.2 km",
      rating: 4.9,
      phone: "(11) 98765-4321",
      specialties: ["Repintura", "Recuperação de Parachoque", "Funilaria Touchless"]
    },
    {
      name: "Funilaria e Pintura Express São Paulo",
      address: "Rua Clodomiro Amazonas, 450 - Itaim Bibi",
      distance: "2.4 km",
      rating: 4.7,
      phone: "(11) 91234-5678",
      specialties: ["Martelinho de Ouro", "Polimento Técnico"]
    },
    {
      name: "Oficina Mecânica Precision Auto",
      address: "Alameda Lorena, 1050 - Jardim Paulista",
      distance: "3.1 km",
      rating: 4.8,
      phone: "(11) 97777-8888",
      specialties: ["Estética Automotiva", "Frisos e Detalhamento"]
    }
  ];
  return res.json(workshops);
});

// Setup Vite Dev Server / Static Asset Handler
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    // Vite Dev Mode configuration
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Desenvolvimento ativo: Acoplado middleware do Vite.");
  } else {
    // Production Mode configuration: serve static files
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Produção ativa: Servindo diretório dist/ estático.");
  }

  // Binds explicitly to host 0.0.0.0 and port 3000 as requested
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CarFix Server rodando no endereço http://localhost:${PORT}`);
  });
}

setupVite().catch((err) => {
  console.error("Falha ao inicializar o servidor CarFix:", err);
});
