import React from "react";
import { History, Trash, Eye, ShieldAlert, Calendar, DollarSign, ArrowRight } from "lucide-react";
import { DamageReport } from "../types";

interface HistoryTabProps {
  reports: DamageReport[];
  onDeleteReport: (id: string) => void;
  onViewReport: (report: DamageReport) => void;
}

export default function HistoryTab({ reports, onDeleteReport, onViewReport }: HistoryTabProps) {
  const getBadgeColor = (level: "Baixo" | "Médio" | "Alto") => {
    switch (level) {
      case "Baixo":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-400/20";
      case "Médio":
        return "bg-amber-500/20 text-amber-300 border-amber-400/20";
      case "Alto":
        return "bg-red-500/20 text-red-300 border-red-500/20";
      default:
        return "bg-white/10 text-white border-white/20";
    }
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(value);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white" id="history-title">
            Histórico de Solicitados
          </h2>
          <p className="text-sm text-white/60">
            Acompanhe estimativas anteriores baseadas nas fotos enviadas.
          </p>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-12 text-center shadow-2xl max-w-lg mx-auto mt-6">
          <div className="w-16 h-16 bg-blue-500/15 text-blue-300 border border-blue-400/25 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
            <History size={32} />
          </div>
          <h3 className="font-bold text-white text-lg mb-1">Nenhum Relatório Arquivado</h3>
          <p className="text-sm text-white/60 max-w-sm mx-auto mb-6">
            Você ainda não realizou nenhuma simulação de sinistro ou orçamento com nossa Inteligência Artificial.
          </p>
          <p className="text-xs text-blue-300/80 font-semibold uppercase tracking-wider">
            Vá na aba "Assess" e faça seu primeiro escaneamento em segundos!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              id={`history-report-card-${report.id}`}
              className="bg-white/5 backdrop-blur-xl rounded-xl p-5 border border-white/10 shadow-2xl hover:shadow-3xl hover:bg-white/10 hover:border-white/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-12 rounded-lg overflow-hidden shrink-0 bg-white/5 border border-white/15">
                  <img
                    src={report.photoUrl}
                    alt={report.vehicleModel}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-bold text-white text-base">{report.vehicleModel}</h4>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${getBadgeColor(
                        report.damageLevel
                      )}`}
                    >
                      {report.damageLevel === "Baixo"
                        ? "Arranhão (Baixo)"
                        : report.damageLevel === "Alto"
                        ? "Batida (Alto)"
                        : "Amassado (Médio)"}
                    </span>
                    {report.isSimulated && (
                      <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/20 px-1.5 py-0.2 rounded font-semibold">
                        Simulação
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-white/70">
                    {report.vehicleDetails}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-white/50">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} /> {report.date}
                    </span>
                    <span>•</span>
                    <span className="font-bold text-blue-300">
                      {report.damages.length} avaria(s) detectada(s)
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-white/10">
                <div className="text-left md:text-right">
                  <span className="text-xs text-white/40 uppercase tracking-wider font-semibold block">Estimativa</span>
                  <span className="text-lg font-bold text-blue-300 font-mono">
                    {formatPrice(report.estimatedValue)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    id={`btn-view-${report.id}`}
                    onClick={() => onViewReport(report)}
                    className="flex items-center gap-1.5 border border-white/15 hover:border-white/30 bg-white/5 hover:bg-white/10 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-md transition-all active:scale-95"
                  >
                    <Eye size={14} /> Detalhes
                  </button>
                  <button
                    id={`btn-delete-${report.id}`}
                    onClick={() => onDeleteReport(report.id)}
                    className="text-white/40 hover:text-rose-400 p-2 hover:bg-rose-500/15 rounded-lg transition-colors active:scale-95"
                    title="Excluir do histórico"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
