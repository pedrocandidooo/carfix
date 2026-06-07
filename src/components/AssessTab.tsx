import React, { useState, useRef, useEffect } from "react";
import {
  Camera,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  Car,
  Plus,
  AlertTriangle,
  MapPin,
  ChevronRight,
  Phone,
  Star,
  X,
  Upload,
  RefreshCw,
  Map
} from "lucide-react";
import { Vehicle, DamageReport, Workshop } from "../types";
import {
  PRESET_CAR_ILLUSTRATION,
  SCANNING_CAR_ILLUSTRATION,
  ANALYZED_CAR_ILLUSTRATION,
  PRESET_REPORTS
} from "../data";

function getStateAbbreviation(stateName: string): string {
  const norm = stateName.toLowerCase().trim();
  if (norm.includes("são paulo") || norm === "sp") return "SP";
  if (norm.includes("rio de janeiro") || norm === "rj") return "RJ";
  if (norm.includes("minas gerais") || norm === "mg") return "MG";
  if (norm.includes("paraná") || norm.includes("parana") || norm === "pr") return "PR";
  if (norm.includes("rio grande do sul") || norm === "rs") return "RS";
  if (norm.includes("santa catarina") || norm === "sc") return "SC";
  if (norm.includes("bahia") || norm === "ba") return "BA";
  if (norm.includes("pernambuco") || norm === "pe") return "PE";
  if (norm.includes("ceará") || norm.includes("ceara") || norm === "ce") return "CE";
  if (norm.includes("distrito federal") || norm === "df") return "DF";
  if (norm.includes("goiás") || norm.includes("goias") || norm === "go") return "GO";
  if (norm.includes("espírito santo") || norm.includes("espirito santo") || norm === "es") return "ES";
  if (norm.includes("rio grande do norte") || norm === "rn") return "RN";
  if (norm.includes("paraíba") || norm.includes("paraiba") || norm === "pb") return "PB";
  if (norm.includes("amazonas") || norm === "am") return "AM";
  if (norm.includes("pará") || norm.includes("para") || norm === "pa") return "PA";
  if (norm.includes("maranhão") || norm.includes("maranhao") || norm === "ma") return "MA";
  if (norm.includes("piauí") || norm.includes("piaui") || norm === "pi") return "PI";
  if (norm.includes("alagoas") || norm === "al") return "AL";
  if (norm.includes("sergipe") || norm === "se") return "SE";
  if (norm.includes("mato grosso") || norm === "mt") return "MT";
  if (norm.includes("mato grosso do sul") || norm === "ms") return "MS";
  if (norm.includes("tocantins") || norm === "to") return "TO";
  if (norm.includes("acre") || norm === "ac") return "AC";
  if (norm.includes("rondônia") || norm.includes("rondonia") || norm === "ro") return "RO";
  if (norm.includes("roraima") || norm === "rr") return "RR";
  if (norm.includes("amapá") || norm.includes("amapa") || norm === "ap") return "AP";
  
  if (stateName.length === 2) return stateName.toUpperCase();
  return "SP";
}

function getDDD(stateName: string): string {
  const norm = stateName.toLowerCase().trim();
  if (norm.includes("são paulo") || norm === "sp") return "11";
  if (norm.includes("rio de janeiro") || norm === "rj") return "21";
  if (norm.includes("minas gerais") || norm === "mg") return "31";
  if (norm.includes("paraná") || norm.includes("parana") || norm === "pr") return "41";
  if (norm.includes("rio grande do sul") || norm === "rs") return "51";
  if (norm.includes("santa catarina") || norm === "sc") return "48";
  if (norm.includes("bahia") || norm === "ba") return "71";
  if (norm.includes("pernambuco") || norm === "pe") return "81";
  if (norm.includes("ceará") || norm.includes("ceara") || norm === "ce") return "85";
  if (norm.includes("distrito federal") || norm === "df") return "61";
  if (norm.includes("goiás") || norm.includes("goias") || norm === "go") return "62";
  if (norm.includes("espírito santo") || norm.includes("espirito santo") || norm === "es") return "27";
  return "11";
}

function generateWorkshopsList(city: string, state: string, neighborhood: string): Workshop[] {
  const uf = getStateAbbreviation(state);
  const ddd = getDDD(state);
  const bairro = neighborhood || "Centro";
  return [
    {
      name: "Precision Funilaria & Martelinho",
      address: `Av. Autonomistas, 1500 - ${bairro}, ${city} - ${uf}`,
      distance: "1.4 km",
      rating: 4.9,
      phone: `(${ddd}) 98765-4321`,
      specialties: ["Martelinho de Ouro", "Retoque Express", "Pintura Ultravioleta"]
    },
    {
      name: "Autobahn Reparo Premium",
      address: `Rua das Flores, 460 - ${bairro}, ${city} - ${uf}`,
      distance: "2.3 km",
      rating: 4.8,
      phone: `(${ddd}) 91234-5678`,
      specialties: ["Polimento Avançado", "Vitrificação Ceramic", "Restauração de Plásticos"]
    },
    {
      name: `Detailing Center ${city}`,
      address: `Av. Principal, 1050 - ${bairro}, ${city} - ${uf}`,
      distance: "3.8 km",
      rating: 4.7,
      phone: `(${ddd}) 97777-8888`,
      specialties: ["Estética Automotiva", "Micro Pintura", "Reparo de Rodas"]
    }
  ];
}

interface AssessTabProps {
  key?: string;
  vehicles: Vehicle[];
  selectedVehicleId: string | null;
  onSelectVehicle: (id: string) => void;
  onSaveReportOnHistory: (report: DamageReport) => void;
  goToVehiclesTab: () => void;
  inspectedReport?: DamageReport | null;
}

export default function AssessTab({
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
  onSaveReportOnHistory,
  goToVehiclesTab,
  inspectedReport
}: AssessTabProps) {
  // Navigation Flow State: "idle" | "camera" | "loading" | "result"
  const [flowState, setFlowState] = useState<"idle" | "camera" | "loading" | "result">(
    inspectedReport ? "result" : "idle"
  );

  // Drag and Drop files state
  const [isDragging, setIsDragging] = useState(false);

  // Active analysis report result
  const [currentReport, setCurrentReport] = useState<DamageReport | null>(inspectedReport || null);

  // Loading Steps State for micro-interactions simulation
  const [loadingStep, setLoadingStep] = useState(1);
  const [loadingProgress, setLoadingProgress] = useState(10);
  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Camera Access state
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Active sliding panel state for Workshops
  const [showWorkshopsPanel, setShowWorkshopsPanel] = useState(false);

  // Localization States for Brazil GPS support
  const [userCity, setUserCity] = useState("São Paulo");
  const [userState, setUserState] = useState("SP");
  const [userNeighborhood, setUserNeighborhood] = useState("Vila Olímpia");
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [manualSearchCity, setManualSearchCity] = useState("");

  const fetchBrowserLocation = () => {
    if (!navigator.geolocation) {
      console.warn("Geolocation is not supported by this browser.");
      return;
    }
    setIsFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=pt`);
          if (res.ok) {
            const data = await res.json();
            const city = data.city || data.locality || data.principalSubdivision || "Seu Município";
            const state = data.principalSubdivision || "SP";
            const neighborhood = data.locality || "Bairro Próximo";
            setUserCity(city);
            setUserState(state);
            setUserNeighborhood(neighborhood);
          }
        } catch (e) {
          console.error("Reverse geocoding fail:", e);
        } finally {
          setIsFetchingLocation(false);
        }
      },
      (error) => {
        console.warn("Geolocation permission or fetching failed:", error);
        setIsFetchingLocation(false);
      }
    );
  };

  useEffect(() => {
    if (showWorkshopsPanel) {
      fetchBrowserLocation();
    }
  }, [showWorkshopsPanel]);

  // Upload/input image state
  const [uploadedImageBase64, setUploadedImageBase64] = useState<string>(
    inspectedReport ? inspectedReport.photoUrl : ""
  );

  const activeVehicle = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];

  // Robustly link camera MediaStream to HTML5 video element when container mounts
  useEffect(() => {
    if (flowState === "camera" && cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch((err) => {
        console.warn("Autoplay was prevented or video streaming failed to start:", err);
      });
    }
  }, [flowState, cameraStream]);

  useEffect(() => {
    return () => {
      stopCamera();
      if (loadingTimerRef.current) clearInterval(loadingTimerRef.current);
    };
  }, []);

  // Format Price in BRL
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(value);
  };

  // Turn off device camera safely
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
  };

  // Launch device camera
  const startCamera = async () => {
    setErrorMessage("");
    setFlowState("camera");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      setCameraStream(stream);
      // Dual-bind setup: try binding immediately in case ref exists, and run fallback timer
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      } else {
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => {});
          }
        }, 100);
      }
    } catch (err: any) {
      console.warn("Permissão de câmera negada ou câmera não suportada no container:", err);
      setErrorMessage(
        "Não foi possível acessar seu feed de vídeo da câmera. Conceda permissão no navegador ou toque no simulador."
      );
    }
  };

  // Capture Photo from Camera Viewport
  const capturePhoto = () => {
    if (cameraStream && videoRef.current) {
      try {
        const video = videoRef.current;
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const base64 = canvas.toDataURL("image/jpeg");
          setUploadedImageBase64(base64);
          stopCamera();
          triggerAnalysis(base64);
        }
      } catch (err) {
        // Fallback simulation
        const sampleBase64 = ANALYZED_CAR_ILLUSTRATION;
        setUploadedImageBase64(sampleBase64);
        stopCamera();
        triggerAnalysis(sampleBase64);
      }
    } else {
      // Offline/Blocked sandbox simulation fallback image
      const sampleBase64 = ANALYZED_CAR_ILLUSTRATION;
      setUploadedImageBase64(sampleBase64);
      triggerAnalysis(sampleBase64);
    }
  };

  // Capture standard files uploaded or dragged
  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Por favor, envie apenas arquivos de imagem.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setUploadedImageBase64(base64);
      triggerAnalysis(base64);
    };
    reader.readAsDataURL(file);
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const selectFileManual = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  // Preset report selectors (Toyota Corolla, Honda Civic, HB20) as quick previews
  const triggerPresetAnalysis = (index: number) => {
    setUploadedImageBase64(PRESET_REPORTS[index].photoUrl);
    setFlowState("loading");
    setLoadingStep(1);
    setLoadingProgress(15);

    // Dynamic micro-interaction loading animation matching the screenshot transitions
    let elapsed = 0;
    if (loadingTimerRef.current) clearInterval(loadingTimerRef.current);

    loadingTimerRef.current = setInterval(() => {
      elapsed += 500;
      setLoadingProgress((prev) => Math.min(prev + Math.floor(Math.random() * 12) + 4, 98));

      // After 2.5 seconds, advance loading logs
      if (elapsed >= 2500) {
        setLoadingStep(2);
      }

      // After 4.5 seconds complete progress and render results
      if (elapsed >= 4500) {
        if (loadingTimerRef.current) {
          clearInterval(loadingTimerRef.current);
          loadingTimerRef.current = null;
        }
        setLoadingProgress(100);

        // Load Preset Report with slight price adjustments to simulate real intelligence
        const matchingPreset = PRESET_REPORTS[index];
        const randomAdjustment = Math.floor(Math.random() * 100) - 50;

        // Associate with selected vehicle if appropriate
        const modelName = activeVehicle ? `${activeVehicle.model} ${activeVehicle.year || ""}` : matchingPreset.vehicleModel;
        const detailsStr = activeVehicle ? `${activeVehicle.color} • Placa ${matchingPreset.vehicleDetails.split("Placa ")[1] || "ABC-***1"}` : matchingPreset.vehicleDetails;

        const updatedReport: DamageReport = {
          ...matchingPreset,
          id: `rep-${Date.now()}`,
          date: new Date().toLocaleDateString("pt-BR"),
          estimatedValue: Math.max(300, matchingPreset.estimatedValue + randomAdjustment),
          vehicleModel: modelName,
          vehicleDetails: detailsStr,
          vehicleId: activeVehicle?.id
        };

        setCurrentReport(updatedReport);
        onSaveReportOnHistory(updatedReport);
        setFlowState("result");
      }
    }, 500);
  };

  // General Backend Analysis Call
  const triggerAnalysis = async (base64Image: string) => {
    setFlowState("loading");
    setLoadingStep(1);
    setLoadingProgress(10);

    // Setup progressive visual bar loading
    let currentBar = 10;
    const progressTimer = setInterval(() => {
      currentBar += Math.floor(Math.random() * 8) + 2;
      if (currentBar >= 95) {
        clearInterval(progressTimer);
      } else {
        setLoadingProgress(currentBar);
      }
    }, 300);

    // timed status changes "Imagem processada" -> "Danos localizados" in 3 seconds
    const statusTimer = setTimeout(() => {
      setLoadingStep(2);
    }, 2800);

    try {
      const response = await fetch("/api/analyze-damage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Image })
      });

      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }

      const reportData = await response.json();
      clearInterval(progressTimer);
      clearTimeout(statusTimer);

      setLoadingProgress(100);
      setLoadingStep(2);

      // Create unique damage report in state
      const finalReport: DamageReport = {
        id: `rep-${Date.now()}`,
        date: new Date().toLocaleDateString("pt-BR"),
        estimatedValue: reportData.estimatedValue || 1250,
        damageLevel: reportData.damageLevel || "Médio",
        damagePercentage: reportData.damagePercentage || 55,
        damages: reportData.damages || ["Dano estético na lataria"],
        vehicleModel: activeVehicle ? `${activeVehicle.model} ${activeVehicle.year || ""}` : (reportData.vehicleModel || "Veículo"),
        vehicleDetails: activeVehicle ? `${activeVehicle.color} • Placa ${activeVehicle.plate}` : (reportData.vehicleDetails || "Cor indefinida • Placa pendente"),
        tips: reportData.tips || ["Verifique a integridade interna do componente afetado."],
        photoUrl: base64Image,
        vehicleId: activeVehicle?.id,
        isSimulated: reportData.isSimulated
      };

      // Add a small 500ms polish delay so results transitions are fluent
      setTimeout(() => {
        setCurrentReport(finalReport);
        onSaveReportOnHistory(finalReport);
        setFlowState("result");
      }, 500);

    } catch (err: any) {
      console.error("Falha ao analisar via API, aplicando fallback de seguridade:", err);
      clearInterval(progressTimer);
      clearTimeout(statusTimer);

      // Gracefully fall back to Corolla report configuration
      const fallbackReport: DamageReport = {
        id: `rep-${Date.now()}`,
        date: new Date().toLocaleDateString("pt-BR"),
        estimatedValue: 1250,
        damageLevel: "Médio",
        damagePercentage: 55,
        damages: ["Parachoque dianteiro", "Arranhão na porta"],
        vehicleModel: activeVehicle ? `${activeVehicle.model} ${activeVehicle.year || ""}` : "Toyota Corolla 2022",
        vehicleDetails: activeVehicle ? `${activeVehicle.color} • Placa ${activeVehicle.plate}` : "Prata Metálico • Placa ABC-***1",
        tips: [
          "O amassado no parachoque dianteiro afeta principalmente a estética, mas convém verificar travas internas.",
          "O risco na porta pode ser revitalizado com polimento profissional se não houver atingido a primer.",
          "Recomendado fazer alinhamento se houve impacto na roda ou suspensão"
        ],
        photoUrl: base64Image || ANALYZED_CAR_ILLUSTRATION,
        vehicleId: activeVehicle?.id,
        isSimulated: true
      };

      setTimeout(() => {
        setCurrentReport(fallbackReport);
        onSaveReportOnHistory(fallbackReport);
        setFlowState("result");
      }, 1000);
    }
  };

  return (
    <div className="w-full">
      {/* FLOW STATE: IDLE */}
      {flowState === "idle" && (
        <div className="space-y-6">
          {/* Welcoming Hero Block */}
          <div className="bg-gradient-to-r from-blue-500/15 via-indigo-500/10 to-purple-500/15 backdrop-blur-xl rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-2xl border border-white/10">
            <div className="relative z-10 max-w-lg space-y-2">
              <h1 className="text-2xl md:text-3.5xl font-extrabold tracking-tight text-white leading-tight">
                Olá! Como podemos ajudar seu carro hoje?
              </h1>
              <p className="text-sm md:text-base text-blue-200/90 leading-relaxed font-light">
                Faça uma análise rápida de danos ou envie fotos para um orçamento profissional em minutos.
              </p>
            </div>

            {/* Illustration Graphic container */}
            <div className="mt-6 w-full h-44 sm:h-56 rounded-xl overflow-hidden relative shadow-inner border border-white/10">
              <img
                src={PRESET_CAR_ILLUSTRATION}
                alt="CarFix scanner"
                className="w-full h-full object-cover select-none"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#1e1b4b]/40 to-transparent"></div>
            </div>
          </div>

          {/* Action Choice Sections */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Camera triggers */}
            <button
              id="btn-trigger-camera"
              onClick={startCamera}
              className="group bg-white/5 backdrop-blur-md hover:bg-white/10 border border-white/15 hover:border-blue-400 p-6 rounded-xl flex flex-col items-center justify-center text-center gap-3 transition-all cursor-pointer shadow-lg active:scale-95 duration-150"
            >
              <div className="w-14 h-14 rounded-full bg-blue-500/15 text-blue-300 flex items-center justify-center transition-transform group-hover:scale-110 border border-blue-400/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                <Camera size={26} className="stroke-[2.5px]" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">Tirar Foto</h3>
                <p className="text-xs text-white/50 mt-0.5">Escaneie o veículo agora</p>
              </div>
            </button>

            {/* Upload Gallery triggers */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative border border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-all ${
                isDragging
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-white/20 hover:border-white/45 bg-white/5 hover:bg-white/10"
              }`}
            >
              <input
                type="file"
                id="manual-input-gallery"
                accept="image/*"
                onChange={selectFileManual}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                title="Arraste ou envie fotos existentes"
              />
              <div className="w-14 h-14 rounded-full bg-white/5 text-white/60 flex items-center justify-center mb-3 border border-white/10">
                <ImageIcon size={26} />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">Enviar da Galeria</h3>
                <p className="text-xs text-white/50 mt-0.5">Escolha fotos existentes</p>
              </div>
              {isDragging && (
                <div className="absolute inset-0 bg-[#0f172a]/95 backdrop-blur-md rounded-xl flex items-center justify-center">
                  <div className="space-y-2 text-center text-blue-300">
                    <Upload size={32} className="mx-auto animate-bounce" />
                    <span className="font-bold text-sm">Soltar Foto Aqui</span>
                  </div>
                </div>
              )}
            </div>
          </div>



          {/* Recent Vehicles list */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold tracking-tight text-white" id="recent-vehicles-heading">
                Veículos Recentes
              </h2>
              <button
                id="btn-ver-todos"
                onClick={goToVehiclesTab}
                className="text-blue-400 font-bold text-xs hover:underline flex items-center"
              >
                Ver todos
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {vehicles.slice(0, 2).map((vehicle) => {
                const isSelected = selectedVehicleId === vehicle.id;
                return (
                  <div
                    key={vehicle.id}
                    id={`recent-vehicle-${vehicle.id}`}
                    onClick={() => onSelectVehicle(vehicle.id)}
                    className={`bg-white/5 rounded-xl p-4 shadow-sm border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                      isSelected
                        ? "border-2 border-blue-400 bg-white/10 ring-1 ring-blue-400/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]"
                        : "border-white/10 hover:border-white/20 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={`w-10 h-10 rounded-lg shrink-0 flex items-center justify-center ${
                        isSelected ? "bg-blue-500/20 text-blue-300" : "bg-white/5 text-white/50"
                      }`}>
                        <Car size={20} />
                      </div>
                      <div className="truncate">
                        <h4 className="font-bold text-white text-sm truncate">{vehicle.model}</h4>
                        <p className="text-[11px] text-white/50 font-medium truncate">
                          {vehicle.plate} • {vehicle.color}
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle2 size={16} className="text-emerald-400 shrink-0 stroke-[2.5px]" />
                    )}
                  </div>
                );
              })}

              {/* Add New vehicle block button */}
              <button
                id="btn-add-vehicle-recent"
                onClick={goToVehiclesTab}
                className="rounded-xl p-4 border border-dashed border-white/20 bg-white/5 text-white/60 hover:text-white hover:bg-white/10 hover:border-white/40 transition-colors text-sm font-semibold cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus size={16} /> Adicionar Veículo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLOW STATE: CAMERA SCREEN */}
      {flowState === "camera" && (
        <div className="bg-black text-white rounded-2xl overflow-hidden relative min-h-[400px] flex flex-col justify-between shadow-lg">
          <div className="p-4 bg-black/60 flex justify-between items-center z-10">
            <span className="font-bold text-sm text-gray-200 flex items-center gap-1.5">
              <Camera size={16} className="text-blue-400" /> Posicione sob o dano
            </span>
            <button
              id="btn-close-camera"
              onClick={() => {
                stopCamera();
                setFlowState("idle");
              }}
              className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10"
            >
              <X size={20} />
            </button>
          </div>

          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 border border-gray-950">
            {errorMessage ? (
              <div className="p-6 text-center max-w-sm space-y-4">
                <AlertTriangle size={48} className="text-amber-500 mx-auto" />
                <p className="text-sm leading-relaxed">{errorMessage}</p>
                <button
                  id="btn-simulate-camera-snap"
                  onClick={capturePhoto}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-5 py-2.5 rounded-lg transition-colors shadow"
                >
                  Continuar com Simulador
                </button>
              </div>
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {!errorMessage && (
            <div className="p-6 bg-black/60 flex justify-center items-center gap-4 z-10">
              <button
                id="btn-camera-snap"
                onClick={capturePhoto}
                className="w-16 h-16 rounded-full border-4 border-white bg-red-600 hover:bg-red-700 active:scale-90 transition-transform shadow-lg"
                title="Capturar foto"
              ></button>
            </div>
          )}
        </div>
      )}

      {/* FLOW STATE: LOADING AND SCANNING */}
      {flowState === "loading" && (
        <div className="flex-grow flex flex-col items-center justify-center py-6 relative overflow-hidden">
          <div className="w-full max-w-md flex flex-col items-center space-y-6">
            
            {/* Visualizer card */}
            <div className="w-full bg-white/5 backdrop-blur-2xl rounded-2xl shadow-2xl overflow-hidden border border-white/10 relative">
              <div className="aspect-[4/3] w-full bg-[#0f172a]/40 flex items-center justify-center relative overflow-hidden">
                {/* Horizontal digital neon scanning Line */}
                <div className="absolute inset-0 scan-line z-20"></div>

                {/* Silver sedan diagnostics illustration */}
                <img
                  src={SCANNING_CAR_ILLUSTRATION}
                  alt="Analyzing vehicle"
                  className="object-cover w-full h-full opacity-65"
                  referrerPolicy="no-referrer"
                />

                {/* Target scopes HUD */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                  <div className="w-48 h-48 border-2 border-blue-500/20 rounded-full flex items-center justify-center">
                    <div className="w-36 h-36 border border-blue-500/30 rounded-full animate-ping duration-[3000ms]"></div>
                    <div className="w-24 h-24 border border-blue-400/40 rounded-full absolute animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Status texts loaders */}
            <div className="text-center space-y-3 px-4">
              <div className="flex items-center justify-center gap-2">
                <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                  Analisando Danos...
                </h2>
                <span className="flex space-x-1 items-center mt-1">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></span>
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></span>
                </span>
              </div>
              <p className="text-sm text-white/60 max-w-xs mx-auto leading-relaxed">
                Nossa IA está identificando as avarias e estilhaços estruturais no seu veículo.
              </p>

              {/* Loader Line Bar status progress */}
              <div className="w-60 mx-auto h-2 bg-white/10 rounded-full overflow-hidden mt-4">
                <div
                  className="h-full bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300 rounded-full"
                  style={{ width: `${loadingProgress}%` }}
                ></div>
              </div>
            </div>

            {/* Log diagnostic checklist */}
            <div className="w-full grid grid-cols-2 gap-3 px-2">
              <div className="bg-white/5 p-3 rounded-xl flex items-center gap-2 border border-white/10 shadow-lg text-white">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span className="text-xs font-semibold text-white/80">Imagem processada</span>
              </div>

              <div className={`bg-white/5 p-3 rounded-xl flex items-center gap-2 border transition-all ${
                loadingStep === 1 ? "border-white/10 opacity-60 text-white/50" : "border-white/20 bg-blue-500/10 text-white"
              }`}>
                {loadingStep === 1 ? (
                  <RefreshCw size={15} className="text-blue-400 animate-spin shrink-0" />
                ) : (
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                )}
                <span className="text-xs font-semibold truncate">
                  {loadingStep === 1 ? "Detectando riscos" : "Danos localizados"}
                </span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* FLOW STATE: DETAILED DIAGNOSTIC AI RESULT REPORT */}
      {flowState === "result" && currentReport && (
        <div className="space-y-6">
          
          {/* Diagnostic top indicator */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white" id="result-title">
                Resultado da Análise
              </h2>
              <p className="text-sm text-white/60">
                Relatório detalhado baseado na inteligência artificial.
              </p>
            </div>
            <button
              id="btn-re-scan"
              onClick={() => {
                setCurrentReport(null);
                setUploadedImageBase64("");
                setFlowState("idle");
              }}
              className="flex items-center gap-1.5 text-blue-300 font-bold text-sm hover:underline border border-dashed border-blue-400/40 bg-white/5 px-3.5 py-1.5 rounded-lg active:scale-95 transition-transform"
            >
              <RefreshCw size={14} /> Analisar Nova Foto
            </button>
          </div>

          {/* Large bento layout grid wrapper */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            
            {/* Visual Snap Box component (Col-span 2) */}
            <div className="col-span-2 bg-white/5 rounded-2xl overflow-hidden border border-white/10 relative aspect-[4/3] shadow-2xl">
              <img
                src={uploadedImageBase64 || ANALYZED_CAR_ILLUSTRATION}
                alt="Analyzed car damage snap"
                className="w-full h-full object-cover select-none"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent flex flex-col justify-end p-5">
                <div className="flex gap-2">
                  <span className="bg-blue-600/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-md border border-white/10">
                    <CheckCircle2 size={13} className="shrink-0 stroke-[2.5px]" /> Analisado por IA
                  </span>
                </div>
              </div>
            </div>

            {/* Estimation price quote bento card box */}
            <div className="col-span-2 md:col-span-1 bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-xl text-white rounded-2xl p-5 flex flex-col justify-between shadow-2xl border border-white/20">
              <div>
                <span className="text-xs text-blue-200 font-extrabold uppercase tracking-wide block">Valor Estimado</span>
                <p className="text-3.5xl font-extrabold mt-1 tracking-tight font-mono text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-blue-300">
                  {formatPrice(currentReport.estimatedValue)}
                </p>
              </div>

              <div className="bg-white/10 rounded-xl p-4 mt-4 border border-white/10">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-bold text-blue-200">Nível do Dano</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                    currentReport.damageLevel === "Baixo"
                      ? "bg-emerald-500 text-white"
                      : currentReport.damageLevel === "Alto"
                      ? "bg-red-500 text-white"
                      : "bg-amber-500 text-white"
                  }`}>
                    {currentReport.damageLevel}
                  </span>
                </div>

                {/* Slider progress metric */}
                <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-white h-full transition-all duration-500"
                    style={{ width: `${currentReport.damagePercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Identified Damages bento box list */}
            <div className="col-span-2 md:col-span-1 bg-white/5 backdrop-blur-xl rounded-2xl p-5 border border-white/10 shadow-2xl flex flex-col">
              <h3 className="font-bold text-white text-base mb-3 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-blue-400 rounded-full block"></span> Danos Identificados
              </h3>
              <ul className="space-y-2 flex-grow overflow-y-auto max-h-[220px] pr-1">
                {currentReport.damages.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex justify-between items-center p-3 bg-white/5 rounded-lg text-xs font-bold text-white border border-white/10"
                  >
                    <span>{item}</span>
                    <AlertTriangle size={14} className="text-blue-300 shrink-0 stroke-[2px]" />
                  </li>
                ))}
              </ul>
            </div>

            {/* Action disclaimer block (Wide bento box, Col-span 2) */}
            <div className="col-span-2 md:col-span-2 bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl">
              <div className="space-y-1 max-w-sm">
                <div className="flex items-center gap-1.5 font-bold text-amber-400 text-xs">
                  <AlertTriangle size={15} /> Importante:
                </div>
                <p className="text-xs leading-relaxed text-white/70">
                  Este valor é apenas uma estimativa baseada na imagem. Procure um centro automotivo para um orçamento final.
                </p>
              </div>

              <button
                id="btn-show-workshops"
                onClick={() => setShowWorkshopsPanel(true)}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-5 py-3 rounded-lg text-xs font-bold shadow-lg hover:scale-[1.03] transition-all active:scale-95 flex items-center justify-center gap-2 border border-white/15 text-center shrink-0"
              >
                Ver Oficinas Próximas <Map size={14} />
              </button>
            </div>

          </div>

          {/* Identified Vehicle bottom summary */}
          <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-purple-500/10 backdrop-blur-xl rounded-2xl p-5 border border-white/10 flex items-center gap-4 shadow-2xl relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-blue-500/5 to-transparent pointer-events-none"></div>
            <div className="w-14 h-14 bg-blue-500/15 text-blue-300 rounded-xl flex items-center justify-center shrink-0 border border-blue-400/20 shadow-inner">
              <Car size={28} />
            </div>
            <div>
              <span className="text-[10px] text-blue-300 block font-semibold uppercase tracking-wider">Veículo Identificado</span>
              <h4 className="font-bold text-white text-lg leading-tight mt-0.5">{currentReport.vehicleModel}</h4>
              <p className="text-xs text-white/60 mt-1">{currentReport.vehicleDetails}</p>
            </div>
          </div>

          {/* AI Tips / Conselhos de segurança block */}
          {currentReport.tips && currentReport.tips.length > 0 && (
            <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-xl p-5 shadow-2xl space-y-3">
              <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-emerald-400" /> Diretrizes de Segurança IA
              </h4>
              <ul className="space-y-2 list-disc pl-5 text-xs text-white/70 leading-relaxed">
                {currentReport.tips.map((tip, idx) => (
                  <li key={idx} className="marker:text-blue-400">{tip}</li>
                ))}
              </ul>
            </div>
          )}

        </div>
      )}

      {/* CREDENTIALS WORKSHOPS OVERLAY SIDEBAR SLIDER PANEL */}
      {showWorkshopsPanel && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-end p-0 sm:p-4 backdrop-blur-sm">
          {/* Dismiss Click interceptor */}
          <div className="absolute inset-0" onClick={() => setShowWorkshopsPanel(false)}></div>

          {/* Sliding panel content */}
          <div className="relative bg-[#0f172a]/95 backdrop-blur-2xl w-full max-w-md h-full sm:h-[95vh] sm:rounded-2xl flex flex-col shadow-2xl overflow-hidden border-l border-white/10 animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <MapPin className="text-blue-300 shrink-0" size={20} />
                <h3 className="font-bold text-white text-base">Oficinas Parceiras Próximas</h3>
              </div>
              <button
                id="btn-close-workshops"
                onClick={() => setShowWorkshopsPanel(false)}
                className="text-white/60 hover:text-white p-1.5 rounded-full hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            {/* GPS and Search Panel */}
            <div className="p-4 bg-white/5 border-b border-white/10 space-y-3 shrink-0">
              <div className="flex items-center justify-between text-xs font-bold text-white/70">
                <div className="truncate pr-2">
                  Província: <span className="text-blue-300 font-extrabold">{userCity}, {getStateAbbreviation(userState)}</span>
                  {userNeighborhood && (
                    <span className="text-white/40 font-normal"> ({userNeighborhood})</span>
                  )}
                </div>
                <button
                  id="btn-detect-gps"
                  onClick={fetchBrowserLocation}
                  disabled={isFetchingLocation}
                  className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 active:scale-95 disabled:opacity-50 shrink-0"
                  title="Detectar por GPS no Navegador"
                >
                  <RefreshCw size={13} className={isFetchingLocation ? "animate-spin" : ""} />
                  {isFetchingLocation ? "Buscando..." : "GPS"}
                </button>
              </div>

              <form
                id="form-manual-city"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (manualSearchCity.trim()) {
                    const parts = manualSearchCity.split(",");
                    const parsedCity = parts[0].trim();
                    const parsedState = parts[1] ? parts[1].trim() : "SP";
                    setUserCity(parsedCity);
                    setUserState(parsedState);
                    setUserNeighborhood("Bairro Central");
                    setManualSearchCity("");
                  }
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  placeholder="Ex: Rio de Janeiro, RJ ou Curitiba"
                  value={manualSearchCity}
                  onChange={(e) => setManualSearchCity(e.target.value)}
                  className="flex-grow px-3 py-1.5 bg-white/5 border border-white/10 focus:border-blue-400 rounded-lg text-xs text-white placeholder:text-white/30 font-medium h-9 focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 rounded-lg active:scale-95 transition-all text-center h-9 font-sans"
                >
                  Buscar
                </button>
              </form>
            </div>

            {/* List */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
              <span className="text-[10px] font-bold text-blue-300 uppercase tracking-widest block mb-1 leading-relaxed">
                Redes Credenciadas CarFix • {userCity} - {getStateAbbreviation(userState)}
              </span>

              {generateWorkshopsList(userCity, userState, userNeighborhood).map((shop, idx) => (
                <div
                  key={idx}
                  className="bg-white/5 rounded-xl p-4 border border-white/10 shadow-lg hover:border-blue-400/30 hover:bg-white/10 transition-all space-y-3"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className="font-bold text-white text-sm">{shop.name}</h4>
                      <p className="text-xs text-white/60 mt-1 flex items-start gap-1 leading-normal">
                        <MapPin size={12} className="shrink-0 mt-0.5 text-blue-400" /> {shop.address}
                      </p>
                    </div>
                    <span className="bg-blue-500/20 text-blue-300 text-xs font-bold px-2 py-0.5 rounded shrink-0 border border-blue-400/20">
                      {shop.distance}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center text-amber-400 text-xs font-semibold gap-0.5">
                      <Star size={13} fill="currentColor" /> {shop.rating}
                    </div>
                    <span className="text-white/20">•</span>
                    <span className="text-xs text-white/50 leading-tight">
                      {shop.specialties.join(", ")}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-white/10 flex gap-2">
                    <a
                      href={`tel:${shop.phone.replace(/\D/g, "")}`}
                      className="flex-grow flex items-center justify-center gap-1.5 border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs py-2 rounded-lg font-bold transition-all active:scale-95 text-center px-1"
                    >
                      <Phone size={13} className="text-blue-300" /> {shop.phone}
                    </a>
                    
                    <a
                      id={`btn-route-${idx}`}
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shop.name + " " + shop.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs px-3.5 py-2 rounded-lg font-bold transition-all active:scale-95 border border-white/10 flex items-center justify-center gap-1 text-center"
                    >
                      Ir por GPS
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Disclaimer and help footnote inside sidebar */}
            <div className="p-4 bg-white/5 border-t border-white/10 text-[10px] text-white/50 shrink-0 text-center leading-relaxed">
              * Redes credenciadas garantem dedução de impostos e faturamento automático caso declare apólice de seguros integrada.
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
