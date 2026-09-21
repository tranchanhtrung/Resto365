import React from 'react';
import { 
  LayoutDashboard, 
  Boxes, 
  UtensilsCrossed, 
  ReceiptText, 
  Users2, 
  Sparkles, 
  ChefHat, 
  ShieldCheck,
  TrendingDown,
  ChevronRight
} from 'lucide-react';
import { ActiveModule } from '../types';

interface SidebarProps {
  activeModule: ActiveModule;
  onChangeModule: (module: ActiveModule) => void;
  foodCostPct: number;
  wasteTotal: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onChangeModule,
  foodCostPct,
  wasteTotal,
}) => {
  const navItems = [
    {
      id: 'dashboard' as ActiveModule,
      label: 'Tổng Quan Điều Hành',
      sublabel: 'Executive KPI & Prime Cost',
      icon: LayoutDashboard,
      badge: '52.2%',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    },
    {
      id: 'inventory' as ActiveModule,
      label: 'Quản Lý Kho & Thất Thoát',
      sublabel: 'Inventory, AvT & Waste Log',
      icon: Boxes,
      badge: `${(wasteTotal / 1000000).toFixed(1)}M ₫`,
      badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    },
    {
      id: 'recipe_costing' as ActiveModule,
      label: 'Định Lượng & Thực Đơn',
      sublabel: 'Recipe Costing & Boston Box',
      icon: UtensilsCrossed,
      badge: `${foodCostPct.toFixed(1)}%`,
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    },
    {
      id: 'accounting' as ActiveModule,
      label: 'Kế Toán & Báo Cáo P&L',
      sublabel: 'COGS, AP & Net Profit',
      icon: ReceiptText,
      badge: 'MTD',
      badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    },
    {
      id: 'labor' as ActiveModule,
      label: 'Quản Lý Lao Động & Ca',
      sublabel: 'Shifts, SPLH & Overtime',
      icon: Users2,
      badge: '22.4%',
      badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    },
    {
      id: 'ai_auditor' as ActiveModule,
      label: 'Trợ Lý AI Kiểm Toán F&B',
      sublabel: 'Gemini Food Cost Intelligence',
      icon: Sparkles,
      badge: 'PRO',
      badgeColor: 'bg-gradient-to-r from-amber-400/20 to-orange-400/20 text-amber-300 border-amber-400/40',
    },
  ];

  return (
    <aside className="w-72 flex-shrink-0 flex flex-col border-r border-slate-800 bg-slate-950 p-4 justify-between h-[calc(100vh-57px)] sticky top-[57px] overflow-y-auto">
      <div>
        {/* Brand Header */}
        <div className="mb-6 flex items-center gap-3 px-2 py-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 font-black shadow-lg shadow-amber-500/20">
            <ChefHat className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-white">Resto<span className="text-amber-400">365</span></span>
              <span className="rounded bg-amber-400/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-400/30">
                CLOUD
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Enterprise Restaurant Platform</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1.5">
          <div className="px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Phân hệ tích hợp F&B
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => onChangeModule(item.id)}
                className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition-all ${
                  isActive
                    ? 'bg-amber-500/10 text-white border border-amber-500/30 shadow-sm'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`rounded-lg p-2 transition-colors ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 font-bold shadow'
                        : 'bg-slate-900 text-slate-400 group-hover:text-amber-400 group-hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className={`text-xs font-bold leading-none ${isActive ? 'text-amber-300' : 'text-slate-200'}`}>
                      {item.label}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-500 leading-tight">
                      {item.sublabel}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold border ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                  <ChevronRight className={`h-3 w-3 transition-transform ${isActive ? 'rotate-90 text-amber-400' : 'text-slate-600 opacity-0 group-hover:opacity-100'}`} />
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Summary Card */}
      <div className="mt-4 rounded-xl border border-slate-800/80 bg-slate-900/60 p-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            Kiểm soát chi phí:
          </span>
          <span className="font-bold text-slate-200">Chuẩn R365</span>
        </div>
        
        <div className="mt-2 space-y-1.5">
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-400">Food Cost thực tế:</span>
            <span className="font-bold text-amber-400">{foodCostPct.toFixed(1)}% (Target: 28%)</span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-amber-500 rounded-full transition-all"
              style={{ width: `${Math.min(100, (foodCostPct / 35) * 100)}%` }}
            />
          </div>
          
          <div className="flex justify-between text-[11px] pt-1">
            <span className="text-slate-400">Thất thoát kho ghi nhận:</span>
            <span className="font-bold text-rose-400">{wasteTotal.toLocaleString('vi-VN')} ₫</span>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
          <span>Server API: Connected</span>
          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Online
          </span>
        </div>
      </div>
    </aside>
  );
};
