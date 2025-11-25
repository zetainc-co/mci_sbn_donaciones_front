import { useState } from 'react';
import { Mail, Lock, MessageSquare } from 'lucide-react';
import { DonorInfo } from '../types';
import { toast } from 'sonner';

interface LoginFormProps {
  onSubmit: (info: DonorInfo) => void;
}

export function LoginForm({ onSubmit }: LoginFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    prayerRequest: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'El correo es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Correo inválido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
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
      // Simular login exitoso
      toast.success('Inicio de sesión exitoso', {
        description: 'Bienvenido de nuevo',
      });
      
      // Simular datos de usuario autenticado
      const donorInfo: DonorInfo = {
        fullName: 'Usuario Demo',
        email: formData.email,
        phone: '+57 300 123 4567',
        country: 'Colombia',
        acceptsTerms: true,
      };
      onSubmit(donorInfo);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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

      {/* Password */}
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
            placeholder="Ingresa tu contraseña"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            className={`w-full pl-12 pr-4 py-3 bg-white border rounded-[10px] text-sm text-[#111827] placeholder:text-[#D1D5DB] focus:outline-none focus:ring-2 focus:ring-[#4E5BFF]/20 transition-all duration-200 ${
              errors.password ? 'border-[#EF4444] focus:border-[#EF4444]' : 'border-[#E5E7EB] focus:border-[#4E5BFF]'
            }`}
          />
        </div>
        {errors.password && <p className="mt-1.5 text-xs text-[#EF4444]">{errors.password}</p>}
      </div>

      {/* Forgot Password Link */}
      <div className="flex justify-end">
        <button
          type="button"
          className="text-sm text-[#4E5BFF] hover:text-[#3F46DB] font-medium transition-colors duration-200"
        >
          ¿Olvidaste tu contraseña?
        </button>
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
        Iniciar sesión y continuar
      </button>

      {/* Sign Up Link */}
      <div className="text-center pt-2">
        <p className="text-sm text-[#6B7280]">
          ¿No tienes cuenta?{' '}
          <button
            type="button"
            className="text-[#4E5BFF] hover:text-[#3F46DB] font-medium transition-colors duration-200"
          >
            Regístrate aquí
          </button>
        </p>
      </div>
    </form>
  );
}
