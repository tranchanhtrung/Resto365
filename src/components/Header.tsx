import React, { useState } from 'react';
import { 
  Building2, 
  Calendar, 
  Sparkles, 
  Plus, 
  Bell, 
  AlertTriangle, 
  DollarSign, 
  TrendingUp, 
  CheckCircle2,
  X
} from 'lucide-react';
import { RESTAURANT_LOCATIONS } from '../data/mockData';

interface HeaderProps {
  selectedLocation: string;
  onSelectLocation: (locId: string) => void;
  onOpenAIAssistant: (initialPrompt?: string) => void;
  onOpenQuickAction: (action: 'waste' | 'inventory_count' | 'recipe' | 'invoice') => void;
  wasteTotal: number;
}

export const Header: React.FC<HeaderProps> = ({
  selectedLocation,
  onSelectLocation,
  onOpenAIAssistant,
  onOpenQuickAction,
  wasteTotal,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickDropdown, setShowQuickDropdown] = useState(false);

  const notifications = [
    {
      id: 'notif-1',
      title: 'Hao hụt kiểm kê nghiêm trọng',
      desc: 'Thịt bò Wagyu A5 âm 1.6kg (-2.960.000₫) tại Kho Đông.',
      time: '15 phút trước',
      type: 'critical',
    },
    {
      id: 'notif-2',
      title: 'Biến động giá Nhà Cung Cấp',
      desc: 'Nông Sản Bio Đà Lạt tăng giá Rau Romaine +14.0%.',
      time: '2 giờ trước',
      type: 'warning',
    },
    {
      id: 'notif-3',
      title: 'Food Cost món Cá Hồi vượt ngưỡng',
      desc: 'Tỷ lệ cost đạt 33.2% (vượt mục tiêu 28.0%). Cần điều chỉnh.',
      time: 'Hôm nay',
      type: 'warning',
    },
  ];

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-6 py-3 backdrop-blur-md">
      {/* Location & Period Switcher */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-sm font-medium text-slate-200">
          <Building2 className="h-4 w-4 text-amber-400" />
          <select 
            value={selectedLocation} 
            onChange={(e) => onSelectLocation(e.target.value)}
            className="cursor-pointer bg-transparent pr-2 text-sm font-medium text-slate-100 outline-none hover:text-white"
          >
            {RESTAURANT_LOCATIONS.map((loc) => (
              <option key={loc.id} value={loc.id} className="bg-slate-900 text-slate-100">
                {loc.name}
              </option>
            ))}
          </select>
        </div>

        <div className="hidden sm:flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-800/40 px-3 py-1.5 text-xs text-slate-400">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          <span>Kỳ tài chính: <strong className="text-slate-200">Tháng 9/2026 (Tuần 3)</strong></span>
        </div>

        {/* Live Prime Cost Quick Tag */}
        <div className="hidden lg:flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
          <TrendingUp className="h-3.5 w-3.5" />
          <span>Prime Cost: 52.2% (Chuẩn vàng &lt; 55%)</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* AI Auditor Button */}
        <button
          id="btn-header-ai-auditor"
          onClick={() => onOpenAIAssistant('Kiểm toán toàn diện tỷ lệ Food Cost tuần này và đưa ra phương án xử lý thất thoát.')}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-3.5 py-1.5 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 transition-all hover:brightness-110 active:scale-95"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Kiểm Toán AI (Resto365)</span>
          <span className="sm:hidden">AI Audit</span>
        </button>

        {/* Quick Action Dropdown */}
        <div className="relative">
          <button
            id="btn-header-quick-action"
            onClick={() => setShowQuickDropdown(!showQuickDropdown)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 active:scale-95"
          >
            <Plus className="h-4 w-4 text-amber-400" />
            <span className="hidden md:inline">Thao Tác Nhanh</span>
          </button>

          {showQuickDropdown && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-700 bg-slate-900 p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-2 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Tạo chứng từ F&B
              </div>
              <button
                onClick={() => {
                  setShowQuickDropdown(false);
                  onOpenQuickAction('waste');
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs text-rose-300 hover:bg-rose-950/40 hover:text-rose-200"
              >
                <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
                <span>Ghi nhận hủy món / Hỏng kho</span>
              </button>
              <button
                onClick={() => {
                  setShowQuickDropdown(false);
                  onOpenQuickAction('inventory_count');
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs text-slate-200 hover:bg-slate-800"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-amber-400" />
                <span>Kiểm kê kho thực tế (AvT)</span>
              </button>
              <button
                onClick={() => {
                  setShowQuickDropdown(false);
                  onOpenQuickAction('recipe');
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs text-slate-200 hover:bg-slate-800"
              >
                <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
                <span>Thêm công thức định lượng</span>
              </button>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            id="btn-header-notifications"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-lg border border-slate-700 bg-slate-800 p-2 text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
              3
            </span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-700 bg-slate-900 p-3 shadow-2xl z-50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                  Cảnh báo vận hành F&B
                </h4>
                <button 
                  onClick={() => setShowNotifications(false)}
                  className="text-slate-400 hover:text-slate-200"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="mt-2 space-y-2">
                {notifications.map((n) => (
                  <div 
                    key={n.id}
                    className="rounded-lg border border-slate-800 bg-slate-800/60 p-2.5 hover:border-slate-700"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-rose-300">{n.title}</span>
                      <span className="text-[10px] text-slate-500">{n.time}</span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">{n.desc}</p>
                  </div>
                ))}
              </div>

              <div className="mt-2 pt-2 border-t border-slate-800 flex justify-between items-center text-[11px]">
                <span className="text-slate-400">Tổng thất thoát tuần:</span>
                <span className="font-bold text-rose-400">
                  {wasteTotal.toLocaleString('vi-VN')} ₫
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
