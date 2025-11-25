import { Building2, User, ChevronDown } from 'lucide-react';
import { PSEData } from '../types';

interface PSEFormProps {
  onDataChange?: (data: PSEData) => void;
}

const colombianBanks = [
  { value: '', label: 'Selecciona tu banco' },
  { value: 'bancolombia', label: 'Bancolombia' },
  { value: 'banco_bogota', label: 'Banco de Bogotá' },
  { value: 'banco_popular', label: 'Banco Popular' },
  { value: 'bbva', label: 'BBVA Colombia' },
  { value: 'davivienda', label: 'Davivienda' },
  { value: 'banco_occidente', label: 'Banco de Occidente' },
  { value: 'banco_av_villas', label: 'Banco AV Villas' },
  { value: 'banco_caja_social', label: 'Banco Caja Social' },
  { value: 'citibank', label: 'Citibank' },
  { value: 'colpatria', label: 'Scotiabank Colpatria' },
  { value: 'banco_gnb_sudameris', label: 'Banco GNB Sudameris' },
  { value: 'banco_agrario', label: 'Banco Agrario' },
  { value: 'banco_cooperativo', label: 'Banco Cooperativo Coopcentral' },
  { value: 'banco_pichincha', label: 'Banco Pichincha' },
  { value: 'bancoomeva', label: 'Bancoomeva' },
  { value: 'banco_falabella', label: 'Banco Falabella' },
  { value: 'banco_finandina', label: 'Banco Finandina' },
  { value: 'nequi', label: 'Nequi' },
  { value: 'daviplata', label: 'DaviPlata' },
];

export function PSEForm({ onDataChange }: PSEFormProps) {
  const handleChange = (field: keyof PSEData, value: string) => {
    if (onDataChange) {
      onDataChange({ bank: '', documentType: '', documentNumber: '', [field]: value });
    }
  };

  return (
    <div className="mt-6 p-6 bg-[#F6F7FB] rounded-[12px] border border-[#E5E7EB] space-y-4">
      <div className="mb-2">
        <h3 className="text-sm font-semibold text-[#111827]">Datos para PSE</h3>
        <p className="text-xs text-[#6B7280] mt-1">
          Serás redirigido a tu banco para completar el pago
        </p>
      </div>

      {/* Person Type */}
      <div>
        <label className="text-sm font-medium text-[#374151] mb-3 block">
          Tipo de persona
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleChange('documentType', 'NATURAL')}
            className="group p-4 bg-white border-2 border-[#E5E7EB] hover:border-[#4E5BFF] rounded-[10px] transition-all duration-200 text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#F6F7FB] group-hover:bg-[#EEF0FF] flex items-center justify-center transition-colors duration-200">
                <User className="w-5 h-5 text-[#4E5BFF]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#111827]">Natural</p>
                <p className="text-xs text-[#6B7280]">Persona física</p>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleChange('documentType', 'JURIDICA')}
            className="group p-4 bg-white border-2 border-[#E5E7EB] hover:border-[#4E5BFF] rounded-[10px] transition-all duration-200 text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#F6F7FB] group-hover:bg-[#EEF0FF] flex items-center justify-center transition-colors duration-200">
                <Building2 className="w-5 h-5 text-[#4E5BFF]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#111827]">Jurídica</p>
                <p className="text-xs text-[#6B7280]">Empresa</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Bank Selector */}
      <div>
        <label
          htmlFor="bank"
          className="text-sm font-medium text-[#374151] mb-2 block"
        >
          Selecciona tu banco
        </label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none">
            <Building2 className="w-5 h-5" />
          </div>
          <select
            id="bank"
            className="w-full appearance-none pl-12 pr-10 py-3 bg-white border border-[#E5E7EB] rounded-[10px] text-sm text-[#111827] cursor-pointer hover:border-[#4E5BFF] focus:outline-none focus:ring-2 focus:ring-[#4E5BFF]/20 focus:border-[#4E5BFF] transition-all duration-200"
            onChange={(e) => handleChange('bank', e.target.value)}
            defaultValue=""
          >
            {colombianBanks.map((bank) => (
              <option key={bank.value} value={bank.value} disabled={bank.value === ''}>
                {bank.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280] pointer-events-none" />
        </div>
      </div>

      {/* Info Note */}
      <div className="flex items-start gap-2 mt-4 p-3 bg-white rounded-[8px] border border-[#E5E7EB]">
        <Building2 className="w-4 h-4 text-[#4E5BFF] mt-0.5 flex-shrink-0" />
        <p className="text-xs text-[#6B7280]">
          Serás redirigido al portal de tu banco para autorizar el pago de forma segura
        </p>
      </div>
    </div>
  );
}
