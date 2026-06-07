import React, { useState } from "react";
import { Car, Plus, Trash, Check, X, AlertOctagon } from "lucide-react";
import { Vehicle } from "../types";

interface VehiclesTabProps {
  vehicles: Vehicle[];
  onAddVehicle: (vehicle: Omit<Vehicle, "id">) => void;
  onDeleteVehicle: (id: string) => void;
  selectedVehicleId: string | null;
  onSelectVehicle: (id: string) => void;
}

export default function VehiclesTab({
  vehicles,
  onAddVehicle,
  onDeleteVehicle,
  selectedVehicleId,
  onSelectVehicle,
}: VehiclesTabProps) {
  const [showModal, setShowModal] = useState(false);
  const [model, setModel] = useState("");
  const [plate, setPlate] = useState("");
  const [color, setColor] = useState("");
  const [year, setYear] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!model.trim() || !plate.trim() || !color.trim()) {
      setErrorMsg("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    // Plate rough validation (standard Brazilian AAA-1234 or MercoSul Mercosul AAA1A23 formats)
    const normalizedPlate = plate.toUpperCase().trim();
    if (normalizedPlate.length < 7 || normalizedPlate.length > 8) {
      setErrorMsg("Gramática de placa inválida. Insira formato ABC-1234 ou ABC1D23.");
      return;
    }

    onAddVehicle({
      model: model.trim(),
      plate: normalizedPlate,
      color: color.trim(),
      year: year.trim() || undefined,
    });

    // Reset Form
    setModel("");
    setPlate("");
    setColor("");
    setYear("");
    setErrorMsg("");
    setShowModal(false);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white" id="vehicles-title">
            Meus Veículos
          </h2>
          <p className="text-sm text-white/60">
            Selecione ou adicione veículos para gerar orçamentos específicos.
          </p>
        </div>
        <button
          id="btn-add-vehicle-top"
          onClick={() => setShowModal(true)}
          className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-lg active:scale-95 border border-white/10"
        >
          <Plus size={16} /> Adicionar Veículo
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {vehicles.map((v) => {
          const isSelected = selectedVehicleId === v.id;
          return (
            <div
              key={v.id}
              id={`vehicle-card-${v.id}`}
              onClick={() => onSelectVehicle(v.id)}
              className={`relative bg-white/5 rounded-xl p-5 shadow-2xl border cursor-pointer backdrop-blur-xl transition-all ${
                isSelected
                  ? "border-2 border-blue-400 bg-white/10 ring-1 ring-blue-400/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]"
                  : "border-white/10 hover:border-white/20 hover:bg-white/10"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
                    isSelected ? "bg-blue-500/20 text-blue-300" : "bg-white/5 text-white/50"
                  }`}
                >
                  <Car size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white text-base">{v.model}</h4>
                    {isSelected && (
                      <span className="flex items-center gap-1 bg-blue-500/20 text-blue-300 text-xs px-2.5 py-0.5 rounded-full font-bold border border-blue-400/20">
                        <Check size={12} className="stroke-[3px]" /> Ativo
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-white/70 mt-1">
                    Placa: <span className="font-bold text-white">{v.plate}</span>
                  </p>
                  <p className="text-xs text-white/50 mt-0.5">
                    Cor: {v.color} {v.year ? `• Ano: ${v.year}` : ""}
                  </p>
                </div>
              </div>

              {vehicles.length > 1 && (
                <button
                  id={`btn-delete-vehicle-${v.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteVehicle(v.id);
                  }}
                  className="absolute bottom-4 right-4 text-white/40 hover:text-rose-450 p-1.5 rounded-md hover:bg-rose-500/15 transition-colors"
                  title="Remover veículo"
                >
                  <Trash size={15} />
                </button>
              )}
            </div>
          );
        })}

        {/* Add vehicle Card placeholder */}
        <button
          id="btn-add-vehicle-placeholder"
          onClick={() => setShowModal(true)}
          className="rounded-xl p-5 border border-dashed border-white/20 bg-white/5 flex flex-col items-center justify-center gap-2 text-white/60 hover:text-white hover:border-white/40 hover:bg-white/10 transition-all cursor-pointer h-full min-h-[120px]"
        >
          <Plus size={24} />
          <span className="font-bold text-sm">Adicionar Veículo</span>
        </button>
      </div>

      {/* Trigger alert if list empty */}
      {vehicles.length === 0 && (
        <div className="bg-amber-500/10 border border-amber-400/20 rounded-lg p-4 mt-4 flex items-start gap-3 backdrop-blur-md">
          <AlertOctagon className="text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h5 className="font-bold text-amber-300">Nenhum Veículo Cadastrado</h5>
            <p className="text-sm text-white/70 mt-0.5">
              Por favor, clique acima ou no painel de adições para cadastrar seu primeiro carro e simular diagnósticos precisos.
            </p>
          </div>
        </div>
      )}

      {/* Add Vehicle Modal Backdrop */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0f172a]/95 backdrop-blur-2xl border border-white/15 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h3 className="font-bold text-white text-lg">Adicionar Novo Veículo</h3>
              <button
                id="btn-close-modal"
                onClick={() => {
                  setShowModal(false);
                  setErrorMsg("");
                }}
                className="text-white/60 hover:text-white p-1 rounded-full hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="bg-red-500/15 text-rose-300 text-sm p-3 rounded-lg flex items-center gap-2 border border-red-500/30">
                  <AlertOctagon size={16} className="shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-white/80 mb-1">
                  Modelo do Carro *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Toyota Corolla, Hyundai HB20"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 focus:border-blue-400 rounded-lg focus:outline-none text-white text-sm placeholder:text-white/30 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-white/80 mb-1">
                    Placa (Brasil) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={8}
                    placeholder="Ex: ABC-1234"
                    value={plate}
                    onChange={(e) => setPlate(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 focus:border-blue-400 rounded-lg focus:outline-none text-white text-sm placeholder:text-white/30 font-medium uppercase"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-white/80 mb-1">
                    Cor *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Prata Metálico"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 focus:border-blue-400 rounded-lg focus:outline-none text-white text-sm placeholder:text-white/30 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-white/80 mb-1">
                  Ano de Fabricação (Opcional)
                </label>
                <input
                  type="number"
                  min={1970}
                  max={2027}
                  placeholder="Ex: 2022"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 focus:border-blue-400 rounded-lg focus:outline-none text-white text-sm placeholder:text-white/30 font-medium"
                />
              </div>

              <div className="pt-4 border-t border-white/10 flex gap-3 justify-end">
                <button
                  type="button"
                  id="btn-cancel-modal"
                  onClick={() => {
                    setShowModal(false);
                    setErrorMsg("");
                  }}
                  className="px-4 py-2 text-sm font-bold text-white bg-white/10 hover:bg-white/15 rounded-lg border border-white/10 transition-colors active:scale-95"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  id="btn-submit-modal"
                  className="px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border border-white/15 rounded-lg shadow-lg"
                >
                  Salvar Veículo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
