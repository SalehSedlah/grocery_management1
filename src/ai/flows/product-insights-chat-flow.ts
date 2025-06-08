// 'use server';

/**
 * AI chat assistant for product management insights.
 * - chatWithProductInsightsAI: Handles chat interactions about products.
 * - ProductInsightsChatInput: Input type for the chat function.
 * - ProductInsightsChatOutput: Return type for the chat function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { Product } from '@/types/grocery'; // Assuming Product type is defined here

// Schema for a single product expected by the AI
const AISingleProductSchema = z.object({
  id: z.string(),
  name: z.string().describe('اسم المنتج'),
  category: z.string().describe('فئة المنتج'),
  unit: z.string().describe('وحدة قياس المنتج (مثال: قطعة، كجم, كرتون, شوال)'),
  pricePerUnit: z.number().describe('سعر بيع الوحدة الواحدة من المنتج (الوحدة الرئيسية مثل الكرتون أو الشوال)'),
  purchasePricePerUnit: z.number().describe('سعر شراء الوحدة الواحدة من المنتج (الوحدة الرئيسية مثل الكرتون أو الشوال)'),
  currentStock: z.number().describe('الكمية الحالية المتوفرة في المخزون من المنتج (بالوحدة الرئيسية)'),
  lowStockThreshold: z.number().describe('حد المخزون المنخفض الذي عنده يتم التنبيه (بالوحدة الرئيسية)'),
  quantitySold: z.number().describe('الكمية المباعة من هذا المنتج (بالوحدة الرئيسية)'),
  expiryDate: z.string().optional().describe('تاريخ انتهاء صلاحية المنتج (YYYY-MM-DD), إن وجد'),
  piecesInUnit: z.number().optional().describe('عدد القطع الفرعية داخل الوحدة الرئيسية, إن وجد (مثال: عدد العلب في الكرتون، أو عدد الأكياس الصغيرة في الشوال)'),
});

const ProductInsightsChatInputSchema = z.object({
  question: z.string().describe('سؤال المستخدم حول المنتجات باللغة العربية'),
  products: z.array(AISingleProductSchema).describe('قائمة بجميع المنتجات الحالية في المخزن مع تفاصيلها'),
  businessName: z.string().optional().describe('اسم النشاط التجاري للمستخدم'),
});

export type ProductInsightsChatInput = z.infer<typeof ProductInsightsChatInputSchema>;

const ProductInsightsChatOutputSchema = z.object({
  answer: z.string().describe('إجابة الذكاء الاصطناعي على سؤال المستخدم باللغة العربية. يجب أن تكون الإجابة مفصلة ومفيدة.'),
});

export type ProductInsightsChatOutput = z.infer<typeof ProductInsightsChatOutputSchema>;

/**
 * Main exported function to handle the chat request.
 * يتأكد من وجود بيانات منتجات قبل الاستدعاء، ويعالج الأخطاء.
 */
export async function chatWithProductInsightsAI(input: ProductInsightsChatInput): Promise<ProductInsightsChatOutput> {
  if (!input.products || input.products.length === 0) {
    return { answer: "لا توجد بيانات منتجات متاحة حاليًا للإجابة على سؤالك. يرجى إضافة بعض المنتجات أولاً." };
  }

  try {
    return await productInsightsChatFlow(input);
  } catch (error) {
    console.error(`[Error: chatWithProductInsightsAI]`, {
      input,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { answer: "عذرًا، حدث خطأ أثناء محاولة معالجة طلبك. يرجى المحاولة مرة أخرى لاحقًا." };
  }
}

// تعريف البرومبت مع التعليمات التفصيلية
const prompt = ai.definePrompt({
  name: 'productInsightsChatPrompt',
  input: { schema: ProductInsightsChatInputSchema },
  output: { schema: ProductInsightsChatOutputSchema },
  prompt: `
أنت مساعد ذكاء اصطناعي خبير في إدارة منتجات البقالة. مهمتك هي تحليل بيانات المنتجات المقدمة والإجابة على أسئلة صاحب المتجر باللغة العربية.
اسم المتجر هو: {{#if businessName}}{{{businessName}}}{{else}}المتجر{{/if}}.

سؤال المستخدم: "{{{question}}}"

بيانات المنتجات الحالية:
{{{json products}}}

تاريخ اليوم: {{currentDate}}

إرشادات لك:
1. قدم إجابات واضحة، دقيقة، ومفيدة باللغة العربية.
2. استخدم بيانات المنتجات المقدمة فقط في تحليلاتك. لا تخترع بيانات.
3. **حساب الأرباح وأسعار القطع من بيانات المنتج المخزنة:**
    - الربح المحتمل للمنتج = (سعر البيع - سعر الشراء) × الكمية في المخزون.
    - إذا كان هناك \`piecesInUnit\` > 0، احسب سعر وربح القطعة الفرعية ووضح الحساب.
4. **تحليل سيناريوهات المستخدم للأسعار والكمية مع شرح تفصيلي.**
5. **تحديد المنتجات الأكثر ربحية (3-5 منتجات)، مع توضيح الربح.**
6. **شرح مبيعات القطع الفردية وتأثيرها على المخزون بناءً على \`piecesInUnit\`.**
7. **الرد على طلبات التقارير وبيان حدود النظام.**
8. **التنبيه على المنتجات منخفضة المخزون ومنتهية الصلاحية مقارنة بالتاريخ الحالي.**
9. طلب توضيح إذا كان السؤال غير واضح.
10. كن ودودًا واحترافيًا.

الآن، يرجى الإجابة على سؤال المستخدم.
`,
});

const productInsightsChatFlow = ai.defineFlow(
  {
    name: 'productInsightsChatFlow',
    inputSchema: ProductInsightsChatInputSchema,
    outputSchema: ProductInsightsChatOutputSchema,
  },
  async (input) => {
    console.log('[Flow] Input received:', JSON.stringify(input, null, 2));
    
    const promptInput = {
      ...input,
      currentDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    };

    try {
      const { output, usage } = await prompt(promptInput);

      if (!output || typeof output.answer !== 'string' || output.answer.trim() === '') {
        console.error('[Flow] Invalid or empty answer from prompt.', { output, usage });

        // ======= التحقق من وجود الرد الخام بشكل آمن =======
        if (usage && typeof usage === 'object') {
          const rawResponse = usage.custom?.rawResponse;
          if (rawResponse && typeof rawResponse === 'object') {
            const candidates = (rawResponse as any).candidates;
            if (Array.isArray(candidates) && candidates.length > 0) {
              const rawText = candidates[0]?.content?.parts?.[0]?.text;
              if (typeof rawText === 'string') {
                console.error('[Flow] Raw model response:', rawText);
              }
            }
          }
        }
        // ===============================================

        throw new Error('لم يتم الحصول على إجابة صحيحة من النموذج.');
      }

      console.log('[Flow] Output generated successfully.');
      return output;
    } catch (error) {
      console.error(`[Flow] Error in prompt execution:`, {
        input: promptInput,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }
);
