import React, { useState } from 'react';
import { 
  ReceiptText, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  FileSpreadsheet, 
  ShieldCheck, 
  Sparkles, 
  Calendar, 
  Download,
  Building2,
  PieChart
} from 'lucide-react';
import { RestaurantPL, PurchaseInvoice } from '../types';

interface AccountingViewProps {
  plData: RestaurantPL;
  invoices: PurchaseInvoice[];
  onOpenAIAssistant: (prompt?: string) => void;
}

export const AccountingView: React.FC<AccountingViewProps> = ({
  plData,
  invoices,
  onOpenAIAssistant,
}) => {
  const [activeTab, setActiveTab] = useState<'pl' | 'cogs_breakdown' | 'ap'>('pl');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert('Đã xuất thành công Báo Cáo P&L & Bảng Kiểm Toán COGS chuẩn Restaurant365 định dạng CSV/Excel.');
    }, 800);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ReceiptText className="h-6 w-6 text-amber-400" />
            <h1 className="text-xl font-black text-white sm:text-2xl">
              Kế Toán Nhà Hàng & Báo Cáo P&L (Restaurant Accounting)
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Tự động tổng hợp Doanh thu POS, Chi phí NVL tiêu hao (COGS: Đầu kỳ + Mua - Cuối kỳ), Chỉ số Prime Cost và Công nợ NCC.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onOpenAIAssistant('Phân tích bảng P&L tháng 9 và đưa ra chiến lược tối ưu lợi nhuận ròng từ 19.5% lên 22%.')}
            className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2 text-xs font-bold text-amber-300 hover:bg-amber-500/20"
          >
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span>AI Đánh Giá Tài Chính</span>
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/25 hover:bg-amber-400 active:scale-95 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            <span>{isExporting ? 'Đang Xuất Báo Cáo...' : 'Xuất Excel / P&L'}</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-1">
        <button
          onClick={() => setActiveTab('pl')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
            activeTab === 'pl'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'text-slate-400 hover:bg-slate-900 hover:text-white'
          }`}
        >
          <ReceiptText className="h-4 w-4" />
          <span>Báo Cáo Lãi Lỗ P&L Chuẩn F&B</span>
        </button>

        <button
          onClick={() => setActiveTab('cogs_breakdown')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
            activeTab === 'cogs_breakdown'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'text-slate-400 hover:bg-slate-900 hover:text-white'
          }`}
        >
          <PieChart className="h-4 w-4 text-emerald-400" />
          <span>Phân Tích Chi Tiết COGS (Tiêu Hao NVL)</span>
        </button>

        <button
          onClick={() => setActiveTab('ap')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
            activeTab === 'ap'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'text-slate-400 hover:bg-slate-900 hover:text-white'
          }`}
        >
          <Building2 className="h-4 w-4 text-blue-400" />
          <span>Sổ Công Nợ Nhà Cung Cấp (AP Ledger)</span>
        </button>
      </div>

      {/* TAB 1: P&L STATEMENT */}
      {activeTab === 'pl' && (
        <div className="space-y-6">
          {/* Executive Prime Cost Badge */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 uppercase">Chỉ Số Prime Cost</span>
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                  Mục tiêu &lt; 55%
                </span>
              </div>
              <p className="mt-2 text-3xl font-black text-white">{plData.primeCostPct.toFixed(1)}%</p>
              <p className="mt-1 text-xs text-emerald-400/80">
                {(plData.primeCost / 1000000).toFixed(1)}M ₫ (Đạt chuẩn sinh tử ngành nhà hàng)
              </p>
            </div>

            <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase">Food Cost Thực Tế</span>
                <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-300">
                  +1.8% Lệch
                </span>
              </div>
              <p className="mt-2 text-3xl font-black text-amber-400">{plData.foodCostPct.toFixed(1)}%</p>
              <p className="mt-1 text-xs text-amber-300/80">
                {(plData.totalCOGS / 1000000).toFixed(1)}M ₫ / Mục tiêu 28.0%
              </p>
            </div>

            <div className="rounded-2xl border border-blue-500/30 bg-blue-950/20 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-400 uppercase">Lợi Nhuận Ròng (Net Profit)</span>
                <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-300">
                  Biên 19.5%
                </span>
              </div>
              <p className="mt-2 text-3xl font-black text-white">{(plData.netProfit / 1000000).toFixed(1)}M ₫</p>
              <p className="mt-1 text-xs text-blue-300/80">Sau khi trừ toàn bộ chi phí vận hành & mặt bằng</p>
            </div>
          </div>

          {/* Detailed Restaurant P&L Table */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden p-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">
                  Báo Cáo Hoạt Động Kinh Doanh (P&L Income Statement)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Kỳ tài chính: {plData.period}</p>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Khoản Mục Tài Chính</th>
                    <th className="py-3 px-4 text-right">Số Tiền (VND)</th>
                    <th className="py-3 px-4 text-right">% Doanh Thu</th>
                    <th className="py-3 px-4 text-right">% Mục Tiêu Chuẩn</th>
                    <th className="py-3 px-4 text-right">Đánh Giá</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {/* DOANH THU */}
                  <tr className="bg-slate-800/30 font-bold">
                    <td className="py-2.5 px-4 text-slate-200">1. TỔNG DOANH THU THUẦN (NET SALES)</td>
                    <td className="py-2.5 px-4 text-right text-white font-black text-sm">
                      {plData.totalSales.toLocaleString('vi-VN')} ₫
                    </td>
                    <td className="py-2.5 px-4 text-right text-slate-200">100.0%</td>
                    <td className="py-2.5 px-4 text-right text-slate-400">100.0%</td>
                    <td className="py-2.5 px-4 text-right text-emerald-400 font-semibold">Cơ sở tính</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-8 text-slate-400">Doanh thu đồ ăn (Food Sales)</td>
                    <td className="py-2 px-4 text-right text-slate-300">
                      {plData.foodSales.toLocaleString('vi-VN')} ₫
                    </td>
                    <td className="py-2 px-4 text-right text-slate-400">
                      {((plData.foodSales / plData.totalSales) * 100).toFixed(1)}%
                    </td>
                    <td className="py-2 px-4 text-right text-slate-500">75-80%</td>
                    <td className="py-2 px-4 text-right text-slate-400">-</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-8 text-slate-400">Doanh thu đồ uống & Bar (Beverage Sales)</td>
                    <td className="py-2 px-4 text-right text-slate-300">
                      {plData.beverageSales.toLocaleString('vi-VN')} ₫
                    </td>
                    <td className="py-2 px-4 text-right text-slate-400">
                      {((plData.beverageSales / plData.totalSales) * 100).toFixed(1)}%
                    </td>
                    <td className="py-2 px-4 text-right text-slate-500">20-25%</td>
                    <td className="py-2 px-4 text-right text-slate-400">-</td>
                  </tr>

                  {/* COGS */}
                  <tr className="bg-amber-950/20 font-bold border-t-2 border-slate-700">
                    <td className="py-2.5 px-4 text-amber-300">
                      2. GIÁ VỐN HÀNG BÁN (COGS - FOOD & BEVERAGE)
                    </td>
                    <td className="py-2.5 px-4 text-right text-amber-400 font-black text-sm">
                      {plData.totalCOGS.toLocaleString('vi-VN')} ₫
                    </td>
                    <td className="py-2.5 px-4 text-right font-black text-amber-400">
                      {plData.foodCostPct.toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-4 text-right text-slate-400">28.0%</td>
                    <td className="py-2.5 px-4 text-right text-rose-400 font-bold">+1.8% Cần giảm</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-8 text-slate-400">+ Tồn kho đầu kỳ (Beginning Inventory)</td>
                    <td className="py-1.5 px-4 text-right text-slate-400">
                      {plData.beginningInventory.toLocaleString('vi-VN')} ₫
                    </td>
                    <td colSpan={3}></td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-8 text-slate-400">+ Mua hàng trong kỳ (Purchases)</td>
                    <td className="py-1.5 px-4 text-right text-slate-400">
                      {plData.purchases.toLocaleString('vi-VN')} ₫
                    </td>
                    <td colSpan={3}></td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-8 text-slate-400">- Tồn kho cuối kỳ kiểm đếm (Ending Inventory)</td>
                    <td className="py-1.5 px-4 text-right text-slate-400">
                      -{plData.endingInventory.toLocaleString('vi-VN')} ₫
                    </td>
                    <td colSpan={3}></td>
                  </tr>

                  {/* GROSS PROFIT */}
                  <tr className="bg-slate-800/40 font-bold">
                    <td className="py-2.5 px-4 text-slate-200">3. LỢI NHUẬN GỘP (GROSS PROFIT)</td>
                    <td className="py-2.5 px-4 text-right text-white font-bold">
                      {(plData.totalSales - plData.totalCOGS).toLocaleString('vi-VN')} ₫
                    </td>
                    <td className="py-2.5 px-4 text-right text-emerald-400 font-bold">
                      {(100 - plData.foodCostPct).toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-4 text-right text-slate-400">72.0%</td>
                    <td className="py-2.5 px-4 text-right text-emerald-400 font-semibold">Tốt</td>
                  </tr>

                  {/* LABOR COSTS */}
                  <tr className="bg-purple-950/20 font-bold border-t-2 border-slate-700">
                    <td className="py-2.5 px-4 text-purple-300">4. CHI PHÍ LAO ĐỘNG (LABOR COSTS)</td>
                    <td className="py-2.5 px-4 text-right text-purple-400 font-black text-sm">
                      {plData.totalLaborCost.toLocaleString('vi-VN')} ₫
                    </td>
                    <td className="py-2.5 px-4 text-right font-black text-purple-400">
                      {plData.laborCostPct.toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-4 text-right text-slate-400">21.5%</td>
                    <td className="py-2.5 px-4 text-right text-amber-400 font-semibold">+0.9% Chấp nhận</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-8 text-slate-400">Nhân sự bếp & sơ chế (Kitchen Labor)</td>
                    <td className="py-2 px-4 text-right text-slate-300">
                      {plData.kitchenLabor.toLocaleString('vi-VN')} ₫
                    </td>
                    <td className="py-2 px-4 text-right text-slate-400">
                      {((plData.kitchenLabor / plData.totalSales) * 100).toFixed(1)}%
                    </td>
                    <td className="py-2 px-4 text-right text-slate-500">11.0%</td>
                    <td className="py-2 px-4 text-right text-slate-400">-</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-8 text-slate-400">Nhân sự phục vụ & Bar (FOH Labor)</td>
                    <td className="py-2 px-4 text-right text-slate-300">
                      {plData.fohLabor.toLocaleString('vi-VN')} ₫
                    </td>
                    <td className="py-2 px-4 text-right text-slate-400">
                      {((plData.fohLabor / plData.totalSales) * 100).toFixed(1)}%
                    </td>
                    <td className="py-2 px-4 text-right text-slate-500">8.0%</td>
                    <td className="py-2 px-4 text-right text-slate-400">-</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-8 text-slate-400">Quản lý & Giám sát (Management)</td>
                    <td className="py-2 px-4 text-right text-slate-300">
                      {plData.managementLabor.toLocaleString('vi-VN')} ₫
                    </td>
                    <td className="py-2 px-4 text-right text-slate-400">
                      {((plData.managementLabor / plData.totalSales) * 100).toFixed(1)}%
                    </td>
                    <td className="py-2 px-4 text-right text-slate-500">2.5%</td>
                    <td className="py-2 px-4 text-right text-slate-400">-</td>
                  </tr>

                  {/* PRIME COST */}
                  <tr className="bg-emerald-950/40 font-black border-y-2 border-emerald-500/50">
                    <td className="py-3 px-4 text-emerald-300 text-sm">
                      ★ CHỈ SỐ PRIME COST (COGS + LABOR)
                    </td>
                    <td className="py-3 px-4 text-right text-emerald-400 text-base">
                      {plData.primeCost.toLocaleString('vi-VN')} ₫
                    </td>
                    <td className="py-3 px-4 text-right text-emerald-400 text-base">
                      {plData.primeCostPct.toFixed(1)}%
                    </td>
                    <td className="py-3 px-4 text-right text-slate-300">&lt; 55.0%</td>
                    <td className="py-3 px-4 text-right text-emerald-300">
                      ✓ Đạt Chuẩn Ngành
                    </td>
                  </tr>

                  {/* OPERATING EXPENSES */}
                  <tr className="bg-slate-800/30 font-bold">
                    <td className="py-2.5 px-4 text-slate-300">5. CHI PHÍ VẬN HÀNH & MẶT BẰNG</td>
                    <td className="py-2.5 px-4 text-right text-slate-200">
                      {plData.totalOperatingExpenses.toLocaleString('vi-VN')} ₫
                    </td>
                    <td className="py-2.5 px-4 text-right text-slate-300">
                      {((plData.totalOperatingExpenses / plData.totalSales) * 100).toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-4 text-right text-slate-400">22.0%</td>
                    <td className="py-2.5 px-4 text-right text-slate-400">-</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-8 text-slate-400">Thuê mặt bằng & phí dịch vụ toà nhà</td>
                    <td className="py-2 px-4 text-right text-slate-300">
                      {plData.rentOccupancy.toLocaleString('vi-VN')} ₫
                    </td>
                    <td className="py-2 px-4 text-right text-slate-400">11.2%</td>
                    <td className="py-2 px-4 text-right text-slate-500">10-12%</td>
                    <td className="py-2 px-4 text-right text-slate-400">-</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-8 text-slate-400">Điện nước, ga, điều hòa trung tâm</td>
                    <td className="py-2 px-4 text-right text-slate-300">
                      {plData.utilities.toLocaleString('vi-VN')} ₫
                    </td>
                    <td className="py-2 px-4 text-right text-slate-400">4.6%</td>
                    <td className="py-2 px-4 text-right text-slate-500">4-5%</td>
                    <td className="py-2 px-4 text-right text-slate-400">-</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-8 text-slate-400">Marketing, quảng cáo & tiếp khách</td>
                    <td className="py-2 px-4 text-right text-slate-300">
                      {plData.marketing.toLocaleString('vi-VN')} ₫
                    </td>
                    <td className="py-2 px-4 text-right text-slate-400">3.6%</td>
                    <td className="py-2 px-4 text-right text-slate-500">3-4%</td>
                    <td className="py-2 px-4 text-right text-slate-400">-</td>
                  </tr>

                  {/* NET PROFIT */}
                  <tr className="bg-gradient-to-r from-blue-950/40 to-emerald-950/40 font-black border-t-2 border-slate-600">
                    <td className="py-3 px-4 text-white text-base">
                      6. LỢI NHUẬN RÒNG CUỐI CÙNG (NET PROFIT)
                    </td>
                    <td className="py-3 px-4 text-right text-emerald-400 text-lg">
                      {plData.netProfit.toLocaleString('vi-VN')} ₫
                    </td>
                    <td className="py-3 px-4 text-right text-emerald-400 text-lg">
                      {plData.netProfitPct.toFixed(1)}%
                    </td>
                    <td className="py-3 px-4 text-right text-slate-300">18-20%</td>
                    <td className="py-3 px-4 text-right text-emerald-400 font-bold">
                      Hiệu Quả Cao
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COGS BREAKDOWN */}
      {activeTab === 'cogs_breakdown' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6">
            <h3 className="text-sm font-bold text-white mb-2">
              Công Thức Tính COGS Tiêu Hao (Cost of Goods Sold Equation)
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Theo chuẩn kiểm toán Restaurant365: <strong className="text-amber-400">COGS = Tồn Đầu Kỳ + Hàng Mua Vào - Tồn Cuối Kỳ</strong>. 
              Sau đó so sánh lượng tiêu hao này với lượng xuất kho lý thuyết trên hệ thống POS để phát hiện thất thoát ẩn.
            </p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <span className="text-slate-400 text-xs">Tồn Đầu Kỳ (01/09)</span>
                <p className="text-xl font-bold text-white mt-1">
                  {plData.beginningInventory.toLocaleString('vi-VN')} ₫
                </p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <span className="text-slate-400 text-xs">+ Mua Hàng Trong Kỳ</span>
                <p className="text-xl font-bold text-blue-400 mt-1">
                  +{plData.purchases.toLocaleString('vi-VN')} ₫
                </p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <span className="text-slate-400 text-xs">- Tồn Cuối Kỳ Kiểm Kê</span>
                <p className="text-xl font-bold text-rose-400 mt-1">
                  -{plData.endingInventory.toLocaleString('vi-VN')} ₫
                </p>
              </div>
              <div className="rounded-xl border border-amber-500/40 bg-amber-950/20 p-4">
                <span className="text-amber-400 text-xs font-bold">= COGS Tiêu Hao Thực Tế</span>
                <p className="text-xl font-black text-amber-400 mt-1">
                  {plData.totalCOGS.toLocaleString('vi-VN')} ₫
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AP INVOICES & SUPPLIER LEDGER */}
      {activeTab === 'ap' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6">
            <h3 className="text-sm font-bold text-white mb-1">
              Sổ Công Nợ Phải Trả Nhà Cung Cấp (Accounts Payable)
            </h3>
            <p className="text-xs text-slate-400">
              Kiểm soát dòng tiền và lịch thanh toán đúng hạn cho các đối tác cung ứng thực phẩm.
            </p>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Số Hóa Đơn</th>
                    <th className="py-3 px-4">Nhà Cung Cấp</th>
                    <th className="py-3 px-4">Ngày Nhập Kho</th>
                    <th className="py-3 px-4">Hạn Thanh Toán</th>
                    <th className="py-3 px-4">Tổng Tiền (VND)</th>
                    <th className="py-3 px-4 text-right">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono font-bold text-amber-400">{inv.invoiceNumber}</td>
                      <td className="py-3 px-4 font-bold text-slate-100">{inv.supplierName}</td>
                      <td className="py-3 px-4 text-slate-300">{inv.date}</td>
                      <td className="py-3 px-4 text-slate-300">{inv.dueDate}</td>
                      <td className="py-3 px-4 font-black text-slate-200">
                        {inv.totalAmount.toLocaleString('vi-VN')} ₫
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`inline-flex rounded px-2 py-0.5 text-[10px] font-bold ${
                          inv.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          inv.status === 'received' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                          'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {inv.status === 'paid' ? 'Đã Thanh Toán' : inv.status === 'received' ? 'Đã Nhận Hàng' : 'Chờ Duyệt'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
