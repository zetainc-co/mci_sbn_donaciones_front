import { useState } from 'react';
import { Mail, User, Phone, FileText, CreditCard, ChevronDown, MessageSquare, Lock } from 'lucide-react';
import { DonorInfo } from '../types';
import { toast } from 'sonner';

interface RegisterFormProps {
  onSubmit: (info: DonorInfo) => void;
}

const documentTypes = [
  { value: 'CC', label: 'Cédula de Ciudadanía' },
  { value: 'CE', label: 'Cédula de Extranjería' },
  { value: 'TI', label: 'Tarjeta de Identidad' },
  { value: 'PAS', label: 'Pasaporte' },
  { value: 'NIT', label: 'NIT' },
];

export function RegisterForm({ onSubmit }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    documentType: '',
    documentNumber: '',
    phone: '',
    prayerRequest: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'El nombre es requerido';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'El apellido es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El correo es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Correo inválido';
    }

    if (!formData.documentType) {
      newErrors.documentType = 'Selecciona un tipo de documento';
    }

    if (!formData.documentNumber.trim()) {
      newErrors.documentNumber = 'El número de documento es requerido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (!formData.prayerRequest.trim()) {
      newErrors.prayerRequest = 'El motivo de oración es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      // Simular registro de usuario
      toast.success('Usuario registrado correctamente', {
        description: 'Tu cuenta ha sido creada exitosamente',
      });
      
      const donorInfo: DonorInfo = {
        fullName: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        country: 'Colombia',
        acceptsTerms: true,
      };
      onSubmit(donorInfo);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* First Name and Last Name */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="text-sm font-medium text-[#374151] mb-2 block">
            Nombre completo <span className="text-[#EF4444]">*</span>
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
              <User className="w-5 h-5" />
            </div>
            <input
              type="text"
              id="firstName"
              placeholder="Juan"
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              className={`w-full pl-12 pr-4 py-3 bg-white border rounded-[10px] text-sm text-[#111827] placeholder:text-[#D1D5DB] focus:outline-none focus:ring-2 focus:ring-[#4E5BFF]/20 transition-all duration-200 ${
                errors.firstName ? 'border-[#EF4444] focus:border-[#EF4444]' : 'border-[#E5E7EB] focus:border-[#4E5BFF]'
              }`}
            />
          </div>
          {errors.firstName && <p className="mt-1.5 text-xs text-[#EF4444]">{errors.firstName}</p>}
        </div>

        <div>
          <label htmlFor="lastName" className="text-sm font-medium text-[#374151] mb-2 block">
            Apellido <span className="text-[#EF4444]">*</span>
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
              <User className="w-5 h-5" />
            </div>
            <input
              type="text"
              id="lastName"
              placeholder="Pérez"
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              className={`w-full pl-12 pr-4 py-3 bg-white border rounded-[10px] text-sm text-[#111827] placeholder:text-[#D1D5DB] focus:outline-none focus:ring-2 focus:ring-[#4E5BFF]/20 transition-all duration-200 ${
                errors.lastName ? 'border-[#EF4444] focus:border-[#EF4444]' : 'border-[#E5E7EB] focus:border-[#4E5BFF]'
              }`}
            />
          </div>
          {errors.lastName && <p className="mt-1.5 text-xs text-[#EF4444]">{errors.lastName}</p>}
        </div>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="text-sm font-medium text-[#374151] mb-2 block">
          Correo electrónico <span className="text-[#EF4444]">*</span>
        </label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
            <Mail className="w-5 h-5" />
          </div>
          <input
            type="email"
            id="email"
            placeholder="juan@ejemplo.com"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className={`w-full pl-12 pr-4 py-3 bg-white border rounded-[10px] text-sm text-[#111827] placeholder:text-[#D1D5DB] focus:outline-none focus:ring-2 focus:ring-[#4E5BFF]/20 transition-all duration-200 ${
              errors.email ? 'border-[#EF4444] focus:border-[#EF4444]' : 'border-[#E5E7EB] focus:border-[#4E5BFF]'
            }`}
          />
        </div>
        {errors.email && <p className="mt-1.5 text-xs text-[#EF4444]">{errors.email}</p>}
      </div>

      {/* Document Type and Number */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="documentType" className="text-sm font-medium text-[#374151] mb-2 block">
            Tipo de documento <span className="text-[#EF4444]">*</span>
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none">
              <FileText className="w-5 h-5" />
            </div>
            <select
              id="documentType"
              value={formData.documentType}
              onChange={(e) => handleChange('documentType', e.target.value)}
              className={`w-full appearance-none pl-12 pr-10 py-3 bg-white border rounded-[10px] text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#4E5BFF]/20 transition-all duration-200 ${
                errors.documentType ? 'border-[#EF4444] focus:border-[#EF4444] text-[#EF4444]' : 'border-[#E5E7EB] focus:border-[#4E5BFF] text-[#111827]'
              }`}
            >
              <option value="">Selecciona</option>
              {documentTypes.map((doc) => (
                <option key={doc.value} value={doc.value}>
                  {doc.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280] pointer-events-none" />
          </div>
          {errors.documentType && <p className="mt-1.5 text-xs text-[#EF4444]">{errors.documentType}</p>}
        </div>

        <div>
          <label htmlFor="documentNumber" className="text-sm font-medium text-[#374151] mb-2 block">
            Número de documento <span className="text-[#EF4444]">*</span>
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
              <CreditCard className="w-5 h-5" />
            </div>
            <input
              type="text"
              id="documentNumber"
              placeholder="123456789"
              value={formData.documentNumber}
              onChange={(e) => handleChange('documentNumber', e.target.value)}
              className={`w-full pl-12 pr-4 py-3 bg-white border rounded-[10px] text-sm text-[#111827] placeholder:text-[#D1D5DB] focus:outline-none focus:ring-2 focus:ring-[#4E5BFF]/20 transition-all duration-200 ${
                errors.documentNumber ? 'border-[#EF4444] focus:border-[#EF4444]' : 'border-[#E5E7EB] focus:border-[#4E5BFF]'
              }`}
            />
          </div>
          {errors.documentNumber && <p className="mt-1.5 text-xs text-[#EF4444]">{errors.documentNumber}</p>}
        </div>
      </div>

      {/* Phone (Optional) */}
      <div>
        <label htmlFor="phone" className="text-sm font-medium text-[#374151] mb-2 block">
          Teléfono <span className="text-[#9CA3AF] text-xs">(opcional)</span>
        </label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
            <Phone className="w-5 h-5" />
          </div>
          <input
            type="tel"
            id="phone"
            placeholder="+57 300 123 4567"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-[#E5E7EB] rounded-[10px] text-sm text-[#111827] placeholder:text-[#D1D5DB] focus:outline-none focus:ring-2 focus:ring-[#4E5BFF]/20 focus:border-[#4E5BFF] transition-all duration-200"
          />
        </div>
      </div>

      {/* Password and Confirm Password */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="password" className="text-sm font-medium text-[#374151] mb-2 block">
            Contraseña <span className="text-[#EF4444]">*</span>
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
              <Lock className="w-5 h-5" />
            </div>
            <input
              type="password"
              id="password"
              placeholder="Mínimo 6 caracteres"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              className={`w-full pl-12 pr-4 py-3 bg-white border rounded-[10px] text-sm text-[#111827] placeholder:text-[#D1D5DB] focus:outline-none focus:ring-2 focus:ring-[#4E5BFF]/20 transition-all duration-200 ${
                errors.password ? 'border-[#EF4444] focus:border-[#EF4444]' : 'border-[#E5E7EB] focus:border-[#4E5BFF]'
              }`}
            />
          </div>
          {errors.password && <p className="mt-1.5 text-xs text-[#EF4444]">{errors.password}</p>}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="text-sm font-medium text-[#374151] mb-2 block">
            Confirmar contraseña <span className="text-[#EF4444]">*</span>
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
              <Lock className="w-5 h-5" />
            </div>
            <input
              type="password"
              id="confirmPassword"
              placeholder="Repite tu contraseña"
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              className={`w-full pl-12 pr-4 py-3 bg-white border rounded-[10px] text-sm text-[#111827] placeholder:text-[#D1D5DB] focus:outline-none focus:ring-2 focus:ring-[#4E5BFF]/20 transition-all duration-200 ${
                errors.confirmPassword ? 'border-[#EF4444] focus:border-[#EF4444]' : 'border-[#E5E7EB] focus:border-[#4E5BFF]'
              }`}
            />
          </div>
          {errors.confirmPassword && <p className="mt-1.5 text-xs text-[#EF4444]">{errors.confirmPassword}</p>}
        </div>
      </div>

      {/* Prayer Request */}
      <div>
        <label htmlFor="prayerRequest" className="text-sm font-medium text-[#374151] mb-2 block">
          Motivo de oración o petición <span className="text-[#EF4444]">*</span>
        </label>
        <div className="relative">
          <div className="absolute left-4 top-4 text-[#9CA3AF]">
            <MessageSquare className="w-5 h-5" />
          </div>
          <textarea
            id="prayerRequest"
            placeholder="Comparte tu motivo de oración..."
            value={formData.prayerRequest}
            onChange={(e) => handleChange('prayerRequest', e.target.value)}
            rows={4}
            className={`w-full pl-12 pr-4 py-3 bg-white border rounded-[10px] text-sm text-[#111827] placeholder:text-[#D1D5DB] focus:outline-none focus:ring-2 focus:ring-[#4E5BFF]/20 transition-all duration-200 resize-none ${
              errors.prayerRequest ? 'border-[#EF4444] focus:border-[#EF4444]' : 'border-[#E5E7EB] focus:border-[#4E5BFF]'
            }`}
          />
        </div>
        {errors.prayerRequest && <p className="mt-1.5 text-xs text-[#EF4444]">{errors.prayerRequest}</p>}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full py-3.5 px-4 bg-[#4E5BFF] hover:bg-[#3F46DB] text-white rounded-[10px] font-semibold transition-all duration-200 shadow-md hover:shadow-lg mt-6"
      >
        Crear cuenta y continuar
      </button>
    </form>
  );
}