import React from "react";
import { Camera, History, Car, User } from "lucide-react";

interface BottomNavBarProps {
  activeTab: "assess" | "history" | "vehicles" | "profile";
  onTabChange: (tab: "assess" | "history" | "vehicles" | "profile") => void;
}

export default function BottomNavBar({ activeTab, onTabChange }: BottomNavBarProps) {
  const tabs = [
    { id: "assess", label: "Assess", icon: Camera },
    { id: "history", label: "History", icon: History },
    { id: "vehicles", label: "Vehicles", icon: Car },
    { id: "profile", label: "Profile", icon: User },
  ] as const;

  const simulateHaptic = () => {
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(10);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-3 pb-safe bg-white/10 backdrop-blur-xl border-t border-white/15 shadow-2xl rounded-t-2xl md:hidden">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            id={`nav-tab-${tab.id}`}
            onClick={() => {
              simulateHaptic();
              onTabChange(tab.id);
            }}
            className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-full transition-all duration-200 active:scale-90 ${
              isActive
                ? "bg-white/15 text-blue-300 font-bold border border-white/10"
                : "text-white/50 hover:text-white hover:bg-white/5"
            }`}
          >
            <Icon size={20} className={isActive ? "stroke-[2.5px]" : "stroke-[1.8px]"} />
            <span className="text-[11px] mt-0.5 tracking-tight">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
