import { useEffect, useState } from 'react';
import { Building2, User, FileText, CreditCard, ChevronDown } from 'lucide-react';
import { PSEData, PersonType, DocumentType } from '../types';
import { usePaymentStore } from '../store';

const documentTypes = [
  { value: 'CC', label: 'Cédula de Ciudadanía' },
  { value: 'CE', label: 'Cédula de Extranjería' },
  { value: 'TI', label: 'Tarjeta de Identidad' },
  { value: 'PAS', label: 'Pasaporte' },
  { value: 'NIT', label: 'NIT' },
];

export function PSEForm() {
  const { pseBanks, pseBanksLoading, loadPSEBanks, setPSEData } = usePaymentStore();

  const [formData, setFormData] = useState<PSEData>({
    bankCode: '',
    personType: 'NATURAL',
    documentType: 'CC',
    documentNumber: '',
  });

  // Load banks on mount
  useEffect(() => {
    loadPSEBanks();
  }, [loadPSEBanks]);

  // Update store when form data changes
  useEffect(() => {
    if (formData.bankCode && formData.documentNumber) {
      setPSEData(formData);
    }
  }, [formData, setPSEData]);

  const handleChange = <K extends keyof PSEData>(field: K, value: PSEData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
          Tipo de persona <span className="text-[#EF4444]">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleChange('personType', 'NATURAL')}
            className={`group p-4 bg-white border-2 rounded-[10px] transition-all duration-200 text-left ${
              formData.personType === 'NATURAL'
                ? 'border-[#4E5BFF] bg-[#EEF0FF]'
                : 'border-[#E5E7EB] hover:border-[#4E5BFF]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200 ${
                formData.personType === 'NATURAL' ? 'bg-[#4E5BFF]' : 'bg-[#F6F7FB] group-hover:bg-[#EEF0FF]'
              }`}>
                <User className={`w-5 h-5 ${formData.personType === 'NATURAL' ? 'text-white' : 'text-[#4E5BFF]'}`} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#111827]">Natural</p>
                <p className="text-xs text-[#6B7280]">Persona física</p>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleChange('personType', 'JURIDICA')}
            className={`group p-4 bg-white border-2 rounded-[10px] transition-all duration-200 text-left ${
              formData.personType === 'JURIDICA'
                ? 'border-[#4E5BFF] bg-[#EEF0FF]'
                : 'border-[#E5E7EB] hover:border-[#4E5BFF]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200 ${
                formData.personType === 'JURIDICA' ? 'bg-[#4E5BFF]' : 'bg-[#F6F7FB] group-hover:bg-[#EEF0FF]'
              }`}>
                <Building2 className={`w-5 h-5 ${formData.personType === 'JURIDICA' ? 'text-white' : 'text-[#4E5BFF]'}`} />
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
          Selecciona tu banco <span className="text-[#EF4444]">*</span>
        </label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none">
            <Building2 className="w-5 h-5" />
          </div>
          <select
            id="bank"
            value={formData.bankCode}
            onChange={(e) => handleChange('bankCode', e.target.value)}
            disabled={pseBanksLoading}
            className="w-full appearance-none pl-12 pr-10 py-3 bg-white border border-[#E5E7EB] rounded-[10px] text-sm text-[#111827] cursor-pointer hover:border-[#4E5BFF] focus:outline-none focus:ring-2 focus:ring-[#4E5BFF]/20 focus:border-[#4E5BFF] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">
              {pseBanksLoading ? 'Cargando bancos...' : 'Selecciona tu banco'}
            </option>
            {pseBanks.map((bank, index) => (
              <option key={`${bank.code}-${index}`} value={bank.code}>
                {bank.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280] pointer-events-none" />
        </div>
      </div>

      {/* Document Type and Number */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="pseDocumentType"
            className="text-sm font-medium text-[#374151] mb-2 block"
          >
            Tipo de documento <span className="text-[#EF4444]">*</span>
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none">
              <FileText className="w-5 h-5" />
            </div>
            <select
              id="pseDocumentType"
              value={formData.documentType}
              onChange={(e) => handleChange('documentType', e.target.value as DocumentType)}
              className="w-full appearance-none pl-12 pr-10 py-3 bg-white border border-[#E5E7EB] rounded-[10px] text-sm text-[#111827] cursor-pointer hover:border-[#4E5BFF] focus:outline-none focus:ring-2 focus:ring-[#4E5BFF]/20 focus:border-[#4E5BFF] transition-all duration-200"
            >
              {documentTypes.map((doc) => (
                <option key={doc.value} value={doc.value}>
                  {doc.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280] pointer-events-none" />
          </div>
        </div>

        <div>
          <label
            htmlFor="pseDocumentNumber"
            className="text-sm font-medium text-[#374151] mb-2 block"
          >
            Número de documento <span className="text-[#EF4444]">*</span>
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
              <CreditCard className="w-5 h-5" />
            </div>
            <input
              type="text"
              id="pseDocumentNumber"
              placeholder="123456789"
              value={formData.documentNumber}
              onChange={(e) => handleChange('documentNumber', e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-[#E5E7EB] rounded-[10px] text-sm text-[#111827] placeholder:text-[#D1D5DB] focus:outline-none focus:ring-2 focus:ring-[#4E5BFF]/20 focus:border-[#4E5BFF] transition-all duration-200"
            />
          </div>
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
