import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  ShieldAlert, 
  TrendingDown, 
  Lightbulb, 
  CheckCircle2, 
  RefreshCw, 
  DollarSign, 
  AlertTriangle,
  FileText,
  Clock,
  ArrowRight
} from 'lucide-react';
import { 
  RestaurantPL, 
  Ingredient, 
  Recipe, 
  WasteRecord, 
  PhysicalCountSession 
} from '../types';

interface AIAuditorViewProps {
  plData: RestaurantPL;
  ingredients: Ingredient[];
  recipes: Recipe[];
  wasteRecords: WasteRecord[];
  physicalCounts: PhysicalCountSession[];
  initialPrompt?: string;
}

export const AIAuditorView: React.FC<AIAuditorViewProps> = ({
  plData,
  ingredients,
  recipes,
  wasteRecords,
  physicalCounts,
  initialPrompt,
}) => {
  const [prompt, setPrompt] = useState(initialPrompt || '');
  const [loading, setLoading] = useState(false);
  const [auditResult, setAuditResult] = useState<string | null>(null);
  const [auditTimestamp, setAuditTimestamp] = useState<string | null>(null);

  const samplePrompts = [
    'Phân tích tại sao Food Cost tuần này tăng 1.8% và cho tôi 3 hành động cụ thể để giảm chi phí.',
    'Kiểm toán thất thoát kho (AvT) đối với Thăn Bò Wagyu A5 và quy trình siết chặt sơ chế.',
    'Đánh giá ma trận Boston Box và chiến lược tối ưu giá món Cá Hồi Áp Chảo (Cost 33.2%).',
    'Tối ưu tỷ lệ Prime Cost (Food + Labor) để đạt biên lợi nhuận ròng 22%.',
  ];

  const handleRunAudit = async (customPrompt?: string) => {
    const question = customPrompt || prompt;
    setLoading(true);
    setAuditResult(null);

    try {
      const response = await fetch('/api/ai/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plData,
          ingredients,
          recipes,
          wasteRecords,
          physicalCounts,
          userQuestion: question,
        }),
      });

      if (!response.ok) {
        throw new Error('Lỗi từ máy chủ AI');
      }

      const data = await response.json();
      setAuditResult(data.analysis);
      setAuditTimestamp(new Date().toLocaleTimeString('vi-VN'));
    } catch (err: any) {
      setAuditResult(
        `⚠️ Không thể kết nối với dịch vụ AI: ${err.message || 'Lỗi mạng'}. Vui lòng thử lại.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Resto365 AI Food Cost Intelligence</span>
            </div>
            <h1 className="text-2xl font-black text-white sm:text-3xl">
              Trợ Lý AI Kiểm Toán Chi Phí & Thất Thoát
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Tự động phân tích toàn diện dữ liệu: COGS, kiểm kê thực tế vs lý thuyết (AvT), tỷ lệ hao hụt từng công thức món ăn, nhật ký hủy món và biến động giá nhà cung cấp.
            </p>
          </div>

          <button
            onClick={() => handleRunAudit()}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/25 hover:bg-amber-400 active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            <span>{loading ? 'Đang Kiểm Toán...' : 'Chạy Toàn Bộ Kiểm Toán'}</span>
          </button>
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Câu Hỏi Kiểm Toán Thường Gặp (Chạm để phân tích ngay):
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {samplePrompts.map((q, idx) => (
            <button
              key={idx}
              onClick={() => {
                setPrompt(q);
                handleRunAudit(q);
              }}
              className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-left text-xs font-medium text-slate-300 hover:border-amber-500/40 hover:text-white transition-all group"
            >
              <span>{q}</span>
              <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-amber-400 transition-colors flex-shrink-0 ml-2" />
            </button>
          ))}
        </div>
      </div>

      {/* Custom Query Box */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="h-4 w-4 text-amber-400" />
          <h3 className="text-sm font-bold text-white">Truy Vấn Riêng Với AI Auditor</h3>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRunAudit()}
            placeholder="Nhập câu hỏi hoặc tình huống nhà hàng cần AI giải quyết..."
            className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500 font-medium"
          />
          <button
            onClick={() => handleRunAudit()}
            disabled={loading || !prompt.trim()}
            className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:bg-amber-400 active:scale-95 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="hidden sm:inline">Gửi AI</span>
          </button>
        </div>
      </div>

      {/* Results View */}
      {auditResult && (
        <div className="rounded-2xl border border-amber-500/40 bg-slate-900/90 p-6 shadow-xl animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Báo Cáo Kiểm Toán Gemini AI</h3>
                <span className="text-[11px] text-slate-400">Thời gian tạo: {auditTimestamp}</span>
              </div>
            </div>

            <button
              onClick={() => handleRunAudit()}
              className="flex items-center gap-1.5 text-xs text-amber-400 hover:underline font-bold"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Chạy lại</span>
            </button>
          </div>

          <div className="prose prose-invert max-w-none text-xs leading-relaxed text-slate-300 space-y-3 whitespace-pre-line font-sans">
            {auditResult}
          </div>
        </div>
      )}
    </div>
  );
};
