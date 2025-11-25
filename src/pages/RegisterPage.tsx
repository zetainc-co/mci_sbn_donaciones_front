import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, User } from 'lucide-react';
import { toast } from 'sonner';
import logoSabanaNorte from '@/shared/assets/db28b6f2afc4257aa2f0341a5d2855a92eaf3105.png';

export function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'El nombre es requerido';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'El correo es requerido';
    }
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Mock register
    toast.success('Cuenta creada exitosamente');
  };

  return (
    <div className="min-h-screen bg-[#F6F7FB] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-[12px] border border-[#E5E7EB] p-8 shadow-[0px_4px_12px_rgba(0,0,0,0.06)]">
          {/* Logo */}
          <div className="text-center mb-8">
            <img
              src={logoSabanaNorte}
              alt="Sabana Norte"
              className="h-12 w-auto mx-auto mb-4"
            />
            <h1 className="text-xl font-semibold text-[#111827]">Crear cuenta</h1>
            <p className="text-sm text-[#6B7280] mt-1">
              Regístrate para comenzar a donar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label
                htmlFor="fullName"
                className="text-sm font-medium text-[#374151] mb-2 block"
              >
                Nombre completo
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  id="fullName"
                  placeholder="Juan Pérez"
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  className={`w-full pl-12 pr-4 py-3 bg-white border rounded-[10px] text-sm text-[#111827] placeholder:text-[#D1D5DB] focus:outline-none focus:ring-2 focus:ring-[#4E5BFF]/20 transition-all duration-200 ${
                    errors.fullName
                      ? 'border-[#EF4444] focus:border-[#EF4444]'
                      : 'border-[#E5E7EB] focus:border-[#4E5BFF]'
                  }`}
                />
              </div>
              {errors.fullName && (
                <p className="mt-1.5 text-xs text-[#EF4444]">{errors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="text-sm font-medium text-[#374151] mb-2 block"
              >
                Correo electrónico
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
                    errors.email
                      ? 'border-[#EF4444] focus:border-[#EF4444]'
                      : 'border-[#E5E7EB] focus:border-[#4E5BFF]'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-[#EF4444]">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="text-sm font-medium text-[#374151] mb-2 block"
              >
                Contraseña
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
                    errors.password
                      ? 'border-[#EF4444] focus:border-[#EF4444]'
                      : 'border-[#E5E7EB] focus:border-[#4E5BFF]'
                  }`}
                />
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-[#EF4444]">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-[#374151] mb-2 block"
              >
                Confirmar contraseña
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
                    errors.confirmPassword
                      ? 'border-[#EF4444] focus:border-[#EF4444]'
                      : 'border-[#E5E7EB] focus:border-[#4E5BFF]'
                  }`}
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1.5 text-xs text-[#EF4444]">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-[#4E5BFF] hover:bg-[#3F46DB] text-white rounded-[10px] font-semibold transition-all duration-200 shadow-md hover:shadow-lg mt-6"
            >
              Crear cuenta
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-[#6B7280]">
              ¿Ya tienes cuenta?{' '}
              <Link
                to="/login"
                className="text-[#4E5BFF] hover:text-[#3F46DB] font-medium"
              >
                Inicia sesión
              </Link>
            </p>
          </div>

          {/* Back to Home */}
          <div className="mt-4 text-center">
            <Link to="/" className="text-sm text-[#6B7280] hover:text-[#111827]">
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
