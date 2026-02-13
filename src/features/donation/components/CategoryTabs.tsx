import { CauseType } from '../types';

interface CategoryTabsProps {
  activeTab: CauseType;
  onTabChange: (tab: CauseType) => void;
}

const categories: { value: CauseType; label: string; enabled: boolean }[] = [
  { value: 'MOTIVE', label: 'Motivos de donación', enabled: true },
  { value: 'PROJECT', label: 'Proyectos', enabled: false },
  { value: 'EVENT', label: 'Eventos', enabled: false },
];

export function CategoryTabs({ activeTab, onTabChange }: CategoryTabsProps) {
  const handleTabClick = (category: (typeof categories)[0]) => {
    if (!category.enabled) {
      return;
    }
    onTabChange(category.value);
  };

  return (
    <div className="mb-6 overflow-x-auto lg:overflow-x-visible scrollbar-hide">
      <div className="flex gap-2 min-w-max lg:min-w-0 lg:flex-wrap">
      {categories.map((category) => (
        <button
          key={category.value}
          onClick={() => handleTabClick(category)}
          disabled={!category.enabled}
          className={`
            whitespace-nowrap flex-shrink-0 px-5 py-2.5 rounded-[10px] font-medium text-sm transition-all duration-200 relative
            ${
              activeTab === category.value && category.enabled
                ? 'bg-[#4E5BFF] text-white shadow-md'
                : category.enabled
                ? 'bg-white text-[#6B7280] hover:bg-[#F6F7FB] hover:text-[#111827] border border-[#E5E7EB]'
                : 'bg-[#F6F7FB] text-[#9CA3AF] border border-[#E5E7EB] cursor-not-allowed opacity-60'
            }
          `}
        >
          {category.label}
          {!category.enabled && (
            <span className="ml-2 text-xs bg-[#E5E7EB] text-[#6B7280] px-2 py-0.5 rounded-full">
              Próximamente
            </span>
          )}
        </button>
      ))}
      </div>
    </div>
  );
}
