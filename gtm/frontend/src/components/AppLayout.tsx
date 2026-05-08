import type { ReactNode } from 'react';
import type { UserRole } from '../types';
import { roleOptions } from '../data/mockData';

type AppLayoutProps = {
  activeRole: UserRole;
  navItems: string[];
  children: ReactNode;
  onRoleChange: (role: UserRole) => void;
};

export function AppLayout({ activeRole, navItems, children, onRoleChange }: AppLayoutProps) {
  return (
    <div className="grid min-h-screen grid-cols-1 xl:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="sticky top-0 z-10 flex flex-col gap-3.5 bg-[#17211f] px-[18px] py-3.5 text-[#f7faf8] xl:min-h-screen xl:gap-[26px] xl:p-[24px_18px]" aria-label="Navegacion principal">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[#f4c95d] text-[18px] font-extrabold text-[#17211f] xl:h-[50px] xl:w-[50px]">GTM</span>
          <div>
            <strong className="block text-[16px] leading-[1.2]">Taller Mecanico</strong>
            <span className="block text-[13px] text-[#b8c6c0]">Gestion de taller</span>
          </div>
        </div>

        <div className="grid gap-2">
          <span className="text-[13px] text-[#b8c6c0]">Cambiar vista</span>
          <div className="grid grid-cols-2 gap-2 xl:grid-cols-1">
            {roleOptions.map((option) => (
              <button
                className={`min-h-10 rounded-[7px] border px-2.5 py-2 text-left text-[13px] transition-colors ${
                  activeRole === option.role
                    ? 'border-[#f4c95d] bg-[#f4c95d] text-[#17211f]'
                    : 'border-white/10 bg-white/5 text-[#d9e3de] hover:bg-white/10'
                }`}
                key={option.role}
                onClick={() => onRoleChange(option.role)}
                type="button"
              >
                <strong className="block text-[13px] leading-tight">{option.role}</strong>
                <span className={activeRole === option.role ? 'text-[12px] text-[#3d3520]' : 'text-[12px] text-[#b8c6c0]'}>
                  {option.description}
                </span>
              </button>
            ))}
          </div>
        </div>

        <nav className="flex overflow-x-auto pb-0.5 xl:grid xl:gap-1.5">
          {navItems.map((item, index) => (
            <button
              className={`w-auto min-w-[104px] flex-none rounded-[7px] border-0 bg-transparent px-3 py-2.5 text-center text-[14px] text-[#d9e3de] transition-colors hover:bg-white/10 hover:text-white xl:min-h-[42px] xl:w-full xl:text-left ${
                index === 0 ? 'bg-white/10 text-white shadow-[inset_0_-4px_0_#f4c95d] xl:shadow-[inset_4px_0_0_#f4c95d]' : ''
              }`}
              key={item}
              type="button"
            >
              {item}
            </button>
          ))}
        </nav>

        <div className="mt-auto hidden rounded-lg border border-white/10 bg-white/5 p-3.5 xl:block">
          <span className="block text-[13px] text-[#b8c6c0]">Rol activo</span>
          <strong className="my-1 block text-[15px]">{activeRole}</strong>
          <small className="block text-[13px] text-[#b8c6c0]">Vista inicial por rol</small>
        </div>
      </aside>

      <main className="min-w-0 p-3.5 md:p-[18px] xl:p-7">{children}</main>
    </div>
  );
}
