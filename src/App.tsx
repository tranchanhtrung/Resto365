import React, { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { InventoryView } from './components/InventoryView';
import { RecipeCostingView } from './components/RecipeCostingView';
import { AccountingView } from './components/AccountingView';
import { LaborView } from './components/LaborView';
import { AIAuditorView } from './components/AIAuditorView';
import { 
  INITIAL_INGREDIENTS, 
  INITIAL_RECIPES, 
  INITIAL_WASTE_RECORDS, 
  INITIAL_PHYSICAL_COUNTS, 
  INITIAL_PURCHASE_INVOICES, 
  INITIAL_SHIFTS, 
  INITIAL_PL_DATA 
} from './data/mockData';
import { 
  ActiveModule, 
  Ingredient, 
  Recipe, 
  WasteRecord, 
  PhysicalCountSession, 
  LaborShift, 
  PurchaseInvoice,
  RestaurantPL 
} from './types';
import { 
  LayoutDashboard, 
  Boxes, 
  UtensilsCrossed, 
  ReceiptText, 
  Users2, 
  Sparkles 
} from 'lucide-react';

export default function App() {
  const [activeModule, setActiveModule] = useState<ActiveModule>('dashboard');
  const [currentLocation, setCurrentLocation] = useState('loc-1');
  const [currentPeriod, setCurrentPeriod] = useState('Tháng 9/2026 (Tuần 3)');

  // App Master States
  const [ingredients, setIngredients] = useState<Ingredient[]>(INITIAL_INGREDIENTS);
  const [recipes, setRecipes] = useState<Recipe[]>(INITIAL_RECIPES);
  const [wasteRecords, setWasteRecords] = useState<WasteRecord[]>(INITIAL_WASTE_RECORDS);
  const [physicalCounts, setPhysicalCounts] = useState<PhysicalCountSession[]>(INITIAL_PHYSICAL_COUNTS);
  const [invoices, setInvoices] = useState<PurchaseInvoice[]>(INITIAL_PURCHASE_INVOICES);
  const [shifts, setShifts] = useState<LaborShift[]>(INITIAL_SHIFTS);
  const [plData, setPlData] = useState<RestaurantPL>(INITIAL_PL_DATA);

  // AI Auditor jump prompt
  const [aiPrompt, setAiPrompt] = useState<string>('');

  // Handlers
  const handleOpenAIAssistant = (prompt?: string) => {
    if (prompt) {
      setAiPrompt(prompt);
    }
    setActiveModule('ai_auditor');
  };

  const handleOpenQuickAction = (action: 'waste' | 'inventory_count' | 'recipe' | 'invoice') => {
    if (action === 'waste' || action === 'inventory_count' || action === 'invoice') {
      setActiveModule('inventory');
    } else if (action === 'recipe') {
      setActiveModule('recipe_costing');
    }
  };

  const handleAddWasteRecord = (newWaste: Omit<WasteRecord, 'id' | 'timestamp'>) => {
    const record: WasteRecord = {
      ...newWaste,
      id: `wst-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setWasteRecords([record, ...wasteRecords]);

    // Recalculate P&L with increased waste/COGS
    setPlData((prev) => {
      const newCOGS = prev.totalCOGS + newWaste.totalCost;
      const newFoodCostPct = (newCOGS / prev.totalSales) * 100;
      const newPrimeCost = newCOGS + prev.totalLaborCost;
      const newPrimeCostPct = (newPrimeCost / prev.totalSales) * 100;
      const newNetProfit = prev.totalSales - newCOGS - prev.totalLaborCost - prev.totalOperatingExpenses;
      const newNetProfitPct = (newNetProfit / prev.totalSales) * 100;

      return {
        ...prev,
        totalCOGS: newCOGS,
        foodCostPct: newFoodCostPct,
        primeCost: newPrimeCost,
        primeCostPct: newPrimeCostPct,
        netProfit: newNetProfit,
        netProfitPct: newNetProfitPct,
      };
    });
  };

  const handleUpdateIngredientStock = (ingredientId: string, newStock: number) => {
    setIngredients((prev) =>
      prev.map((item) =>
        item.id === ingredientId ? { ...item, currentStock: newStock } : item
      )
    );
  };

  const handleAddPhysicalCount = (newCount: PhysicalCountSession) => {
    setPhysicalCounts([newCount, ...physicalCounts]);
  };

  const handleAddRecipe = (newRecipe: Recipe) => {
    setRecipes([...recipes, newRecipe]);
  };

  const handleUpdateRecipe = (updatedRecipe: Recipe) => {
    setRecipes((prev) =>
      prev.map((r) => (r.id === updatedRecipe.id ? updatedRecipe : r))
    );
  };

  const handleAddShift = (newShift: LaborShift) => {
    setShifts([newShift, ...shifts]);
    setPlData((prev) => {
      const newLabor = prev.totalLaborCost + newShift.totalCost;
      const newLaborCostPct = (newLabor / prev.totalSales) * 100;
      const newPrimeCost = prev.totalCOGS + newLabor;
      const newPrimeCostPct = (newPrimeCost / prev.totalSales) * 100;
      const newNetProfit = prev.totalSales - prev.totalCOGS - newLabor - prev.totalOperatingExpenses;
      const newNetProfitPct = (newNetProfit / prev.totalSales) * 100;

      return {
        ...prev,
        totalLaborCost: newLabor,
        laborCostPct: newLaborCostPct,
        primeCost: newPrimeCost,
        primeCostPct: newPrimeCostPct,
        netProfit: newNetProfit,
        netProfitPct: newNetProfitPct,
      };
    });
  };

  const totalWaste = wasteRecords.reduce((sum, w) => sum + w.totalCost, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-amber-500 selection:text-slate-950">
      {/* Top Header Navigation */}
      <Header
        selectedLocation={currentLocation}
        onSelectLocation={setCurrentLocation}
        onOpenAIAssistant={handleOpenAIAssistant}
        onOpenQuickAction={handleOpenQuickAction}
        wasteTotal={totalWaste}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Left Sidebar */}
        <div className="hidden md:block">
          <Sidebar
            activeModule={activeModule}
            onChangeModule={setActiveModule}
            foodCostPct={plData.foodCostPct}
            wasteTotal={totalWaste}
          />
        </div>

        {/* Content View Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {activeModule === 'dashboard' && (
            <DashboardView
              plData={plData}
              recipes={recipes}
              wasteRecords={wasteRecords}
              physicalCounts={physicalCounts}
              ingredients={ingredients}
              onNavigate={setActiveModule}
              onOpenAIAssistant={handleOpenAIAssistant}
            />
          )}

          {activeModule === 'inventory' && (
            <InventoryView
              ingredients={ingredients}
              physicalCounts={physicalCounts}
              wasteRecords={wasteRecords}
              invoices={invoices}
              onAddWasteRecord={handleAddWasteRecord}
              onUpdateIngredientStock={handleUpdateIngredientStock}
              onAddPhysicalCount={handleAddPhysicalCount}
              onOpenAIAssistant={handleOpenAIAssistant}
            />
          )}

          {activeModule === 'recipe_costing' && (
            <RecipeCostingView
              recipes={recipes}
              ingredients={ingredients}
              onAddRecipe={handleAddRecipe}
              onUpdateRecipe={handleUpdateRecipe}
              onOpenAIAssistant={handleOpenAIAssistant}
            />
          )}

          {activeModule === 'accounting' && (
            <AccountingView
              plData={plData}
              invoices={invoices}
              onOpenAIAssistant={handleOpenAIAssistant}
            />
          )}

          {activeModule === 'labor' && (
            <LaborView
              shifts={shifts}
              onAddShift={handleAddShift}
              onOpenAIAssistant={handleOpenAIAssistant}
            />
          )}

          {activeModule === 'ai_auditor' && (
            <AIAuditorView
              plData={plData}
              ingredients={ingredients}
              recipes={recipes}
              wasteRecords={wasteRecords}
              physicalCounts={physicalCounts}
              initialPrompt={aiPrompt}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-slate-800 bg-slate-950/95 p-2 backdrop-blur-md">
        <button
          onClick={() => setActiveModule('dashboard')}
          className={`flex flex-col items-center py-1 px-2 text-[10px] font-bold ${
            activeModule === 'dashboard' ? 'text-amber-400' : 'text-slate-400'
          }`}
        >
          <LayoutDashboard className="h-4 w-4" />
          <span>Tổng Quan</span>
        </button>

        <button
          onClick={() => setActiveModule('inventory')}
          className={`flex flex-col items-center py-1 px-2 text-[10px] font-bold ${
            activeModule === 'inventory' ? 'text-amber-400' : 'text-slate-400'
          }`}
        >
          <Boxes className="h-4 w-4" />
          <span>Kho & Hủy</span>
        </button>

        <button
          onClick={() => setActiveModule('recipe_costing')}
          className={`flex flex-col items-center py-1 px-2 text-[10px] font-bold ${
            activeModule === 'recipe_costing' ? 'text-amber-400' : 'text-slate-400'
          }`}
        >
          <UtensilsCrossed className="h-4 w-4" />
          <span>Định Lượng</span>
        </button>

        <button
          onClick={() => setActiveModule('accounting')}
          className={`flex flex-col items-center py-1 px-2 text-[10px] font-bold ${
            activeModule === 'accounting' ? 'text-amber-400' : 'text-slate-400'
          }`}
        >
          <ReceiptText className="h-4 w-4" />
          <span>P&L</span>
        </button>

        <button
          onClick={() => setActiveModule('ai_auditor')}
          className={`flex flex-col items-center py-1 px-2 text-[10px] font-bold ${
            activeModule === 'ai_auditor' ? 'text-amber-400' : 'text-slate-400'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span>AI Audit</span>
        </button>
      </nav>
    </div>
  );
}
