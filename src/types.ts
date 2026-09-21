export type StorageArea = 
  | 'cold_freezer'   // Kho Đông
  | 'cold_chiller'   // Kho Mát
  | 'dry_storage'    // Kho Khô
  | 'bar_cellar'     // Quầy Bar & Hầm Rượu
  | 'prep_kitchen';  // Khu Sơ Chế

export type IngredientCategory = 
  | 'meat_poultry'
  | 'seafood'
  | 'vegetables'
  | 'dairy_eggs'
  | 'spices_dry'
  | 'beverages'
  | 'packaging';

export interface Ingredient {
  id: string;
  code: string;
  name: string;
  category: IngredientCategory;
  storageArea: StorageArea;
  unit: string;
  costPerUnit: number;
  previousCost: number;
  currentStock: number;
  parLevel: number; // Mức tồn an toàn tối thiểu
  reorderPoint: number;
  yieldRate: number; // Tỷ lệ thu hồi sau sơ chế (vd: 0.85 = 85%)
  supplierName: string;
  lastRestockedDate: string;
  expiryDate: string;
}

export interface RecipeIngredient {
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  unitCost: number;
  yieldRate: number;
  calculatedCost: number;
}

export type BostonMatrixCategory = 'STAR' | 'PLOWHORSE' | 'PUZZLE' | 'DOG';

export interface Recipe {
  id: string;
  name: string;
  category: 'main_course' | 'appetizer' | 'hotpot_soup' | 'beverage' | 'dessert';
  portions: number;
  prepTimeMinutes: number;
  menuPrice: number;
  targetFoodCostPct: number;
  cogs: number;
  actualFoodCostPct: number;
  contributionMargin: number; // menuPrice - cogs
  ingredients: RecipeIngredient[];
  salesVolumeWeek: number; // Số lượng bán / tuần
  matrixCategory: BostonMatrixCategory;
  suggestedPrice?: number;
  imageUrl?: string;
  notes?: string;
}

export type WasteReason = 
  | 'burnt_cooked'     // Cháy / hỏng khi chế biến
  | 'expired'          // Quá hạn sử dụng
  | 'dropped_spilled'  // Rơi vỡ / đổ
  | 'prep_trim_loss'   // Hao hụt lọc sơ chế vượt định mức
  | 'customer_return'  // Khách trả lại / đổi món
  | 'staff_sampling';  // Nhân viên thử món / training

export interface WasteRecord {
  id: string;
  timestamp: string;
  itemId: string;
  itemName: string;
  category: 'raw_ingredient' | 'finished_dish';
  quantity: number;
  unit: string;
  costPerUnit: number;
  totalCost: number;
  reason: WasteReason;
  shift: 'Ca Sáng' | 'Ca Chiều' | 'Ca Tối';
  reportedBy: string;
  notes: string;
}

export interface InventoryCountItem {
  ingredientId: string;
  ingredientName: string;
  unit: string;
  costPerUnit: number;
  theoreticalQty: number; // Tồn sổ sách POS/Hệ thống
  countedQty: number;     // Tồn thực tế kiểm kê
  varianceQty: number;    // counted - theoretical
  varianceCost: number;   // varianceQty * costPerUnit
  status: 'balanced' | 'surplus' | 'shortage' | 'critical';
}

export interface PhysicalCountSession {
  id: string;
  date: string;
  storageArea: StorageArea;
  countedBy: string;
  totalVarianceCost: number;
  status: 'draft' | 'completed' | 'reconciled';
  items: InventoryCountItem[];
}

export interface PurchaseInvoiceItem {
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  oldPrice: number;
  priceDiffPercent: number;
  lineTotal: number;
}

export interface PurchaseInvoice {
  id: string;
  invoiceNumber: string;
  supplierName: string;
  date: string;
  dueDate: string;
  totalAmount: number;
  status: 'pending' | 'received' | 'paid';
  items: PurchaseInvoiceItem[];
  notes?: string;
}

export interface LaborShift {
  id: string;
  employeeName: string;
  role: string;
  department: 'kitchen' | 'front_of_house' | 'bar' | 'management';
  date: string;
  startTime: string;
  endTime: string;
  scheduledHours: number;
  actualHours: number;
  hourlyRate: number;
  regularPay: number;
  overtimeHours: number;
  overtimePay: number;
  totalCost: number;
  status: 'scheduled' | 'checked_in' | 'completed';
}

export interface RestaurantPL {
  period: string;
  foodSales: number;
  beverageSales: number;
  totalSales: number;
  
  // COGS Calculation: Beginning + Purchases - Ending
  beginningInventory: number;
  purchases: number;
  endingInventory: number;
  totalCOGS: number;
  foodCostPct: number; // target: 28-32%
  
  // Labor Cost
  kitchenLabor: number;
  fohLabor: number;
  managementLabor: number;
  totalLaborCost: number;
  laborCostPct: number; // target: 20-25%
  
  // Prime Cost = COGS + Labor
  primeCost: number;
  primeCostPct: number; // target: < 55-60%
  
  // Operating & Fixed Expenses
  rentOccupancy: number;
  utilities: number;
  marketing: number;
  repairsSupplies: number;
  totalOperatingExpenses: number;
  
  // Profit
  ebitda: number;
  ebitdaPct: number;
  netProfit: number;
  netProfitPct: number;
}

export type ActiveModule = 
  | 'dashboard'
  | 'inventory'
  | 'recipe_costing'
  | 'accounting'
  | 'labor'
  | 'ai_auditor';
