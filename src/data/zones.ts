// public/zones.ts
export interface Zone {
  name: string
  fee: number
}

export const zones: Zone[] = [
  // Accra zones
  { name: "Accra Central", fee: 15 },
  { name: "Osu", fee: 15 },
  { name: "East Legon", fee: 10 },
  { name: "Airport Residential Area", fee: 20 },
  { name: "Cantonments", fee: 20 },
  { name: "Labone", fee: 18 },
  { name: "West Legon", fee: 25 },
  { name: "Dansoman", fee: 22 },
  { name: "Tema – Community 1", fee: 25 },
  { name: "Tema – Community 2", fee: 25 },
  { name: "Tema – Community 3", fee: 25 },
  { name: "Tema – Community 4", fee: 25 },
  { name: "Tema – Community 5", fee: 25 },
  { name: "Tema – Community 6", fee: 25 },
  { name: "Tema – Community 7", fee: 25 },
  { name: "Tema – Community 8", fee: 25 },
  { name: "Tema – Community 9", fee: 25 },
  { name: "Tema – Community 10", fee: 25 },

  // Kumasi zones
  { name: "Kumasi – Adum", fee: 40 },
  { name: "Kumasi – Asokwa", fee: 40 },
  { name: "Kumasi – Bantama", fee: 40 },
  { name: "Kumasi – Patasi", fee: 40 },
  { name: "Kumasi – Manhyia", fee: 40 },
  { name: "Kumasi – Suame", fee: 40 },

  // Other major cities
  { name: "Takoradi – Harbour", fee: 45 },
  { name: "Takoradi – Effiakuma", fee: 45 },
  { name: "Takoradi – Anaji", fee: 45 },
  { name: "Cape Coast – Central", fee: 50 },
  { name: "Cape Coast – Abura", fee: 50 },
  { name: "Tamale – Central", fee: 55 },
  { name: "Tamale – Kalpohin", fee: 55 },
  { name: "Tamale – Lamashegu", fee: 55 },

  // Fallback for other cities not listed
  { name: "Other / Not Listed", fee: 20 }
]
