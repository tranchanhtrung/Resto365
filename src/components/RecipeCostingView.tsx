import React, { useState } from 'react';
import { 
  UtensilsCrossed, 
  Flame, 
  Scale, 
  Plus, 
  Search, 
  TrendingUp, 
  DollarSign, 
  Sparkles, 
  ChevronRight, 
  Edit3, 
  Sliders, 
  AlertCircle, 
  Check, 
  X,
  Trash2
} from 'lucide-react';
import { Recipe, Ingredient, BostonMatrixCategory, RecipeIngredient } from '../types';

interface RecipeCostingViewProps {
  recipes: Recipe[];
  ingredients: Ingredient[];
  onAddRecipe: (recipe: Recipe) => void;
  onUpdateRecipe: (recipe: Recipe) => void;
  onOpenAIAssistant: (prompt?: string) => void;
}

export const RecipeCostingView: React.FC<RecipeCostingViewProps> = ({
  recipes,
  ingredients,
  onAddRecipe,
  onUpdateRecipe,
  onOpenAIAssistant,
}) => {
  const [activeTab, setActiveTab] = useState<'recipes' | 'matrix' | 'simulator'>('recipes');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRecipeId, setExpandedRecipeId] = useState<string | null>(recipes[0]?.id || null);

  // Simulator state
  const [simTargetFoodCost, setSimTargetFoodCost] = useState(28.0);
  const [simInflationRate, setSimInflationRate] = useState(0); // 0 to 25%

  // Modal Create/Edit Recipe
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);

  // Recipe Form State
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<'main_course' | 'appetizer' | 'hotpot_soup' | 'beverage' | 'dessert'>('main_course');
  const [formMenuPrice, setFormMenuPrice] = useState(250000);
  const [formTargetCostPct, setFormTargetCostPct] = useState(28.0);
  const [formNotes, setFormNotes] = useState('');
  const [formIngredients, setFormIngredients] = useState<RecipeIngredient[]>([]);

  // Filter recipes
  const filteredRecipes = recipes.filter((r) => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || r.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const getMatrixBadge = (category: BostonMatrixCategory) => {
    switch (category) {
      case 'STAR':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-400">
            ★ Ngôi Sao (Star)
          </span>
        );
      case 'PLOWHORSE':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-400">
            ♞ Ngựa Thồ (Plowhorse)
          </span>
        );
      case 'PUZZLE':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-xs font-bold text-blue-400">
            ? Câu Đố (Puzzle)
          </span>
        );
      case 'DOG':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 text-xs font-bold text-rose-400">
            ✕ Gánh Nặng (Dog)
          </span>
        );
    }
  };

  const handleOpenCreate = () => {
    setEditingRecipe(null);
    setFormName('');
    setFormCategory('main_course');
    setFormMenuPrice(250000);
    setFormTargetCostPct(28.0);
    setFormNotes('');
    setFormIngredients([
      {
        ingredientId: ingredients[0].id,
        ingredientName: ingredients[0].name,
        quantity: 0.15,
        unit: ingredients[0].unit,
        unitCost: ingredients[0].costPerUnit,
        yieldRate: ingredients[0].yieldRate,
        calculatedCost: (0.15 * ingredients[0].costPerUnit) / ingredients[0].yieldRate,
      },
    ]);
    setShowRecipeModal(true);
  };

  const handleAddIngredientRow = () => {
    const ing = ingredients[0];
    setFormIngredients([
      ...formIngredients,
      {
        ingredientId: ing.id,
        ingredientName: ing.name,
        quantity: 0.1,
        unit: ing.unit,
        unitCost: ing.costPerUnit,
        yieldRate: ing.yieldRate,
        calculatedCost: (0.1 * ing.costPerUnit) / ing.yieldRate,
      },
    ]);
  };

  const handleUpdateIngredientRow = (index: number, ingId: string, qty: number) => {
    const ing = ingredients.find((i) => i.id === ingId);
    if (!ing) return;

    const newRows = [...formIngredients];
    const cost = (qty * ing.costPerUnit) / ing.yieldRate;
    newRows[index] = {
      ingredientId: ing.id,
      ingredientName: ing.name,
      quantity: qty,
      unit: ing.unit,
      unitCost: ing.costPerUnit,
      yieldRate: ing.yieldRate,
      calculatedCost: Math.round(cost),
    };
    setFormIngredients(newRows);
  };

  const handleRemoveIngredientRow = (index: number) => {
    setFormIngredients(formIngredients.filter((_, i) => i !== index));
  };

  const handleSaveRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    const calculatedCogs = formIngredients.reduce((sum, item) => sum + item.calculatedCost, 0);
    const actualCostPct = (calculatedCogs / formMenuPrice) * 100;
    const margin = formMenuPrice - calculatedCogs;

    let matrixCategory: BostonMatrixCategory = 'STAR';
    if (actualCostPct > 30) {
      matrixCategory = 'PLOWHORSE';
    } else if (margin > 100000) {
      matrixCategory = 'STAR';
    }

    const newRecipe: Recipe = {
      id: editingRecipe ? editingRecipe.id : `rec-${Date.now()}`,
      name: formName,
      category: formCategory,
      portions: 1,
      prepTimeMinutes: 15,
      menuPrice: Number(formMenuPrice),
      targetFoodCostPct: Number(formTargetCostPct),
      cogs: calculatedCogs,
      actualFoodCostPct: actualCostPct,
      contributionMargin: margin,
      salesVolumeWeek: editingRecipe ? editingRecipe.salesVolumeWeek : 60,
      matrixCategory,
      ingredients: formIngredients,
      notes: formNotes,
      imageUrl: editingRecipe?.imageUrl || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
    };

    if (editingRecipe) {
      onUpdateRecipe(newRecipe);
    } else {
      onAddRecipe(newRecipe);
    }

    setShowRecipeModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Module Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="h-6 w-6 text-amber-400" />
            <h1 className="text-xl font-black text-white sm:text-2xl">
              Lên Thực Đơn Định Lượng & Ma Trận Lợi Nhuận (Recipe Costing)
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Chuẩn hóa từng gram nguyên liệu, tính toán chính xác COGS theo tỷ lệ thu hồi Yield Rate và tối ưu hóa ma trận Boston Box.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onOpenAIAssistant('Đề xuất kế hoạch tái cấu trúc định lượng món ăn để kéo giảm Food Cost toàn nhà hàng xuống 28.0%.')}
            className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2 text-xs font-bold text-amber-300 hover:bg-amber-500/20"
          >
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span>AI Menu Engineering</span>
          </button>
          <button
            id="btn-add-recipe-modal"
            onClick={handleOpenCreate}
            className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/25 hover:bg-amber-400 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Thêm Món & Định Lượng Mới</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-1">
        <button
          id="tab-recipes-list"
          onClick={() => setActiveTab('recipes')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
            activeTab === 'recipes'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'text-slate-400 hover:bg-slate-900 hover:text-white'
          }`}
        >
          <UtensilsCrossed className="h-4 w-4" />
          <span>Danh Sách Món & Chi Tiết Cost ({recipes.length})</span>
        </button>

        <button
          id="tab-recipes-matrix"
          onClick={() => setActiveTab('matrix')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
            activeTab === 'matrix'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'text-slate-400 hover:bg-slate-900 hover:text-white'
          }`}
        >
          <Flame className="h-4 w-4 text-orange-400" />
          <span>Ma Trận Boston Box (Menu Engineering)</span>
        </button>

        <button
          id="tab-recipes-simulator"
          onClick={() => setActiveTab('simulator')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
            activeTab === 'simulator'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'text-slate-400 hover:bg-slate-900 hover:text-white'
          }`}
        >
          <Sliders className="h-4 w-4 text-blue-400" />
          <span>Bộ Giả Lập Giá & Margin (What-If Simulator)</span>
        </button>
      </div>

      {/* TAB 1: RECIPE LIST & EXPANDED BREAKDOWN */}
      {activeTab === 'recipes' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm tên món ăn..."
                className="w-full rounded-xl border border-slate-700 bg-slate-900 py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-400">Danh mục:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-200 outline-none focus:border-amber-500"
              >
                <option value="all">Tất cả món</option>
                <option value="main_course">Món Chính (Main Course)</option>
                <option value="hotpot_soup">Lẩu & Súp (Hotpot & Soup)</option>
                <option value="appetizer">Khai Vị (Appetizer)</option>
                <option value="beverage">Đồ Uống (Beverage)</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredRecipes.map((recipe) => {
              const isOverCost = recipe.actualFoodCostPct > recipe.targetFoodCostPct;
              const isExpanded = expandedRecipeId === recipe.id;

              return (
                <div 
                  key={recipe.id}
                  className={`rounded-2xl border transition-all ${
                    isExpanded 
                      ? 'border-amber-500/50 bg-slate-900 shadow-xl' 
                      : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
                  }`}
                >
                  {/* Card Header */}
                  <div 
                    onClick={() => setExpandedRecipeId(isExpanded ? null : recipe.id)}
                    className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      {recipe.imageUrl && (
                        <img
                          src={recipe.imageUrl}
                          alt={recipe.name}
                          className="h-16 w-16 rounded-xl object-cover border border-slate-700 flex-shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      )}
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-bold text-white">{recipe.name}</h3>
                          {getMatrixBadge(recipe.matrixCategory)}
                        </div>
                        <p className="mt-1 text-xs text-slate-400">
                          Định lượng: <strong>1 phần</strong> | {recipe.ingredients.length} nguyên liệu cấu thành | Doanh số: <strong className="text-slate-200">{recipe.salesVolumeWeek} đĩa/tuần</strong>
                        </p>
                      </div>
                    </div>

                    {/* Financial Metrics Summary */}
                    <div className="flex flex-wrap items-center gap-5 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Giá Bán (POS)</span>
                        <span className="text-sm font-black text-slate-100">
                          {recipe.menuPrice.toLocaleString('vi-VN')} ₫
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[11px]">Giá Vốn (COGS)</span>
                        <span className="text-sm font-bold text-slate-200">
                          {recipe.cogs.toLocaleString('vi-VN')} ₫
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[11px]">Food Cost %</span>
                        <span className={`text-base font-black ${isOverCost ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {recipe.actualFoodCostPct.toFixed(1)}%
                        </span>
                        <span className="text-[10px] text-slate-500 block">Mục tiêu: {recipe.targetFoodCostPct}%</span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[11px]">Biên Lãi Gộp (Margin)</span>
                        <span className="text-sm font-black text-amber-400">
                          +{recipe.contributionMargin.toLocaleString('vi-VN')} ₫
                        </span>
                      </div>

                      <ChevronRight className={`h-5 w-5 text-slate-500 transition-transform ${isExpanded ? 'rotate-90 text-amber-400' : ''}`} />
                    </div>
                  </div>

                  {/* Expanded Recipe Ingredient Cost Breakdown */}
                  {isExpanded && (
                    <div className="border-t border-slate-800 bg-slate-950/60 p-5 rounded-b-2xl animate-in fade-in">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                          Chi Tiết Bảng Định Lượng & Tỷ Lệ Hao Hụt (Recipe Spec Sheet)
                        </h4>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenAIAssistant(`Phân tích và gợi ý cách tối ưu chi phí nguyên liệu cho món "${recipe.name}" để đưa Food Cost về 28.0%.`);
                          }}
                          className="flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:underline"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>AI Tối Ưu Món Này</span>
                        </button>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="border-b border-slate-800 text-slate-400 font-semibold">
                            <tr>
                              <th className="pb-2">Nguyên Liệu Cấu Thành</th>
                              <th className="pb-2">Khối Lượng Dùng (Gross)</th>
                              <th className="pb-2">Tỷ Lệ Thu Hồi (Yield %)</th>
                              <th className="pb-2">Đơn Giá Nhập Gốc</th>
                              <th className="pb-2 text-right">Chi Phí Thành Phần (VND)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60">
                            {recipe.ingredients.map((ing, idx) => (
                              <tr key={idx} className="hover:bg-slate-900/40">
                                <td className="py-2.5 font-bold text-slate-200">{ing.ingredientName}</td>
                                <td className="py-2.5 text-amber-300 font-medium">{ing.quantity} {ing.unit}</td>
                                <td className="py-2.5 text-slate-300">
                                  {(ing.yieldRate * 100).toFixed(0)}%
                                </td>
                                <td className="py-2.5 text-slate-400">
                                  {ing.unitCost.toLocaleString('vi-VN')} ₫/{ing.unit}
                                </td>
                                <td className="py-2.5 text-right font-bold text-slate-100">
                                  {ing.calculatedCost.toLocaleString('vi-VN')} ₫
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="border-t border-slate-700 font-bold">
                            <tr>
                              <td colSpan={4} className="pt-3 text-slate-300 text-right">
                                Tổng Giá Vốn Món Ăn (COGS):
                              </td>
                              <td className="pt-3 text-right text-sm text-amber-400 font-black">
                                {recipe.cogs.toLocaleString('vi-VN')} ₫
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>

                      {recipe.notes && (
                        <div className="mt-4 rounded-xl bg-slate-900 border border-slate-800 p-3 text-xs text-slate-300">
                          <strong className="text-amber-400">Ghi chú bếp trưởng:</strong> {recipe.notes}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: MENU ENGINEERING BOSTON BOX MATRIX */}
      {activeTab === 'matrix' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-400" />
                Ma Trận Phân Tích Thực Đơn (Boston Box F&B Matrix)
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Phân bổ các món ăn dựa trên 2 trục cốt lõi: <strong>Mức Độ Ưa Chuộng (Sales Volume)</strong> vs <strong>Biên Lợi Nhuận Đóng Góp (Contribution Margin)</strong>.
              </p>
            </div>

            {/* 4 Quadrants Visual Bento */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* STAR */}
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5">
                <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2.5">
                  <div>
                    <h4 className="font-black text-sm text-emerald-300 flex items-center gap-1.5">
                      ★ NGÔI SAO (STARS)
                    </h4>
                    <p className="text-[11px] text-emerald-400/80 font-medium">Lợi nhuận cao + Bán cực chạy</p>
                  </div>
                  <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-300">
                    Chiến lược: Duy trì chất lượng & Quảng bá
                  </span>
                </div>

                <div className="mt-3 space-y-2">
                  {recipes.filter(r => r.matrixCategory === 'STAR').map(r => (
                    <div key={r.id} className="flex items-center justify-between rounded-xl bg-slate-900/90 border border-slate-800 p-3 text-xs">
                      <div>
                        <div className="font-bold text-slate-100">{r.name}</div>
                        <div className="text-[11px] text-slate-400">
                          Giá bán: {r.menuPrice.toLocaleString('vi-VN')} ₫ | Cost: <strong className="text-emerald-400">{r.actualFoodCostPct.toFixed(1)}%</strong>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-emerald-400">+{r.contributionMargin.toLocaleString('vi-VN')} ₫</div>
                        <div className="text-[10px] text-slate-400">{r.salesVolumeWeek} đĩa/tuần</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* PLOWHORSE */}
              <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-5">
                <div className="flex items-center justify-between border-b border-amber-500/20 pb-2.5">
                  <div>
                    <h4 className="font-black text-sm text-amber-300 flex items-center gap-1.5">
                      ♞ NGỰA THỒ (PLOWHORSES)
                    </h4>
                    <p className="text-[11px] text-amber-400/80 font-medium">Lợi nhuận thấp + Bán rất chạy</p>
                  </div>
                  <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-bold text-amber-300">
                    Chiến lược: Tăng giá hoặc giảm định lượng
                  </span>
                </div>

                <div className="mt-3 space-y-2">
                  {recipes.filter(r => r.matrixCategory === 'PLOWHORSE').map(r => (
                    <div key={r.id} className="flex items-center justify-between rounded-xl bg-slate-900/90 border border-slate-800 p-3 text-xs">
                      <div>
                        <div className="font-bold text-slate-100">{r.name}</div>
                        <div className="text-[11px] text-rose-300 font-semibold">
                          ⚠️ Food Cost: {r.actualFoodCostPct.toFixed(1)}% (Vượt mức 28%)
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-amber-400">+{r.contributionMargin.toLocaleString('vi-VN')} ₫</div>
                        <div className="text-[10px] text-slate-400">{r.salesVolumeWeek} đĩa/tuần</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* PUZZLE */}
              <div className="rounded-2xl border border-blue-500/30 bg-blue-950/20 p-5">
                <div className="flex items-center justify-between border-b border-blue-500/20 pb-2.5">
                  <div>
                    <h4 className="font-black text-sm text-blue-300 flex items-center gap-1.5">
                      ? CÂU ĐỐ (PUZZLES)
                    </h4>
                    <p className="text-[11px] text-blue-400/80 font-medium">Lợi nhuận cao + Bán chậm</p>
                  </div>
                  <span className="rounded-full bg-blue-500/20 px-2.5 py-0.5 text-xs font-bold text-blue-300">
                    Chiến lược: Upsell, đổi vị trí menu
                  </span>
                </div>

                <div className="mt-3 space-y-2">
                  {recipes.filter(r => r.matrixCategory === 'PUZZLE').map(r => (
                    <div key={r.id} className="flex items-center justify-between rounded-xl bg-slate-900/90 border border-slate-800 p-3 text-xs">
                      <div>
                        <div className="font-bold text-slate-100">{r.name}</div>
                        <div className="text-[11px] text-blue-300 font-semibold">
                          Food cost siêu tốt: {r.actualFoodCostPct.toFixed(1)}%
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-blue-400">+{r.contributionMargin.toLocaleString('vi-VN')} ₫</div>
                        <div className="text-[10px] text-rose-400 font-bold">{r.salesVolumeWeek} đĩa/tuần (Bán ít)</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* DOG */}
              <div className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-5">
                <div className="flex items-center justify-between border-b border-rose-500/20 pb-2.5">
                  <div>
                    <h4 className="font-black text-sm text-rose-300 flex items-center gap-1.5">
                      ✕ GÁNH NẶNG (DOGS)
                    </h4>
                    <p className="text-[11px] text-rose-400/80 font-medium">Lợi nhuận thấp + Bán chậm</p>
                  </div>
                  <span className="rounded-full bg-rose-500/20 px-2.5 py-0.5 text-xs font-bold text-rose-300">
                    Chiến lược: Cắt bỏ hoặc tái cơ cấu
                  </span>
                </div>

                <div className="mt-3 space-y-2">
                  {recipes.filter(r => r.matrixCategory === 'DOG').map(r => (
                    <div key={r.id} className="flex items-center justify-between rounded-xl bg-slate-900/90 border border-slate-800 p-3 text-xs">
                      <div>
                        <div className="font-bold text-slate-100">{r.name}</div>
                        <div className="text-[11px] text-rose-400 font-semibold">
                          Cost quá cao: {r.actualFoodCostPct.toFixed(1)}%
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-rose-400">+{r.contributionMargin.toLocaleString('vi-VN')} ₫</div>
                        <div className="text-[10px] text-slate-500">{r.salesVolumeWeek} đĩa/tuần</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PRICING & MARGIN SIMULATOR */}
      {activeTab === 'simulator' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-amber-400" />
                  Bộ Giả Lập Giá Bán & Biên Lợi Nhuận F&B (What-If Simulation)
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Mô phỏng tác động của việc tăng giá nguyên liệu đầu vào hoặc điều chỉnh tỷ lệ Target Food Cost đối với giá bán đề xuất và lợi nhuận nhà hàng.
                </p>
              </div>
            </div>

            {/* Sliders Controls */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
              {/* Slider 1 */}
              <div>
                <div className="flex justify-between items-center text-xs font-bold text-slate-200 mb-2">
                  <span>Mục Tiêu Tỷ Lệ Food Cost:</span>
                  <span className="text-amber-400 font-black text-sm">{simTargetFoodCost.toFixed(1)}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="35"
                  step="0.5"
                  value={simTargetFoodCost}
                  onChange={(e) => setSimTargetFoodCost(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>20% (Siêu Lợi Nhuận)</span>
                  <span>28% (Chuẩn Fine Dining)</span>
                  <span>35% (Mass Casual)</span>
                </div>
              </div>

              {/* Slider 2 */}
              <div>
                <div className="flex justify-between items-center text-xs font-bold text-slate-200 mb-2">
                  <span>Giả Lập Tăng Giá Nguyên Liệu Đầu Vào:</span>
                  <span className="text-rose-400 font-black text-sm">+{simInflationRate}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  step="1"
                  value={simInflationRate}
                  onChange={(e) => setSimInflationRate(parseInt(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>0% (Ổn Định)</span>
                  <span>+10% (Biến động nhẹ)</span>
                  <span>+25% (Lạm phát mạnh)</span>
                </div>
              </div>
            </div>

            {/* Simulation Results Table */}
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Tên Món Ăn</th>
                    <th className="py-3 px-4">Giá Bán Hiện Tại</th>
                    <th className="py-3 px-4">Giá Vốn Hiện Tại (COGS)</th>
                    <th className="py-3 px-4">Giá Vốn Sau Biến Động</th>
                    <th className="py-3 px-4 text-amber-400">Giá Bán Đề Xuất Mới</th>
                    <th className="py-3 px-4 text-right">Lợi Nhuận Gộp Thêm / Tuần</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {recipes.map((r) => {
                    const inflatedCogs = r.cogs * (1 + simInflationRate / 100);
                    // Suggested price = inflatedCogs / (targetPct / 100) rounded to nearest 5,000 VND
                    const calculatedPrice = Math.ceil(inflatedCogs / (simTargetFoodCost / 100) / 5000) * 5000;
                    const priceDiff = calculatedPrice - r.menuPrice;
                    const weeklyExtraProfit = priceDiff * r.salesVolumeWeek;

                    return (
                      <tr key={r.id} className="hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-bold text-slate-100">{r.name}</td>
                        <td className="py-3 px-4 text-slate-300 font-medium">
                          {r.menuPrice.toLocaleString('vi-VN')} ₫
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          {r.cogs.toLocaleString('vi-VN')} ₫
                        </td>
                        <td className="py-3 px-4 font-bold text-rose-300">
                          {Math.round(inflatedCogs).toLocaleString('vi-VN')} ₫
                        </td>
                        <td className="py-3 px-4 font-black text-amber-400 text-sm">
                          {calculatedPrice.toLocaleString('vi-VN')} ₫
                          {priceDiff !== 0 && (
                            <span className={`ml-1 text-[10px] font-bold ${priceDiff > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                              ({priceDiff > 0 ? `+${priceDiff.toLocaleString('vi-VN')}` : priceDiff.toLocaleString('vi-VN')} ₫)
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-emerald-400">
                          {weeklyExtraProfit > 0 ? `+${weeklyExtraProfit.toLocaleString('vi-VN')}` : weeklyExtraProfit.toLocaleString('vi-VN')} ₫
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

      {/* MODAL: THÊM / SỬA CÔNG THỨC MÓN ĂN */}
      {showRecipeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-amber-400">
                <UtensilsCrossed className="h-5 w-5" />
                <h3 className="font-bold text-white text-base">
                  {editingRecipe ? 'Chỉnh Sửa Công Thức Món Ăn' : 'Thêm Món Ăn & Định Lượng Thành Phần Mới'}
                </h3>
              </div>
              <button onClick={() => setShowRecipeModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRecipe} className="mt-4 space-y-4 overflow-y-auto flex-1 pr-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tên Món Ăn:</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ví dụ: Bò Bít Tết Sốt Nấm Truffle"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white outline-none focus:border-amber-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Danh Mục Món:</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                  >
                    <option value="main_course">Món Chính (Main Course)</option>
                    <option value="hotpot_soup">Lẩu & Súp (Hotpot & Soup)</option>
                    <option value="appetizer">Khai Vị (Appetizer)</option>
                    <option value="beverage">Đồ Uống (Beverage)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Giá Bán Niêm Yết (VND):</label>
                  <input
                    type="number"
                    step="5000"
                    min="10000"
                    required
                    value={formMenuPrice}
                    onChange={(e) => setFormMenuPrice(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white outline-none focus:border-amber-500 font-black text-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Mục Tiêu Food Cost (%):</label>
                  <input
                    type="number"
                    step="0.5"
                    min="10"
                    max="50"
                    value={formTargetCostPct}
                    onChange={(e) => setFormTargetCostPct(parseFloat(e.target.value) || 28)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white outline-none focus:border-amber-500 font-bold"
                  />
                </div>
              </div>

              {/* Dynamic Ingredients list */}
              <div className="border border-slate-800 rounded-xl p-3 bg-slate-950/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-200">Định Lượng Nguyên Liệu Cấu Thành:</span>
                  <button
                    type="button"
                    onClick={handleAddIngredientRow}
                    className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" /> Thêm nguyên liệu
                  </button>
                </div>

                <div className="space-y-2">
                  {formIngredients.map((row, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                      <select
                        value={row.ingredientId}
                        onChange={(e) => handleUpdateIngredientRow(idx, e.target.value, row.quantity)}
                        className="flex-1 rounded-lg border border-slate-700 bg-slate-800 py-1 px-2 text-white outline-none"
                      >
                        {ingredients.map((i) => (
                          <option key={i.id} value={i.id}>
                            {i.name} ({i.unit})
                          </option>
                        ))}
                      </select>

                      <div className="w-24">
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={row.quantity}
                          onChange={(e) => handleUpdateIngredientRow(idx, row.ingredientId, parseFloat(e.target.value) || 0)}
                          placeholder="Số lượng"
                          className="w-full text-center rounded-lg border border-slate-700 bg-slate-800 py-1 font-bold text-amber-400"
                        />
                      </div>

                      <div className="w-28 text-right font-bold text-slate-200">
                        {row.calculatedCost.toLocaleString('vi-VN')} ₫
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveIngredientRow(idx)}
                        className="text-rose-400 hover:text-rose-300 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Live Cost Summary in Form */}
                <div className="mt-3 pt-2 border-t border-slate-800 flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-400">Tổng Giá Vốn (COGS):</span>
                  <span className="text-amber-400 text-sm">
                    {formIngredients.reduce((s, i) => s + i.calculatedCost, 0).toLocaleString('vi-VN')} ₫ 
                    {' '}({((formIngredients.reduce((s, i) => s + i.calculatedCost, 0) / formMenuPrice) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Ghi Chú Kỹ Thuật Chế Biến:</label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Nhiệt độ nướng, thời gian ủ bột, độ dày cắt lát..."
                  rows={2}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRecipeModal(false)}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-amber-500 px-5 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/30 hover:bg-amber-400"
                >
                  Lưu Công Thức Định Lượng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
