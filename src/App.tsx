import React, { useState, useEffect } from "react";
import { Wrench, Check, Info } from "lucide-react";
import { Vehicle, DamageReport } from "./types";
import { INITIAL_VEHICLES, PRESET_REPORTS } from "./data";
import BottomNavBar from "./components/BottomNavBar";
import AssessTab from "./components/AssessTab";
import HistoryTab from "./components/HistoryTab";
import VehiclesTab from "./components/VehiclesTab";
import ProfileTab from "./components/ProfileTab";

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<"assess" | "history" | "vehicles" | "profile">("assess");

  // Vehicles list state (localStorage bound)
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  // Damage reports list state (localStorage bound)
  const [reports, setReports] = useState<DamageReport[]>([]);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState("");

  // Initialize and parse storage data
  useEffect(() => {
    // 1. Initial vehicles setup
    const storedVehicles = localStorage.getItem("carfix_vehicles_db");
    if (storedVehicles) {
      try {
        const parsed = JSON.parse(storedVehicles) as Vehicle[];
        setVehicles(parsed);
        // Default to first active vehicle
        if (parsed.length > 0) {
          setSelectedVehicleId(parsed[0].id);
        }
      } catch (e) {
        setVehicles(INITIAL_VEHICLES);
        setSelectedVehicleId("v1");
      }
    } else {
      setVehicles(INITIAL_VEHICLES);
      setSelectedVehicleId("v1");
      localStorage.setItem("carfix_vehicles_db", JSON.stringify(INITIAL_VEHICLES));
    }

    // 2. Initial reports setup
    const storedReports = localStorage.getItem("carfix_reports_db");
    if (storedReports) {
      try {
        const parsed = JSON.parse(storedReports) as DamageReport[];
        setReports(parsed);
      } catch (e) {
        setReports(PRESET_REPORTS);
      }
    } else {
      setReports(PRESET_REPORTS);
      localStorage.setItem("carfix_reports_db", JSON.stringify(PRESET_REPORTS));
    }
  }, []);

  // Utility to display fleeting toasts
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // Vehicles State managers
  const handleAddVehicle = (newVehicleData: Omit<Vehicle, "id">) => {
    const fresh: Vehicle = {
      ...newVehicleData,
      id: `v-${Date.now()}`
    };
    const updated = [fresh, ...vehicles];
    setVehicles(updated);
    setSelectedVehicleId(fresh.id);
    localStorage.setItem("carfix_vehicles_db", JSON.stringify(updated));
    triggerToast(`Veículo ${fresh.model} adicionado com sucesso!`);
  };

  const handleDeleteVehicle = (id: string) => {
    const updated = vehicles.filter((v) => v.id !== id);
    setVehicles(updated);
    localStorage.setItem("carfix_vehicles_db", JSON.stringify(updated));

    // If active vehicle was deleted, transition focus safely
    if (selectedVehicleId === id && updated.length > 0) {
      setSelectedVehicleId(updated[0].id);
    }
    triggerToast("Veículo removido da garagem.");
  };

  const handleSelectVehicle = (id: string) => {
    setSelectedVehicleId(id);
    const target = vehicles.find((v) => v.id === id);
    if (target) {
      triggerToast(`Veículo ativo alterado para ${target.model}!`);
    }
  };

  // Reports analysis managers
  const handleSaveReportOnHistory = (report: DamageReport) => {
    // Avoid double entries
    if (reports.some((r) => r.id === report.id)) return;

    const updated = [report, ...reports];
    setReports(updated);
    localStorage.setItem("carfix_reports_db", JSON.stringify(updated));
    triggerToast("Orçamento de avarias registrado sob o histórico!");
  };

  const handleDeleteReport = (id: string) => {
    const updated = reports.filter((r) => r.id !== id);
    setReports(updated);
    localStorage.setItem("carfix_reports_db", JSON.stringify(updated));
    triggerToast("Orçamento excluído dos registros.");
  };

  // Fluid transition helper: inspect details from older history cards
  const handleViewReportFromHistory = (report: DamageReport) => {
    // Make corresponding vehicle active if present
    if (report.vehicleId) {
      setSelectedVehicleId(report.vehicleId);
    }
    
    // Inject report back into active view states
    setActiveTab("assess");
    
    // Find the Assess component reference if we want to immediately boot results:
    // To do this simply, we will trigger a simulated callback to load the specific view.
    // In our AssessTab component, rendering flowState: "result" immediately fires when currentReport is statefully held!
    // So we can send an event or simply let the app handle it.
    // Let's pass a custom inspect listener. Wait, we can pass a ref or a simple initial report parameter to our Assess tab!
    // Let's implement an elegant way by storing the custom inspected report in a state, and passing it to AssessTab!
    setInspectedReport(report);
  };

  const [inspectedReport, setInspectedReport] = useState<DamageReport | null>(null);

  // If tab changes out of assess, clear inspected report reference so it starts fresh next time
  useEffect(() => {
    if (activeTab !== "assess") {
      setInspectedReport(null);
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#312e81] text-white flex flex-col font-sans pb-24 md:pb-6 relative shrink-0">
      
      {/* Toast Notification HUD */}
      {toastMessage && (
        <div className="fixed top-20 right-4 left-4 sm:left-auto sm:w-80 min-h-12 bg-white/10 backdrop-blur-md text-white rounded-xl p-3.5 flex items-center gap-3 shadow-2xl z-55 border border-white/20 animate-in slide-in-from-top-6 duration-200">
          <Check size={18} className="text-emerald-400 shrink-0 stroke-[3px]" />
          <span className="text-xs font-semibold tracking-tight leading-normal">{toastMessage}</span>
        </div>
      )}

      {/* Unified Frosted Glass TopAppBar Navigation Header */}
      <header className="w-full bg-white/5 backdrop-blur-xl border-b border-white/15 shadow-lg sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer active:scale-95 transition-transform"
            onClick={() => setActiveTab("assess")}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-blue to-brand-purple text-white flex items-center justify-center shadow-lg border border-white/10">
              <Wrench size={22} className="stroke-[2.5px]" />
            </div>
            <div>
              <span className="font-extrabold text-white text-lg tracking-tight">CarFix</span>
              <span className="text-[10px] text-blue-300 bg-white/10 border border-white/15 px-1.5 py-0.2 rounded font-bold ml-1.5 uppercase">
                IA Smart
              </span>
            </div>
          </div>

          {/* Desktop Only Navigation Rails */}
          <div className="hidden md:flex items-center gap-6">
            <button
              id="top-nav-assess"
              onClick={() => setActiveTab("assess")}
              className={`text-sm font-semibold transition-colors ${
                activeTab === "assess" ? "text-blue-400 font-bold" : "text-white/60 hover:text-white"
              }`}
            >
              Assess
            </button>
            <button
              id="top-nav-history"
              onClick={() => setActiveTab("history")}
              className={`text-sm font-semibold transition-colors ${
                activeTab === "history" ? "text-blue-400 font-bold" : "text-white/60 hover:text-white"
              }`}
            >
              History
            </button>
            <button
              id="top-nav-vehicles"
              onClick={() => setActiveTab("vehicles")}
              className={`text-sm font-semibold transition-colors ${
                activeTab === "vehicles" ? "text-blue-400 font-bold" : "text-white/60 hover:text-white"
              }`}
            >
              Vehicles
            </button>
            <button
              id="top-nav-profile"
              onClick={() => setActiveTab("profile")}
              className={`text-sm font-semibold transition-colors ${
                activeTab === "profile" ? "text-blue-400 font-bold" : "text-white/60 hover:text-white"
              }`}
            >
              Profile
            </button>
          </div>

          {/* Right utility buttons placeholder */}
          <div className="flex items-center gap-2">
          </div>
        </div>
      </header>

      {/* Main Container viewport */}
      <main className="flex-grow max-w-6xl w-full mx-auto px-4 py-6 md:py-8">
        
        {/* Render Tab Screens dynamically */}
        <div className="animate-in fade-in duration-200">
          {activeTab === "assess" && (
            <AssessTab
              key={inspectedReport ? inspectedReport.id : "assess-fresh"}
              vehicles={vehicles}
              selectedVehicleId={selectedVehicleId}
              onSelectVehicle={handleSelectVehicle}
              onSaveReportOnHistory={handleSaveReportOnHistory}
              goToVehiclesTab={() => setActiveTab("vehicles")}
              inspectedReport={inspectedReport}
            />
          )}

          {activeTab === "history" && (
            <HistoryTab
              reports={reports}
              onDeleteReport={handleDeleteReport}
              onViewReport={handleViewReportFromHistory}
            />
          )}

          {activeTab === "vehicles" && (
            <VehiclesTab
              vehicles={vehicles}
              selectedVehicleId={selectedVehicleId}
              onAddVehicle={handleAddVehicle}
              onDeleteVehicle={handleDeleteVehicle}
              onSelectVehicle={handleSelectVehicle}
            />
          )}

          {activeTab === "profile" && (
            <ProfileTab
              vehicles={vehicles}
              reports={reports}
            />
          )}
        </div>

      </main>

      {/* Unified footer note */}
      <footer className="w-full text-center px-4 py-6 text-white/40 text-xs border-t border-white/5 bg-black/10 mt-12 shrink-0">
        <div className="max-w-6xl mx-auto space-y-1">
          <p>Estimations are for guidance only. Final quotes provided by service centers.</p>
          <p>© {new Date().getFullYear()} CarFix Automotive Solutions. Todos os direitos reservados.</p>
        </div>
      </footer>

      {/* Bottom Tabs navigation drawer strictly displayed on mobile viewports */}
      <BottomNavBar activeTab={activeTab} onTabChange={setActiveTab} />
      
    </div>
  );
}
