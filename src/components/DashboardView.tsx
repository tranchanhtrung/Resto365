import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Sparkles, 
  UtensilsCrossed, 
  Boxes, 
  DollarSign, 
  Users2, 
  ArrowUpRight, 
  ShieldAlert, 
  CheckCircle, 
  Clock,
  ChevronRight,
  Flame,
  Scale
} from 'lucide-react';
import { 
  RestaurantPL, 
  Recipe, 
  WasteRecord, 
  PhysicalCountSession, 
  Ingredient 
} from '../types';

interface DashboardViewProps {
  plData: RestaurantPL;
  recipes: Recipe[];
  wasteRecords: WasteRecord[];
  physicalCounts: PhysicalCountSession[];
  ingredients: Ingredient[];
  onNavigate: (module: any) => void;
  onOpenAIAssistant: (prompt?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  plData,
  recipes,
  wasteRecords,
  physicalCounts,
  ingredients,
  onNavigate,
  onOpenAIAssistant,
}) => {
  const totalWasteAmount = wasteRecords.reduce((acc, curr) => acc + curr.totalCost, 0);
  const lowStockItems = ingredients.filter((item) => item.currentStock <= item.parLevel);
  const overCostRecipes = recipes.filter((r) => r.actualFoodCostPct > r.targetFoodCostPct);
  const starsCount = recipes.filter((r) => r.matrixCategory === 'STAR').length;
  const dogsCount = recipes.filter((r) => r.matrixCategory === 'DOG').length;

  // 7-day food cost historical data
  const trendDays = [
    { day: 'T2 (15/9)', actual: 27.5, target: 28.0, sales: 52000000 },
    { day: 'T3 (16/9)', actual: 28.1, target: 28.0, sales: 48500000 },
    { day: 'T4 (17/9)', actual: 28.4, target: 28.0, sales: 54200000 },
    { day: 'T5 (18/9)', actual: 29.2, target: 28.0, sales: 58900000 },
    { day: 'T6 (19/9)', actual: 30.8, target: 28.0, sales: 74500000 }, // Cao điểm
    { day: 'T7 (20/9)', actual: 31.4, target: 28.0, sales: 88200000 }, // Cao điểm cuối tuần
    { day: 'CN (21/9)', actual: 29.8, target: 28.0, sales: 79600000 },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner with AI Highlight */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Phân Tích AI Restaurant365 Trực Tiếp</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              Trung Tâm Kiểm Soát Food Cost & Thất Thoát
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Tỷ lệ Food Cost hiện tại là <strong className="text-amber-400">29.8%</strong> (vượt mục tiêu +1.8%). 
              Hao hụt kho kiểm kê tuần này là <strong className="text-rose-400">4.605.000 ₫</strong>. 
              Chỉ số Prime Cost ở mức <strong className="text-emerald-400">52.2%</strong> (an toàn).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onOpenAIAssistant('Phân tích tại sao Food Cost tuần này tăng 1.8% và cho tôi 3 hành động cụ thể để giảm chi phí.')}
              className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/25 transition-all hover:bg-amber-400 active:scale-95"
            >
              <Sparkles className="h-4 w-4" />
              <span>Chạy Kiểm Toán AI Tức Thì</span>
            </button>
            <button
              onClick={() => onNavigate('inventory')}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-700"
            >
              <Boxes className="h-4 w-4 text-amber-400" />
              <span>Xem Sổ Kho & Hủy Món</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Core Restaurant365 KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* PRIME COST KPI */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Prime Cost (Food + Labor)</span>
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/20">
              Mục tiêu &lt; 55%
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white tracking-tight">
              {plData.primeCostPct.toFixed(1)}%
            </span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center">
              <CheckCircle className="h-3.5 w-3.5 mr-0.5" /> Đạt chuẩn
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Tổng Prime Cost: <strong className="text-slate-200">{(plData.primeCost / 1000000).toFixed(1)}M ₫</strong> ({((plData.totalCOGS / plData.primeCost) * 100).toFixed(0)}% NVL / {((plData.totalLaborCost / plData.primeCost) * 100).toFixed(0)}% Nhân công)
          </p>
        </div>

        {/* FOOD COST KPI */}
        <div className="rounded-2xl border border-amber-500/30 bg-slate-900/80 p-5 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Tỷ lệ Food Cost Thực Tế</span>
            <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-xs font-bold text-rose-400 border border-rose-500/20">
              +1.8% Vượt mức
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-400 tracking-tight">
              {plData.foodCostPct.toFixed(1)}%
            </span>
            <span className="text-xs text-slate-400">/ Mục tiêu 28.0%</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
            <span>COGS thực tế: <strong className="text-slate-200">{(plData.totalCOGS / 1000000).toFixed(1)}M ₫</strong></span>
            <button 
              onClick={() => onNavigate('recipe_costing')}
              className="text-amber-400 hover:underline flex items-center font-medium"
            >
              Xem món <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* LABOR COST KPI */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Tỷ lệ Chi Phí Lao Động</span>
            <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-xs font-bold text-purple-400 border border-purple-500/20">
              Mục tiêu 21.5%
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white tracking-tight">
              {plData.laborCostPct.toFixed(1)}%
            </span>
            <span className="text-xs text-slate-400">+0.9% ca cuối tuần</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
            <span>Lương & Ca: <strong className="text-slate-200">{(plData.totalLaborCost / 1000000).toFixed(1)}M ₫</strong></span>
            <span className="text-purple-300 font-medium">SPLH: 328k/h</span>
          </div>
        </div>

        {/* WASTE & VARIANCE LOSS */}
        <div className="rounded-2xl border border-rose-500/30 bg-slate-900/80 p-5 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Thất Thoát Kho & Hủy Món</span>
            <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-xs font-bold text-rose-300">
              5 sự cố
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-rose-400 tracking-tight">
              {(totalWasteAmount / 1000000).toFixed(2)}M ₫
            </span>
            <span className="text-xs text-rose-400/80 font-medium">~ 1.9% Sales</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
            <span>Hao hụt cao nhất: <strong className="text-slate-200">Thịt Bò Wagyu</strong></span>
            <button 
              onClick={() => onNavigate('inventory')}
              className="text-rose-400 hover:underline flex items-center font-medium"
            >
              Chi tiết <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Critical Operational Alerts Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Cảnh Báo Vận Hành Cần Xử Lý Tức Thì (Root-Cause Alerts)
            </h2>
          </div>
          <span className="text-xs text-slate-400">Tự động phát hiện bởi Resto365 AI Rule-Engine</span>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Alert 1 */}
          <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-3.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" />
                Hao hụt kiểm kê (AvT)
              </span>
              <span className="text-[10px] text-rose-400/80 font-semibold">-2.960.000 ₫</span>
            </div>
            <p className="mt-1.5 text-xs text-slate-300 font-medium leading-relaxed">
              <strong>Thăn Bò Wagyu A5:</strong> Tồn sổ sách 14.0 kg nhưng kiểm đếm thực tế chỉ còn 12.4 kg (-1.6 kg).
            </p>
            <button
              onClick={() => onOpenAIAssistant('Giải thích tại sao Thăn Bò Wagyu A5 bị âm 1.6kg kiểm kê và cách kiểm soát sơ chế.')}
              className="mt-2.5 text-[11px] font-bold text-rose-300 hover:text-white flex items-center gap-1"
            >
              Truy vấn nguyên nhân AI <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          {/* Alert 2 */}
          <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-amber-400 flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4" />
                Biến động giá nhập NCC
              </span>
              <span className="text-[10px] text-amber-400/80 font-semibold">+14.0% đợt này</span>
            </div>
            <p className="mt-1.5 text-xs text-slate-300 font-medium leading-relaxed">
              <strong>Rau Xà Lách Romaine:</strong> Nhà cung cấp Bio Đà Lạt tăng từ 57.000đ lên 65.000đ/kg do thời tiết mưa bão.
            </p>
            <button
              onClick={() => onNavigate('recipe_costing')}
              className="mt-2.5 text-[11px] font-bold text-amber-300 hover:text-white flex items-center gap-1"
            >
              Cập nhật lại Cost món ăn <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          {/* Alert 3 */}
          <div className="rounded-xl border border-blue-500/30 bg-blue-950/20 p-3.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-blue-400 flex items-center gap-1.5">
                <UtensilsCrossed className="h-4 w-4" />
                Món ăn vượt định mức Cost
              </span>
              <span className="text-[10px] text-blue-400/80 font-semibold">Cost 33.2%</span>
            </div>
            <p className="mt-1.5 text-xs text-slate-300 font-medium leading-relaxed">
              <strong>Cá Hồi Áp Chảo Măng Tây:</strong> Giá bán 320k không còn bù đắp kịp giá cá hồi nhập khẩu tăng.
            </p>
            <button
              onClick={() => onNavigate('recipe_costing')}
              className="mt-2.5 text-[11px] font-bold text-blue-300 hover:text-white flex items-center gap-1"
            >
              Mô phỏng tăng giá bán <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Analysis Grid: Trend & Menu Engineering */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 7-Day Trend Chart View */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/90 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Scale className="h-4 w-4 text-amber-400" />
                Biểu Đồ Xu Hướng Food Cost % (7 Ngày Gần Nhất)
              </h3>
              <p className="text-xs text-slate-400">So sánh Food Cost thực tế vs Đường mục tiêu chuẩn (28.0%)</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-amber-400">
                <span className="h-2 w-2 rounded-full bg-amber-400" /> Thực tế
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <span className="h-2 w-2 rounded-full bg-slate-500" /> Mục tiêu 28%
              </span>
            </div>
          </div>

          {/* Bar Chart Representation */}
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-7 gap-2 items-end h-44 pt-6 pb-2 border-b border-slate-800">
              {trendDays.map((item, idx) => {
                const heightPercent = Math.min(100, (item.actual / 35) * 100);
                const isOver = item.actual > item.target;
                return (
                  <div key={idx} className="flex flex-col items-center h-full justify-end group relative">
                    {/* Tooltip on hover */}
                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 border border-slate-700 rounded px-2 py-1 text-[10px] text-white whitespace-nowrap z-10 pointer-events-none shadow-lg">
                      Cost: <strong>{item.actual}%</strong> | Doanh thu: {(item.sales / 1000000).toFixed(0)}M
                    </div>

                    <span className={`text-[11px] font-bold mb-1 ${isOver ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {item.actual}%
                    </span>

                    <div className="w-full max-w-[36px] bg-slate-800/80 rounded-t-lg overflow-hidden flex flex-col justify-end h-32 relative">
                      {/* Target reference dash line */}
                      <div 
                        className="absolute w-full border-t border-dashed border-slate-400 z-10" 
                        style={{ bottom: `${(28.0 / 35) * 100}%` }}
                      />
                      <div
                        className={`w-full rounded-t transition-all ${
                          isOver ? 'bg-gradient-to-t from-amber-600 to-amber-400' : 'bg-gradient-to-t from-emerald-600 to-emerald-400'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>

                    <span className="mt-2 text-[10px] font-medium text-slate-400 truncate max-w-full">
                      {item.day.split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
              <span>Đỉnh điểm thất thoát: <strong>Thứ 6 & Thứ 7 (Ca tối cao điểm)</strong></span>
              <button
                onClick={() => onNavigate('accounting')}
                className="text-amber-400 hover:underline flex items-center font-medium"
              >
                Xem báo cáo P&L đầy đủ <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Boston Box Menu Engineering Summary */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-400" />
                Ma Trận Menu Engineering
              </h3>
              <button 
                onClick={() => onNavigate('recipe_costing')}
                className="text-xs text-amber-400 hover:underline"
              >
                Chi tiết
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {/* STAR */}
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    ★ Ngôi Sao (Stars)
                  </span>
                  <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[11px] font-bold text-emerald-400">
                    {starsCount} Món
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  Lợi nhuận cao + Bán chạy: Bò Wagyu A5, Pizza Truffle, Cafe Muối.
                </p>
              </div>

              {/* PLOWHORSE */}
              <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    ♞ Ngựa Thồ (Plowhorses)
                  </span>
                  <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[11px] font-bold text-amber-400">
                    1 Món
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  Bán rất chạy nhưng Cost cao (33.2%): <strong>Cá Hồi Áp Chảo</strong>. Cần tăng giá nhẹ.
                </p>
              </div>

              {/* PUZZLE */}
              <div className="rounded-xl border border-blue-500/30 bg-blue-950/20 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                    ? Câu Đố (Puzzles)
                  </span>
                  <span className="rounded bg-blue-500/20 px-2 py-0.5 text-[11px] font-bold text-blue-400">
                    1 Món
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  Cost siêu thấp (21.5%) nhưng bán chậm: <strong>Salad Ức Gà</strong>. Cần đẩy mạnh upsell.
                </p>
              </div>

              {/* DOG */}
              <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                    ✕ Gánh Nặng (Dogs)
                  </span>
                  <span className="rounded bg-rose-500/20 px-2 py-0.5 text-[11px] font-bold text-rose-400">
                    {dogsCount} Món
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  Cost cao (36.3%) + Bán chậm: <strong>Súp Rong Biển</strong>. Xem xét loại bỏ.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800">
            <button
              onClick={() => onNavigate('recipe_costing')}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-700"
            >
              <span>Mở Bộ Giả Lập Giá & Margin</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-amber-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Stock Health Quick Check Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Boxes className="h-4 w-4 text-amber-400" />
              Nguyên Liệu Cần Đặt Hàng & Kiểm Soát Thất Thoát
            </h3>
            <p className="text-xs text-slate-400">Nguyên vật liệu có tồn kho dưới định mức an toàn (Par Level)</p>
          </div>
          <button
            onClick={() => onNavigate('inventory')}
            className="text-xs font-bold text-amber-400 hover:underline flex items-center"
          >
            Vào Trung Tâm Kho & Hóa Đơn <ChevronRight className="h-3.5 w-3.5 ml-1" />
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 text-slate-400 font-semibold">
              <tr>
                <th className="pb-2.5">Mã NVL</th>
                <th className="pb-2.5">Tên Nguyên Liệu</th>
                <th className="pb-2.5">Khu Vực Lưu Trữ</th>
                <th className="pb-2.5">Tồn Hiện Tại</th>
                <th className="pb-2.5">Định Mức An Toàn (Par)</th>
                <th className="pb-2.5">Đơn Giá Nhập</th>
                <th className="pb-2.5">Trạng Thái</th>
                <th className="pb-2.5 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {lowStockItems.slice(0, 5).map((ing) => {
                const percent = (ing.currentStock / ing.parLevel) * 100;
                return (
                  <tr key={ing.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 font-mono text-[11px] text-slate-400">{ing.code}</td>
                    <td className="py-2.5 font-bold text-slate-100">{ing.name}</td>
                    <td className="py-2.5 text-slate-400">
                      {ing.storageArea === 'cold_freezer' && 'Kho Đông'}
                      {ing.storageArea === 'cold_chiller' && 'Kho Mát'}
                      {ing.storageArea === 'dry_storage' && 'Kho Khô'}
                      {ing.storageArea === 'bar_cellar' && 'Quầy Bar'}
                    </td>
                    <td className="py-2.5 font-semibold text-amber-400">
                      {ing.currentStock} {ing.unit}
                    </td>
                    <td className="py-2.5 text-slate-400">
                      {ing.parLevel} {ing.unit}
                    </td>
                    <td className="py-2.5 font-medium text-slate-300">
                      {ing.costPerUnit.toLocaleString('vi-VN')} ₫
                    </td>
                    <td className="py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        percent < 60 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {percent < 60 ? 'Dưới An Toàn' : 'Sắp Hết'} ({percent.toFixed(0)}%)
                      </span>
                    </td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => onNavigate('inventory')}
                        className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-slate-200 hover:bg-slate-700"
                      >
                        Đặt Hàng
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
