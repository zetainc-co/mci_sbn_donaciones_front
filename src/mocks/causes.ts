import { Cause } from '@/features/donation/types';

export const causes: Cause[] = [
  // Motivos
  {
    id: 'm1',
    type: 'MOTIVE',
    name: 'Diezmo',
    description: 'Fidelidad y obediencia',
    presets: [20000, 50000, 100000, 200000],
    presetsUSD: [5, 15, 25, 50],
  },
  {
    id: 'm2',
    type: 'MOTIVE',
    name: 'Ofrenda',
    description: 'Expresión de gratitud',
    presets: [10000, 20000, 40000],
    presetsUSD: [3, 5, 10],
  },
  {
    id: 'm3',
    type: 'MOTIVE',
    name: 'Primicia',
    description: 'Lo primero para Dios',
    presets: [50000, 100000, 200000],
    presetsUSD: [15, 25, 50],
  },
  {
    id: 'm4',
    type: 'MOTIVE',
    name: 'Pacto',
    description: 'Siembra con propósito',
    presets: [100000, 300000, 500000],
    presetsUSD: [25, 75, 125],
  },
  // Proyectos
  {
    id: 'p1',
    type: 'PROJECT',
    name: 'Construcción sede',
    description: 'Apoyo para el nuevo templo',
    fixedAmount: 100000,
  },
  {
    id: 'p2',
    type: 'PROJECT',
    name: 'Misión urbana',
    description: 'Alcance en comunidades vulnerables',
    fixedAmount: 50000,
  },
  // Eventos
  {
    id: 'e1',
    type: 'EVENT',
    name: 'Conferencia Jóvenes 2025',
    description: 'Inscripción al evento anual',
    fixedAmount: 30000,
    allowQuantity: true,
  },
  {
    id: 'e2',
    type: 'EVENT',
    name: 'Retiro familiar',
    description: 'Fin de semana de restauración',
    fixedAmount: 200000,
    allowQuantity: false,
  },
];
