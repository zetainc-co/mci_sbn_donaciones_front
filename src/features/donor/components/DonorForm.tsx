import { useState } from 'react';
import { UserCircle, UserPlus, LogIn } from 'lucide-react';
import { DonorInfo } from '../types';
import { GuestForm } from './GuestForm';
import { RegisterForm } from './RegisterForm';
import { LoginForm } from './LoginForm';

interface DonorFormProps {
  onSubmit: (info: DonorInfo) => void;
}

type DonorTab = 'guest' | 'register' | 'login';

export function DonorForm({ onSubmit }: DonorFormProps) {
  const [activeTab, setActiveTab] = useState<DonorTab>('guest');

  const tabs = [
    {
      id: 'guest' as DonorTab,
      label: 'Invitado',
      icon: UserCircle,
      description: 'Donar sin crear cuenta',
    },
    {
      id: 'register' as DonorTab,
      label: 'Registrar usuario',
      icon: UserPlus,
      description: 'Crear cuenta nueva',
    },
    {
      id: 'login' as DonorTab,
      label: 'Iniciar sesión',
      icon: LogIn,
      description: 'Ya tengo cuenta',
    },
  ];

  return (
    <div>
      {/* Tabs */}
      <div className="grid grid-cols-3 gap-2 mb-8 p-1 bg-[#F6F7FB] rounded-[12px]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                py-3 px-2 sm:px-4 rounded-[10px] text-xs sm:text-sm font-medium transition-all duration-200
                ${
                  activeTab === tab.id
                    ? 'bg-white text-[#4E5BFF] shadow-[0px_2px_8px_rgba(78,91,255,0.15)]'
                    : 'bg-transparent text-[#6B7280] hover:text-[#111827]'
                }
              `}
            >
              <Icon className={`w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 ${activeTab === tab.id ? 'text-[#4E5BFF]' : 'text-[#9CA3AF]'}`} />
              <span className="block leading-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'guest' && <GuestForm onSubmit={onSubmit} />}
        {activeTab === 'register' && <RegisterForm onSubmit={onSubmit} />}
        {activeTab === 'login' && <LoginForm onSubmit={onSubmit} />}
      </div>
    </div>
  );
}