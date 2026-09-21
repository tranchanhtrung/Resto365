import React, { useState } from 'react';
import { 
  Users2, 
  Clock, 
  TrendingUp, 
  Calendar, 
  Plus, 
  Sparkles, 
  CheckCircle, 
  AlertCircle, 
  ChevronRight,
  Coffee,
  ChefHat,
  GlassWater
} from 'lucide-react';
import { LaborShift } from '../types';

interface LaborViewProps {
  shifts: LaborShift[];
  onAddShift: (shift: LaborShift) => void;
  onOpenAIAssistant: (prompt?: string) => void;
}

export const LaborView: React.FC<LaborViewProps> = ({
  shifts,
  onAddShift,
  onOpenAIAssistant,
}) => {
  const [filterDept, setFilterDept] = useState<string>('all');
  const [showShiftModal, setShowShiftModal] = useState(false);

  // New shift state
  const [employeeName, setEmployeeName] = useState('');
  const [role, setRole] = useState('Đầu Bếp / Sơ Chế');
  const [department, setDepartment] = useState<'kitchen' | 'front_of_house' | 'bar' | 'management'>('kitchen');
  const [startTime, setStartTime] = useState('16:00');
  const [endTime, setEndTime] = useState('23:30');
  const [hourlyRate, setHourlyRate] = useState(45000);

  const totalLaborCost = shifts.reduce((sum, s) => sum + s.totalCost, 0);
  const totalHours = shifts.reduce((sum, s) => sum + s.actualHours, 0);
  const totalOvertimeHours = shifts.reduce((sum, s) => sum + s.overtimeHours, 0);

  const filteredShifts = shifts.filter(
    (s) => filterDept === 'all' || s.department === filterDept
  );

  const handleCreateShift = (e: React.FormEvent) => {
    e.preventDefault();
    const hours = 7.5;
    const regularPay = hours * hourlyRate;
    const totalCost = regularPay;

    const newShift: LaborShift = {
      id: `shf-${Date.now()}`,
      employeeName,
      role,
      department,
      date: new Date().toISOString().split('T')[0],
      startTime,
      endTime,
      scheduledHours: hours,
      actualHours: hours,
      hourlyRate,
      regularPay,
      overtimeHours: 0,
      overtimePay: 0,
      totalCost,
      status: 'scheduled',
    };

    onAddShift(newShift);
    setShowShiftModal(false);
    setEmployeeName('');
  };

  const getDepartmentLabel = (d: string) => {
    switch (d) {
      case 'kitchen': return 'Bếp & Sơ Chế';
      case 'front_of_house': return 'Phục Vụ & Tiếp Tân';
      case 'bar': return 'Pha Chế & Rượu';
      case 'management': return 'Ban Quản Lý';
      default: return d;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Users2 className="h-6 w-6 text-amber-400" />
            <h1 className="text-xl font-black text-white sm:text-2xl">
              Quản Lý Lao Động & Xếp Ca (Labor & Scheduling)
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Tối ưu hóa năng suất giờ công (SPLH), kiểm soát giờ làm thêm (Overtime) và phân bổ nhân lực theo dự báo lượng khách.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onOpenAIAssistant('Phân tích chi phí lao động tuần này và đề xuất lịch xếp ca tinh gọn giảm 5% chi phí nhân sự.')}
            className="flex items-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/10 px-3.5 py-2 text-xs font-bold text-purple-300 hover:bg-purple-500/20"
          >
            <Sparkles className="h-4 w-4 text-purple-400" />
            <span>AI Tối Ưu Lịch Xếp Ca</span>
          </button>
          <button
            onClick={() => setShowShiftModal(true)}
            className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/25 hover:bg-amber-400 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Thêm Lịch Ca Mới</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5">
          <span className="text-xs font-bold text-slate-400 uppercase">Tỷ Lệ Chi Phí Lao Động</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">22.4%</span>
            <span className="text-xs text-purple-400 font-semibold">Mục tiêu 21.5%</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Tổng lương ca tuần: 90.000.000 ₫</p>
        </div>

        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5">
          <span className="text-xs font-bold text-emerald-400 uppercase">Chỉ Số SPLH (Năng Suất Giờ)</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-400">328k ₫</span>
            <span className="text-xs text-emerald-300 font-bold">/ Giờ công</span>
          </div>
          <p className="mt-1 text-xs text-emerald-400/80">Vượt chuẩn ngành (300k - 350k ₫/h)</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5">
          <span className="text-xs font-bold text-slate-400 uppercase">Tổng Giờ Công Ca Tuần</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{totalHours.toFixed(0)} Giờ</span>
            <span className="text-xs text-slate-400">{shifts.length} Nhân sự</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Đầy đủ 3 ca vận hành hàng ngày</p>
        </div>

        <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-5">
          <span className="text-xs font-bold text-amber-400 uppercase">Giờ Làm Thêm (Overtime)</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-400">{totalOvertimeHours} Giờ</span>
            <span className="text-xs text-amber-300 font-semibold">Hệ số 1.5x</span>
          </div>
          <p className="mt-1 text-xs text-amber-300/80">Tập trung cao điểm tối T6 & T7</p>
        </div>
      </div>

      {/* Shifts Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white">Bảng Phân Bổ Ca & Bảng Công Nhân Viên</h3>
            <p className="text-xs text-slate-400">Theo dõi giờ làm việc thực tế, check-in và tính lương tự động.</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Bộ phận:</span>
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-white outline-none"
            >
              <option value="all">Tất cả bộ phận</option>
              <option value="kitchen">Bếp & Sơ Chế</option>
              <option value="front_of_house">Phục Vụ & Tiếp Tân</option>
              <option value="bar">Quầy Bar</option>
              <option value="management">Ban Quản Lý</option>
            </select>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold">
              <tr>
                <th className="py-3 px-4">Nhân Viên</th>
                <th className="py-3 px-4">Chức Vụ</th>
                <th className="py-3 px-4">Bộ Phận</th>
                <th className="py-3 px-4">Khung Giờ</th>
                <th className="py-3 px-4">Mức Lương/Giờ</th>
                <th className="py-3 px-4">Giờ Làm</th>
                <th className="py-3 px-4">Làm Thêm (OT)</th>
                <th className="py-3 px-4">Tổng Lương Ca</th>
                <th className="py-3 px-4 text-right">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredShifts.map((shift) => (
                <tr key={shift.id} className="hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-bold text-slate-100">{shift.employeeName}</td>
                  <td className="py-3 px-4 text-slate-300">{shift.role}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 text-slate-300">
                      {shift.department === 'kitchen' && <ChefHat className="h-3.5 w-3.5 text-amber-400" />}
                      {shift.department === 'bar' && <GlassWater className="h-3.5 w-3.5 text-blue-400" />}
                      {shift.department === 'front_of_house' && <Coffee className="h-3.5 w-3.5 text-purple-400" />}
                      {getDepartmentLabel(shift.department)}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-300">
                    {shift.startTime} - {shift.endTime}
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {shift.hourlyRate.toLocaleString('vi-VN')} ₫/h
                  </td>
                  <td className="py-3 px-4 text-slate-300 font-semibold">{shift.actualHours}h</td>
                  <td className="py-3 px-4">
                    {shift.overtimeHours > 0 ? (
                      <span className="font-bold text-amber-400">+{shift.overtimeHours}h (OT)</span>
                    ) : (
                      <span className="text-slate-500">0h</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-black text-slate-100">
                    {shift.totalCost.toLocaleString('vi-VN')} ₫
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`inline-flex rounded px-2 py-0.5 text-[10px] font-bold ${
                      shift.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      shift.status === 'checked_in' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                      'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}>
                      {shift.status === 'completed' ? 'Đã Hoàn Thành' : shift.status === 'checked_in' ? 'Đang Trong Ca' : 'Đã Lên Lịch'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: THÊM CA MỚI */}
      {showShiftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <h3 className="font-bold text-white text-base mb-4 flex items-center gap-2">
              <Users2 className="h-5 w-5 text-amber-400" />
              Xếp Lịch Ca Làm Việc Mới
            </h3>

            <form onSubmit={handleCreateShift} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tên Nhân Viên:</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Hoàng Minh Trí"
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Chức Vụ:</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nhân viên pha chế chính"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Bộ Phận:</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white outline-none"
                  >
                    <option value="kitchen">Bếp & Sơ Chế</option>
                    <option value="front_of_house">Phục Vụ</option>
                    <option value="bar">Quầy Bar</option>
                    <option value="management">Quản Lý</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Mức Lương/Giờ (VND):</label>
                  <input
                    type="number"
                    step="1000"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(parseInt(e.target.value) || 35000)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white outline-none font-bold text-amber-400"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowShiftModal(false)}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-amber-500 px-5 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/30 hover:bg-amber-400"
                >
                  Lưu Ca
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
