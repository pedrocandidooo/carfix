export interface Vehicle {
  id: string;
  model: string;
  plate: string;
  color: string;
  year?: string;
}

export interface DamageReport {
  id: string;
  vehicleId?: string;
  date: string;
  estimatedValue: number;
  damageLevel: "Baixo" | "Médio" | "Alto";
  damagePercentage: number;
  damages: string[];
  vehicleModel: string;
  vehicleDetails: string;
  tips: string[];
  photoUrl: string;
  isSimulated?: boolean;
}

export interface Workshop {
  name: string;
  address: string;
  distance: string;
  rating: number;
  phone: string;
  specialties: string[];
}
