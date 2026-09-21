import React, { useState } from 'react';
import { 
  Boxes, 
  AlertTriangle, 
  Search, 
  Plus, 
  Filter, 
  ArrowUpDown, 
  FileSpreadsheet, 
  ShieldAlert, 
  Flame, 
  CheckCircle2, 
  RotateCcw, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  X,
  Truck,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { 
  Ingredient, 
  PhysicalCountSession, 
  WasteRecord, 
  PurchaseInvoice, 
  StorageArea, 
  WasteReason 
} from '../types';

interface InventoryViewProps {
  ingredients: Ingredient[];
  physicalCounts: PhysicalCountSession[];
  wasteRecords: WasteRecord[];
  invoices: PurchaseInvoice[];
  onAddWasteRecord: (record: Omit<WasteRecord, 'id' | 'timestamp'>) => void;
  onUpdateIngredientStock: (id: string, newStock: number) => void;
  onAddPhysicalCount: (count: PhysicalCountSession) => void;
  onOpenAIAssistant: (prompt?: string) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  ingredients,
  physicalCounts,
  wasteRecords,
  invoices,
  onAddWasteRecord,
  onUpdateIngredientStock,
  onAddPhysicalCount,
  onOpenAIAssistant,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'items' | 'counts' | 'waste' | 'invoices'>('items');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStorage, setSelectedStorage] = useState<string>('all');
  
  // Modal states
  const [showWasteModal, setShowWasteModal] = useState(false);
  const [showCountModal, setShowCountModal] = useState(false);

  // New Waste Form State
  const [newWasteItemId, setNewWasteItemId] = useState(ingredients[0]?.id || '');
  const [newWasteQty, setNewWasteQty] = useState(1);
  const [newWasteReason, setNewWasteReason] = useState<WasteReason>('burnt_cooked');
  const [newWasteShift, setNewWasteShift] = useState<'Ca Sáng' | 'Ca Chiều' | 'Ca Tối'>('Ca Tối');
  const [newWasteReportedBy, setNewWasteReportedBy] = useState('Bếp Phó Điều Hành');
  const [newWasteNotes, setNewWasteNotes] = useState('');

  // New Physical Count Form State
  const [countStorageArea, setCountStorageArea] = useState<StorageArea>('cold_freezer');
  const [countAuditor, setCountAuditor] = useState('Vũ Đình Toàn (Bếp Trưởng)');
  const [countItemsState, setCountItemsState] = useState<{ [id: string]: number }>({});

  const totalWasteCost = wasteRecords.reduce((sum, item) => sum + item.totalCost, 0);

  // Filtered ingredients
  const filteredIngredients = ingredients.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStorage = selectedStorage === 'all' || item.storageArea === selectedStorage;
    return matchesSearch && matchesStorage;
  });

  // Handle Waste Submit
  const handleCreateWaste = (e: React.FormEvent) => {
    e.preventDefault();
    const item = ingredients.find((i) => i.id === newWasteItemId);
    if (!item) return;

    const totalCost = newWasteQty * item.costPerUnit;

    onAddWasteRecord({
      itemId: item.id,
      itemName: item.name,
      category: 'raw_ingredient',
      quantity: Number(newWasteQty),
      unit: item.unit,
      costPerUnit: item.costPerUnit,
      totalCost,
      reason: newWasteReason,
      shift: newWasteShift,
      reportedBy: newWasteReportedBy,
      notes: newWasteNotes || 'Ghi nhận thất thoát ca làm việc.',
    });

    // Automatically deduct from current stock
    const updatedStock = Math.max(0, item.currentStock - Number(newWasteQty));
    onUpdateIngredientStock(item.id, updatedStock);

    setShowWasteModal(false);
    setNewWasteNotes('');
  };

  // Handle Count Submit
  const handleCreateCount = (e: React.FormEvent) => {
    e.preventDefault();
    const areaIngredients = ingredients.filter(i => i.storageArea === countStorageArea);
    
    let totalVarianceCost = 0;
    const items = areaIngredients.map(ing => {
      const counted = countItemsState[ing.id] !== undefined ? countItemsState[ing.id] : ing.currentStock;
      const varianceQty = counted - ing.currentStock;
      const varianceCost = varianceQty * ing.costPerUnit;
      totalVarianceCost += varianceCost;

      let status: 'balanced' | 'surplus' | 'shortage' | 'critical' = 'balanced';
      if (varianceQty < 0) {
        status = Math.abs(varianceCost) > 1000000 ? 'critical' : 'shortage';
      } else if (varianceQty > 0) {
        status = 'surplus';
      }

      return {
        ingredientId: ing.id,
        ingredientName: ing.name,
        unit: ing.unit,
        costPerUnit: ing.costPerUnit,
        theoreticalQty: ing.currentStock,
        countedQty: counted,
        varianceQty,
        varianceCost,
        status,
      };
    });

    const newSession: PhysicalCountSession = {
      id: `cnt-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      storageArea: countStorageArea,
      countedBy: countAuditor,
      totalVarianceCost,
      status: 'completed',
      items,
    };

    onAddPhysicalCount(newSession);

    // Update real stock to counted values
    items.forEach(it => {
      onUpdateIngredientStock(it.ingredientId, it.countedQty);
    });

    setShowCountModal(false);
  };

  const getReasonLabel = (reason: WasteReason) => {
    switch (reason) {
      case 'burnt_cooked': return 'Cháy khét / Nấu hỏng';
      case 'expired': return 'Hết hạn sử dụng';
      case 'dropped_spilled': return 'Rơi vỡ / Đổ';
      case 'prep_trim_loss': return 'Hao hụt sơ chế vượt mức';
      case 'customer_return': return 'Khách trả lại';
      case 'staff_sampling': return 'Nhân viên test / training';
      default: return reason;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Module Title & Quick Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Boxes className="h-6 w-6 text-amber-400" />
            <h1 className="text-xl font-black text-white sm:text-2xl">
              Quản Lý Kho & Kiểm Soát Thất Thoát (Inventory & Waste)
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Theo dõi tồn kho thực tế vs lý thuyết (Actual vs Theoretical - AvT), nhật ký hủy hàng và kiểm soát biến động giá NCC.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="btn-add-waste-modal"
            onClick={() => setShowWasteModal(true)}
            className="flex items-center gap-2 rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-bold text-white shadow-lg shadow-rose-600/20 hover:bg-rose-500 active:scale-95"
          >
            <AlertTriangle className="h-4 w-4" />
            <span>Ghi Nhận Hủy Món / Hỏng Kho</span>
          </button>
          <button
            id="btn-add-count-modal"
            onClick={() => {
              // Initialize state
              const initial: { [id: string]: number } = {};
              ingredients.forEach(i => initial[i.id] = i.currentStock);
              setCountItemsState(initial);
              setShowCountModal(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:bg-amber-400 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Tạo Phiếu Kiểm Kê (AvT)</span>
          </button>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-1">
        <button
          id="tab-inventory-items"
          onClick={() => setActiveSubTab('items')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
            activeSubTab === 'items'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'text-slate-400 hover:bg-slate-900 hover:text-white'
          }`}
        >
          <Boxes className="h-4 w-4" />
          <span>Danh Mục Nguyên Vật Liệu ({ingredients.length})</span>
        </button>

        <button
          id="tab-inventory-counts"
          onClick={() => setActiveSubTab('counts')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
            activeSubTab === 'counts'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'text-slate-400 hover:bg-slate-900 hover:text-white'
          }`}
        >
          <CheckCircle2 className="h-4 w-4" />
          <span>Kiểm Kê Kho Định Kỳ AvT ({physicalCounts.length})</span>
        </button>

        <button
          id="tab-inventory-waste"
          onClick={() => setActiveSubTab('waste')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
            activeSubTab === 'waste'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'text-slate-400 hover:bg-slate-900 hover:text-white'
          }`}
        >
          <AlertTriangle className="h-4 w-4 text-rose-400" />
          <span>Nhật Ký Hao Hụt & Hủy Món ({(totalWasteCost / 1000000).toFixed(1)}M ₫)</span>
        </button>

        <button
          id="tab-inventory-invoices"
          onClick={() => setActiveSubTab('invoices')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
            activeSubTab === 'invoices'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'text-slate-400 hover:bg-slate-900 hover:text-white'
          }`}
        >
          <Truck className="h-4 w-4 text-blue-400" />
          <span>Hóa Đơn Mua Hàng & Biến Động Giá ({invoices.length})</span>
        </button>
      </div>

      {/* TAB 1: INGREDIENTS LIST */}
      {activeSubTab === 'items' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm mã hoặc tên nguyên liệu..."
                className="w-full rounded-xl border border-slate-700 bg-slate-900 py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Filter className="h-3.5 w-3.5" /> Kho:
              </span>
              <select
                value={selectedStorage}
                onChange={(e) => setSelectedStorage(e.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-200 outline-none focus:border-amber-500"
              >
                <option value="all">Tất cả kho trữ</option>
                <option value="cold_freezer">Kho Đông (-18°C)</option>
                <option value="cold_chiller">Kho Mát (0-4°C)</option>
                <option value="dry_storage">Kho Khô</option>
                <option value="bar_cellar">Quầy Bar & Hầm Rượu</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Mã SKU</th>
                    <th className="py-3 px-4">Tên Nguyên Liệu</th>
                    <th className="py-3 px-4">Kho Lưu Trữ</th>
                    <th className="py-3 px-4">Tồn Hiện Tại</th>
                    <th className="py-3 px-4">Định Mức An Toàn (Par)</th>
                    <th className="py-3 px-4">Giá Nhập Gần Nhất</th>
                    <th className="py-3 px-4">Hao Hụt Sơ Chế (Yield)</th>
                    <th className="py-3 px-4">Nhà Cung Cấp</th>
                    <th className="py-3 px-4 text-right">Trạng Thái Kho</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredIngredients.map((item) => {
                    const isBelowPar = item.currentStock <= item.parLevel;
                    const percent = (item.currentStock / item.parLevel) * 100;
                    return (
                      <tr key={item.id} className="hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-mono font-semibold text-slate-400">{item.code}</td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-100">{item.name}</div>
                          <div className="text-[10px] text-slate-500">HSD: {item.expiryDate}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          {item.storageArea === 'cold_freezer' && 'Kho Đông (-18°C)'}
                          {item.storageArea === 'cold_chiller' && 'Kho Mát (0-4°C)'}
                          {item.storageArea === 'dry_storage' && 'Kho Khô'}
                          {item.storageArea === 'bar_cellar' && 'Quầy Bar & Hầm Rượu'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`font-black text-sm ${isBelowPar ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {item.currentStock}
                          </span>{' '}
                          <span className="text-slate-400">{item.unit}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          {item.parLevel} {item.unit}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-200">
                          {item.costPerUnit.toLocaleString('vi-VN')} ₫
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          <span className="font-semibold text-amber-400">{(item.yieldRate * 100).toFixed(0)}%</span>{' '}
                          <span className="text-[10px] text-slate-500">({((1 - item.yieldRate) * 100).toFixed(0)}% hao hụt)</span>
                        </td>
                        <td className="py-3 px-4 text-slate-400 truncate max-w-[160px]">
                          {item.supplierName}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                              percent < 70
                                ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                                : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            }`}
                          >
                            {percent < 70 ? `Thiếu Hàng (${percent.toFixed(0)}%)` : 'Đủ Tồn Kho'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PHYSICAL COUNTS (AvT) */}
      {activeSubTab === 'counts' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-400" />
                  Báo Cáo Kiểm Kê Thực Tế vs Lý Thuyết (AvT Variance)
                </h3>
                <p className="text-xs text-slate-400">
                  Phát hiện chênh lệch giữa lượng xuất bán lý thuyết trên hệ thống POS và số lượng cân đếm thực tế.
                </p>
              </div>
              <button
                onClick={() => onOpenAIAssistant('Phân tích nguyên nhân chênh lệch kiểm kê âm của các phiên kiểm kê gần nhất và đề xuất quy trình siết chặt.')}
                className="flex items-center gap-1.5 rounded-lg bg-amber-500/20 px-3 py-1.5 text-xs font-bold text-amber-300 border border-amber-500/30 hover:bg-amber-500/30"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>AI Kiểm Toán Phiên Kiểm Kê</span>
              </button>
            </div>

            <div className="mt-4 space-y-6">
              {physicalCounts.map((count) => (
                <div key={count.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-mono font-bold text-amber-400">
                        {count.id}
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-white">
                          Khu vực: {count.storageArea === 'cold_freezer' ? 'Kho Đông' : count.storageArea === 'cold_chiller' ? 'Kho Mát' : 'Quầy Bar'}
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          Ngày kiểm kê: {count.date} | Người thực hiện: {count.countedBy}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Tổng chênh lệch tài chính:</span>
                      <span className={`text-sm font-black ${count.totalVarianceCost < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {count.totalVarianceCost.toLocaleString('vi-VN')} ₫
                      </span>
                    </div>
                  </div>

                  {/* Items count table */}
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="text-[11px] text-slate-400 font-semibold border-b border-slate-800/60">
                        <tr>
                          <th className="pb-2">Tên Nguyên Liệu</th>
                          <th className="pb-2">Tồn Lý Thuyết (POS)</th>
                          <th className="pb-2">Đếm Thực Tế</th>
                          <th className="pb-2">Chênh Lệch (Số Lượng)</th>
                          <th className="pb-2">Giá Trị Thất Thoát (VND)</th>
                          <th className="pb-2 text-right">Đánh Giá</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/40">
                        {count.items.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-900/40">
                            <td className="py-2.5 font-bold text-slate-200">{item.ingredientName}</td>
                            <td className="py-2.5 text-slate-300 font-semibold">{item.theoreticalQty} {item.unit}</td>
                            <td className="py-2.5 font-bold text-amber-300">{item.countedQty} {item.unit}</td>
                            <td className="py-2.5">
                              <span className={`font-bold ${item.varianceQty < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                {item.varianceQty > 0 ? `+${item.varianceQty}` : item.varianceQty} {item.unit}
                              </span>
                            </td>
                            <td className="py-2.5 font-bold text-slate-200">
                              <span className={item.varianceCost < 0 ? 'text-rose-400' : 'text-emerald-400'}>
                                {item.varianceCost.toLocaleString('vi-VN')} ₫
                              </span>
                            </td>
                            <td className="py-2.5 text-right">
                              <span className={`inline-flex rounded px-2 py-0.5 text-[10px] font-bold ${
                                item.status === 'critical' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                                item.status === 'shortage' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                                'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              }`}>
                                {item.status === 'critical' ? 'Báo Động Đỏ' : item.status === 'shortage' ? 'Thiếu Hụt' : 'Cân Bằng'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: WASTE LOGS */}
      {activeSubTab === 'waste' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-rose-950/20 border border-rose-500/30 rounded-2xl p-4">
            <div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-rose-400" />
                <h3 className="text-sm font-bold text-white">Tổng Thất Thoát Ghi Nhận Tuần Này</h3>
              </div>
              <p className="mt-1 text-xs text-slate-300">
                Gồm hỏng hóc khi sơ chế, cháy khét khi nấu nướng, rơi vỡ quầy bar và hàng hết hạn.
              </p>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-rose-400">
                {totalWasteCost.toLocaleString('vi-VN')} ₫
              </span>
              <span className="text-xs text-rose-300 font-semibold">({wasteRecords.length} sự cố)</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Thời Gian & Ca</th>
                    <th className="py-3 px-4">Món / Nguyên Liệu Hủy</th>
                    <th className="py-3 px-4">Số Lượng</th>
                    <th className="py-3 px-4">Lý Do Hủy</th>
                    <th className="py-3 px-4">Tổng Thiệt Hại (VND)</th>
                    <th className="py-3 px-4">Người Báo Cáo</th>
                    <th className="py-3 px-4">Ghi Chú Chi Tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {wasteRecords.map((wst) => (
                    <tr key={wst.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4">
                        <div className="font-mono text-slate-300">{wst.timestamp}</div>
                        <div className="text-[10px] text-amber-400 font-semibold">{wst.shift}</div>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-100">{wst.itemName}</td>
                      <td className="py-3 px-4 font-semibold text-rose-400">
                        {wst.quantity} {wst.unit}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex rounded bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-300 border border-rose-500/30">
                          {getReasonLabel(wst.reason)}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-rose-400 text-sm">
                        {wst.totalCost.toLocaleString('vi-VN')} ₫
                      </td>
                      <td className="py-3 px-4 text-slate-300">{wst.reportedBy}</td>
                      <td className="py-3 px-4 text-slate-400 max-w-xs truncate">{wst.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PURCHASE INVOICES */}
      {activeSubTab === 'invoices' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
              <span className="text-xs font-bold text-slate-400 uppercase">Tổng Hóa Đơn Nhập Hàng</span>
              <p className="mt-2 text-2xl font-black text-white">
                {invoices.reduce((a, b) => a + b.totalAmount, 0).toLocaleString('vi-VN')} ₫
              </p>
              <p className="mt-1 text-xs text-slate-400">3 Nhà cung cấp chính thức</p>
            </div>
            <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4">
              <span className="text-xs font-bold text-amber-400 uppercase">Cảnh Báo Biến Động Giá NCC</span>
              <p className="mt-2 text-2xl font-black text-amber-400">2 Mặt Hàng Tăng</p>
              <p className="mt-1 text-xs text-slate-300">Thịt Bò Wagyu (+5.7%), Rau Romaine (+14.0%)</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase">Tự Động Hóa Nhập Kho (AP)</span>
                <p className="mt-1 text-xs text-slate-300">Tự động so sánh giá cũ vs giá mới trên Hóa Đơn.</p>
              </div>
              <button
                onClick={() => onOpenAIAssistant('Phân tích tác động của việc giá rau Romaine tăng 14% và bò Wagyu tăng 5.7% đến biên lợi nhuận.')}
                className="flex items-center gap-1 rounded-xl bg-amber-500 px-3 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>AI Phân Tích</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {invoices.map((inv) => (
              <div key={inv.id} className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-amber-400">{inv.invoiceNumber}</span>
                    <h4 className="font-bold text-white text-sm">{inv.supplierName}</h4>
                    <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                      inv.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      inv.status === 'received' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                      'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {inv.status === 'paid' ? 'Đã Thanh Toán' : inv.status === 'received' ? 'Đã Nhận Hàng' : 'Chờ Duyệt'}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-slate-400">Ngày nhập: <strong className="text-slate-200">{inv.date}</strong></span>
                    <span className="text-slate-400">Hạn thanh toán: <strong className="text-slate-200">{inv.dueDate}</strong></span>
                    <span className="text-base font-black text-amber-400">
                      {inv.totalAmount.toLocaleString('vi-VN')} ₫
                    </span>
                  </div>
                </div>

                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="text-[11px] text-slate-400 border-b border-slate-800/60 pb-1">
                      <tr>
                        <th className="pb-1.5">Nguyên Liệu</th>
                        <th className="pb-1.5">Số Lượng Nhập</th>
                        <th className="pb-1.5">Đơn Giá Đợt Này</th>
                        <th className="pb-1.5">Đơn Giá Đợt Trước</th>
                        <th className="pb-1.5">Biến Động %</th>
                        <th className="pb-1.5 text-right">Thành Tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {inv.items.map((it, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/30">
                          <td className="py-2 font-semibold text-slate-200">{it.ingredientName}</td>
                          <td className="py-2 font-bold text-slate-300">{it.quantity} {it.unit}</td>
                          <td className="py-2 font-bold text-amber-300">{it.unitPrice.toLocaleString('vi-VN')} ₫</td>
                          <td className="py-2 text-slate-400">{it.oldPrice.toLocaleString('vi-VN')} ₫</td>
                          <td className="py-2">
                            <span className={`inline-flex items-center gap-1 font-bold ${
                              it.priceDiffPercent > 0 ? 'text-rose-400' : 'text-emerald-400'
                            }`}>
                              {it.priceDiffPercent > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                              {it.priceDiffPercent > 0 ? `+${it.priceDiffPercent}%` : `${it.priceDiffPercent}%`}
                            </span>
                          </td>
                          <td className="py-2 text-right font-bold text-slate-100">
                            {it.lineTotal.toLocaleString('vi-VN')} ₫
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {inv.notes && (
                  <p className="mt-2 text-[11px] text-amber-300/80 bg-amber-950/20 px-3 py-1.5 rounded-lg border border-amber-500/20">
                    💡 <strong>Ghi chú kiểm soát:</strong> {inv.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: GHI NHẬN HỦY MÓN / HỎNG KHO */}
      {showWasteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertTriangle className="h-5 w-5" />
                <h3 className="font-bold text-white text-base">Ghi Nhận Hao Hụt / Hủy Món (Waste Log)</h3>
              </div>
              <button 
                onClick={() => setShowWasteModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWaste} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Chọn Nguyên Liệu / Món Bị Thất Thoát:
                </label>
                <select
                  value={newWasteItemId}
                  onChange={(e) => setNewWasteItemId(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white outline-none focus:border-rose-500"
                >
                  {ingredients.map((ing) => (
                    <option key={ing.id} value={ing.id}>
                      {ing.name} ({ing.costPerUnit.toLocaleString('vi-VN')} ₫/{ing.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Số Lượng Hủy:
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={newWasteQty}
                    onChange={(e) => setNewWasteQty(parseFloat(e.target.value) || 0)}
                    required
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white outline-none focus:border-rose-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Ca Làm Việc:
                  </label>
                  <select
                    value={newWasteShift}
                    onChange={(e) => setNewWasteShift(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white outline-none focus:border-rose-500"
                  >
                    <option value="Ca Sáng">Ca Sáng (08:00 - 15:00)</option>
                    <option value="Ca Chiều">Ca Chiều (14:00 - 18:00)</option>
                    <option value="Ca Tối">Ca Tối (17:00 - 23:30)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Lý Do Thất Thoát / Hủy Bỏ:
                </label>
                <select
                  value={newWasteReason}
                  onChange={(e) => setNewWasteReason(e.target.value as WasteReason)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white outline-none focus:border-rose-500"
                >
                  <option value="burnt_cooked">Cháy khét / Lỗi chế biến nhà bếp</option>
                  <option value="expired">Hết hạn sử dụng / Hỏng hóc bảo quản</option>
                  <option value="dropped_spilled">Rơi vỡ / Đổ vỡ trong quá trình phục vụ</option>
                  <option value="prep_trim_loss">Hao hụt sơ chế vượt định mức cho phép</option>
                  <option value="customer_return">Khách hàng trả lại món</option>
                  <option value="staff_sampling">Nhân viên thử món / Đào tạo kỹ thuật</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Người Báo Cáo / Xác Nhận:
                </label>
                <input
                  type="text"
                  value={newWasteReportedBy}
                  onChange={(e) => setNewWasteReportedBy(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Ghi Chú Nguyên Nhân Cụ Thể:
                </label>
                <textarea
                  value={newWasteNotes}
                  onChange={(e) => setNewWasteNotes(e.target.value)}
                  placeholder="Ví dụ: Nhân viên mới điều chỉnh nhiệt lò quá cao, sự cố mất điện tủ mát..."
                  rows={2}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowWasteModal(false)}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-rose-600/30 hover:bg-rose-500"
                >
                  Xác Nhận & Trừ Tồn Kho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TẠO PHIẾU KIỂM KÊ KHO (AvT) */}
      {showCountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-amber-400">
                <CheckCircle2 className="h-5 w-5" />
                <h3 className="font-bold text-white text-base">Phiếu Kiểm Kê Thực Tế vs Lý Thuyết (AvT)</h3>
              </div>
              <button 
                onClick={() => setShowCountModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCount} className="mt-4 space-y-4 overflow-y-auto flex-1 pr-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Chọn Khu Vực Kiểm Kê:
                  </label>
                  <select
                    value={countStorageArea}
                    onChange={(e) => setCountStorageArea(e.target.value as StorageArea)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                  >
                    <option value="cold_freezer">Kho Đông (-18°C)</option>
                    <option value="cold_chiller">Kho Mát (0-4°C)</option>
                    <option value="dry_storage">Kho Khô</option>
                    <option value="bar_cellar">Quầy Bar & Hầm Rượu</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Người Giám Sát Kiểm Kê:
                  </label>
                  <input
                    type="text"
                    value={countAuditor}
                    onChange={(e) => setCountAuditor(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="border border-slate-800 rounded-xl p-3 bg-slate-950/40">
                <h4 className="text-xs font-bold text-slate-200 mb-2">
                  Nhập Số Lượng Đếm Thực Tế Tại Kho:
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {ingredients
                    .filter(i => i.storageArea === countStorageArea)
                    .map((item) => {
                      const currentVal = countItemsState[item.id] !== undefined ? countItemsState[item.id] : item.currentStock;
                      const diff = currentVal - item.currentStock;
                      const diffCost = diff * item.costPerUnit;
                      return (
                        <div key={item.id} className="flex items-center justify-between gap-3 p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                          <div className="flex-1">
                            <div className="font-bold text-slate-100">{item.name}</div>
                            <div className="text-[11px] text-slate-400">
                              Tồn POS lý thuyết: <strong className="text-slate-200">{item.currentStock} {item.unit}</strong>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="w-28">
                              <input
                                type="number"
                                step="0.1"
                                min="0"
                                value={currentVal}
                                onChange={(e) => setCountItemsState({
                                  ...countItemsState,
                                  [item.id]: parseFloat(e.target.value) || 0,
                                })}
                                className="w-full text-center rounded-lg border border-slate-700 bg-slate-800 py-1 font-bold text-amber-400 outline-none focus:border-amber-500"
                              />
                            </div>
                            <div className="w-24 text-right">
                              <span className={`font-bold ${diff < 0 ? 'text-rose-400' : diff > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                                {diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1)} {item.unit}
                              </span>
                              <div className="text-[10px] text-slate-500">
                                {diffCost.toLocaleString('vi-VN')} ₫
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCountModal(false)}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-amber-500 px-5 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/30 hover:bg-amber-400"
                >
                  Hoàn Tất Kiểm Kê & Đồng Bộ Sổ Kho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
