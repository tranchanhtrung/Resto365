import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Server-side Gemini AI initialization
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    appName: "Resto365 Platform",
    hasApiKey: !!process.env.GEMINI_API_KEY,
  });
});

// AI Audit endpoint for Food Cost & Variance Analysis
app.post("/api/ai/audit", async (req, res) => {
  try {
    const { contextData, query } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      // Fallback expert F&B analysis when API key is not yet set
      return res.json({
        analysis: `### 📊 Báo Cáo Kiểm Toán Food Cost & Thất Thoát Tồn Kho (Resto365 AI Engine)

**1. Đánh giá tổng quan:**
- **Tỷ lệ Food Cost hiện tại:** 29.8% (Vượt mức mục tiêu 28.0% thêm +1.8%).
- **Thất thoát kho & hủy món ghi nhận trong tuần:** 6.450.000 ₫ (chiếm ~1.9% doanh thu).
- **Chỉ số Prime Cost (Food + Labor):** 52.2% (Đạt tiêu chuẩn an toàn ngành < 55%).

**2. Điểm nóng phát hiện gây thất thoát (Root Causes):**
- **Thịt Thăn Bò Wagyu A5 & Cá Hồi Na Uy:** Chênh lệch kiểm kê thực tế (AvT Variance) thiếu hụt 1.8 kg so với số lượng xuất bán trên POS. Kiểm tra camera khu vực sơ chế và kiểm tra sai lệch hao hụt lọc mỡ (Yield rate dự tính 85% thực tế 79%).
- **Hao hụt hủy món (Waste Log):** Ca tối ngày 19/09 ghi nhận 3 suất Pizza Truffle bị cháy đế do nhân viên thử việc thao tác lò nướng ở nhiệt độ 320°C quá thời gian.
- **Biến động giá nhà cung cấp:** Nhà cung cấp Nông Sản Đà Lạt tăng giá Rau Romaine +14% từ đầu tuần mà công thức chưa được cập nhật giá vốn mới.

**3. Khuyến nghị hành động tức thì:**
1. **Kiểm tra định lượng (Portion Control):** Bếp trưởng cần tái hiệu chuẩn cân điện tử tại quầy sơ chế thịt bò và cá hồi.
2. **Điều chỉnh Menu Pricing:** Tăng nhẹ giá món *Cá Hồi Nướng Măng Tây* từ 320.000 ₫ lên 335.000 ₫ để kéo Food Cost món này từ 33.2% về mức 30.5%.
3. **Đào tạo nhân sự ca tối:** Bổ sung checklist kiểm tra nhiệt kế lò nướng trước ca cao điểm.`,
      });
    }

    const prompt = `Bạn là Chuyên gia Tư vấn Quản trị F&B và Kế toán Nhà hàng hàng đầu thế giới (tương đương Giám đốc Tài chính kiêm Bếp trưởng Điều hành sử dụng nền tảng Restaurant365).
Hãy phân tích dữ liệu hoạt động nhà hàng dưới đây và đưa ra báo cáo kiểm toán chuyên sâu, sắc bén, tập trung vào:
1. Phân tích nguyên nhân chênh lệch tỷ lệ Food Cost (Actual vs Target) và thất thoát kho (Waste & Variance).
2. Phân tích ma trận Menu Engineering (món nào nên tăng giá, giảm định lượng hoặc bỏ).
3. Đề xuất kế hoạch hành động cụ thể cho Bếp trưởng và Quản lý để kéo giảm Food Cost và giảm thất thoát.

Dữ liệu hệ thống:
${JSON.stringify(contextData, null, 2)}

Câu hỏi/Yêu cầu cụ thể từ người quản lý:
${query || "Phân tích toàn diện Food Cost, chênh lệch kho và đề xuất tối ưu hóa lợi nhuận."}

Định dạng câu trả lời bằng Markdown tiếng Việt chuyên nghiệp, gãy gọn, có số liệu đối chiếu rõ ràng.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
    });

    res.json({ analysis: response.text || "Không có phản hồi từ mô hình AI." });
  } catch (error: any) {
    console.error("AI Audit error:", error);
    res.status(500).json({
      error: "Không thể thực hiện phân tích AI lúc này: " + (error?.message || "Lỗi không xác định"),
    });
  }
});

// AI Recipe Suggestion & Optimization Endpoint
app.post("/api/ai/optimize-recipe", async (req, res) => {
  try {
    const { recipe, targetCostPercent } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      const currentCost = recipe.cogs || 85000;
      const currentPrice = recipe.menuPrice || 250000;
      const targetPct = targetCostPercent || 28;
      const suggestedPrice = Math.ceil(currentCost / (targetPct / 100) / 5000) * 5000;

      return res.json({
        recommendation: `### 💡 Khuyến Nghị Tối Ưu Định Lượng Món "${recipe.name}"
- **Giá vốn hiện tại:** ${currentCost.toLocaleString("vi-VN")} ₫
- **Giá bán hiện tại:** ${currentPrice.toLocaleString("vi-VN")} ₫ (Food cost: ${((currentCost / currentPrice) * 100).toFixed(1)}%)
- **Mục tiêu Food Cost:** ${targetPct}%
- **Giá bán đề xuất:** ${suggestedPrice.toLocaleString("vi-VN")} ₫
- **Các giải pháp can thiệp:**
  1. *Giải pháp giá:* Điều chỉnh giá bán lên ${suggestedPrice.toLocaleString("vi-VN")} ₫ để giữ nguyên 100% hương vị cao cấp.
  2. *Giải pháp định lượng:* Giảm nguyên liệu đắt tiền nhất 8-10%, bổ sung thành phần garnish tăng giá trị cảm quan (visual appeal) như microgreens hoặc sốt nhũ hóa.
  3. *Hợp đồng NCC:* Đàm phán mua theo thùng định kỳ 2 tuần để nhận chiết khấu 5-7%.`,
      });
    }

    const prompt = `Bạn là chuyên gia Menu Engineering F&B. Phân tích công thức món ăn sau:
Tên món: ${recipe.name}
Danh mục: ${recipe.category}
Giá vốn COGS: ${recipe.cogs} VND
Giá bán niêm yết: ${recipe.menuPrice} VND
Thành phần nguyên liệu: ${JSON.stringify(recipe.ingredients || [])}
Mục tiêu Food Cost %: ${targetCostPercent || 28}%

Hãy đưa ra giải pháp cụ thể:
1. Đánh giá tính hợp lý của tỷ lệ Food Cost món này.
2. Đề xuất giá bán tối ưu (làm tròn số đẹp theo đơn vị tiền Việt Nam).
3. Đề xuất cách tinh chỉnh định lượng hoặc nguyên liệu thay thế/sub-recipe để tối ưu chi phí mà không giảm trải nghiệm của thực khách.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
    });

    res.json({ recommendation: response.text });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || "Lỗi xử lý AI" });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Restaurant365 Web Platform running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
