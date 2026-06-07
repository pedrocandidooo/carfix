import React from "react";
import { User, ShieldCheck, Mail, ClipboardList, Info, HelpCircle, HardDriveDownload } from "lucide-react";
import { Vehicle, DamageReport } from "../types";

interface ProfileTabProps {
  vehicles: Vehicle[];
  reports: DamageReport[];
  developerEmail?: string;
}

export default function ProfileTab({ vehicles, reports, developerEmail = "candidooopedro@gmail.com" }: ProfileTabProps) {
  // Compute analytics
  const totalEstimates = reports.reduce((acc, r) => acc + r.estimatedValue, 0);
  const averageEstimate = reports.length > 0 ? Math.round(totalEstimates / reports.length) : 0;

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(value);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* User info Header card */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl flex flex-col sm:flex-row items-center gap-4">
        <div className="w-16 h-16 bg-blue-500/20 text-blue-300 rounded-full flex items-center justify-center font-bold text-2xl border-2 border-white/10 shadow-[0_0_15px_rgba(59,130,246,0.15)] shrink-0">
          U
        </div>
        <div className="text-center sm:text-left space-y-1">
          <h3 className="font-bold text-white text-xl">Usuário CarFix</h3>
          <p className="text-sm text-white/60 flex items-center justify-center sm:justify-start gap-1">
            <Mail size={14} /> {developerEmail}
          </p>
          <div className="flex items-center gap-1.5 justify-center sm:justify-start text-xs bg-emerald-500/20 text-emerald-300 font-bold px-2.5 py-0.5 rounded-full border border-emerald-400/20 w-fit">
            <ShieldCheck size={12} /> Perfil Identificado
          </div>
        </div>
      </div>

      {/* Metrics bento-style cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white/5 backdrop-blur-xl p-5 rounded-xl border border-white/10 shadow-2xl text-center">
          <span className="text-xs text-white/40 font-bold uppercase tracking-wider">Veículos</span>
          <p className="text-3xl font-black text-white mt-1">{vehicles.length}</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl p-5 rounded-xl border border-white/10 shadow-2xl text-center">
          <span className="text-xs text-white/40 font-bold uppercase tracking-wider">Relatórios</span>
          <p className="text-3xl font-black text-white mt-1">{reports.length}</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl p-5 rounded-xl border border-white/10 col-span-2 sm:col-span-1 shadow-2xl text-center">
          <span className="text-xs text-white/40 font-bold uppercase tracking-wider">Média de Danos</span>
          <p className="text-xl font-bold text-blue-300 mt-2 font-mono">{formatPrice(averageEstimate)}</p>
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl overflow-hidden">
        <div className="p-4 bg-white/5 border-b border-white/10 flex items-center gap-2">
          <HelpCircle size={18} className="text-blue-400" />
          <h4 className="font-bold text-white">Perguntas Frequentes (FAQ)</h4>
        </div>
        <div className="p-5 divide-y divide-white/10 space-y-4">
          <div className="bg-white/5 p-4 rounded-lg border border-white/5">
            <h5 className="font-bold text-white text-sm mb-1">Como a IA da CarFix funciona?</h5>
            <p className="text-xs text-white/70 leading-relaxed">
              Nosso sistema utiliza algoritmos avançados do modelo **Gemini** para identificar deformidades estruturais em parachoques, capôs, faróis quebrados e marcas de abrasivos profundos e rasos nas chapas metálicas, estimando um valor baseado no banco de preços nacional.
            </p>
          </div>

          <div className="pt-4">
            <h5 className="font-bold text-white text-sm mb-1">Este orçamento tem valor contratual ou jurídico?</h5>
            <p className="text-xs text-white/70 leading-relaxed">
              **Não.** O valor de face retornado pela IA deve ser considerado apenas como uma estimativa preliminar. O laudo real e vinculativo é exclusivamente provido presencialmente pelas oficinas mecânicas e prestadores de serviços de funilaria.
            </p>
          </div>

          <div className="pt-4">
            <h5 className="font-bold text-white text-sm mb-1">Onde posso consertar meu carro?</h5>
            <p className="text-xs text-white/70 leading-relaxed">
              Conectamos você com oficinas credenciadas próximas. Vá no relatório detalhado de seu sinistro e clique no botão **"Ver Oficinas Próximas"** para buscar redes qualificadas em qualquer lugar do Brasil.
            </p>
          </div>
        </div>
      </div>

      {/* Legal terms footer caution note */}
      <div className="bg-blue-500/10 text-blue-300 rounded-xl p-4 border border-blue-400/20 flex gap-3 text-xs leading-relaxed backdrop-blur-md">
        <Info className="shrink-0 text-blue-400 mt-0.5" size={16} />
        <div>
          <span className="font-bold text-white">Termos de Uso CarFix:</span> Todas as estimativas visuais geradas por IA são aproximadas. Caso detecte danos de direção críticos, acione uma seguradora imediatamente ou guincho certificado. Não opere veículos com faróis principais apagados ou freios sob dúvida de integridade estanque.
        </div>
      </div>
    </div>
  );
}
