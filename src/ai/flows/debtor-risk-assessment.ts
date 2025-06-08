
// src/ai/flows/debtor-risk-assessment.ts
'use server';

/**
 * @fileOverview Assesses the risk associated with a debtor based on their payment behavior, credit score, and debt amount.
 *
 * - assessDebtorRisk - A function that assesses the risk associated with a debtor.
 * - DebtorRiskAssessmentInput - The input type for the assessDebtorRisk function.
 * - DebtorRiskAssessmentOutput - The return type for the assessDebtorRisk function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DebtorRiskAssessmentInputSchema = z.object({
  paymentBehavior: z
    .string()
    .describe(
      'Description of the debtor payment behavior like payment history and consistency.'
    ),
  creditScore: z
    .number()
    .optional()
    .describe('The credit score of the debtor, if available.'),
  debtAmount: z.number().describe('The total debt amount owed by the debtor.'),
  creditLimit: z.number().optional().describe('The credit limit assigned to the debtor.'),
});
export type DebtorRiskAssessmentInput = z.infer<typeof DebtorRiskAssessmentInputSchema>;

const DebtorRiskAssessmentOutputSchema = z.object({
  riskLevel: z
    .string()
    .describe(
      'مستوى المخاطرة المرتبط بالمدين (مثال: مرتفع، متوسط، منخفض). ' + 
      'ضع في اعتبارك سلوك السداد ومبلغ الدين ودرجة الائتمان عند تحديد المخاطر. ' +
      'إذا تم توفير حد ائتماني، فقم أيضًا بتقييم ما إذا كان مبلغ الدين يتجاوز الحد الائتماني. يجب أن يكون الناتج كلمة واحدة: مرتفع أو متوسط أو منخفض.'
    ),
  riskFactors: z
    .string()
    .describe(
      'العوامل الرئيسية التي تساهم في مستوى المخاطر المحدد، مع التبرير. يجب أن يكون الناتج باللغة العربية.'
    ),
  suggestedActions: z
    .string()
    .describe(
      'الإجراءات المقترحة لإدارة المدين بناءً على مستوى المخاطر لديه مثل تعديل الحد الائتماني أو الاتصال بالمدين. يجب أن يكون الناتج باللغة العربية.'
    ),
});
export type DebtorRiskAssessmentOutput = z.infer<typeof DebtorRiskAssessmentOutputSchema>;

export async function assessDebtorRisk(input: DebtorRiskAssessmentInput): Promise<DebtorRiskAssessmentOutput> {
  try {
    const result = await debtorRiskAssessmentFlow(input);
    return result;
  } catch (error) {
    console.error(`[Flow Error: assessDebtorRisk] ${error instanceof Error ? error.message : String(error)}`, {input, error});
    throw error;
  }
}

const prompt = ai.definePrompt({
  name: 'debtorRiskAssessmentPrompt',
  input: {schema: DebtorRiskAssessmentInputSchema},
  output: {schema: DebtorRiskAssessmentOutputSchema},
  prompt: `أنت مساعد ذكاء اصطناعي متخصص في تقييم مخاطر المدينين. الرجاء تقديم جميع الردود باللغة العربية.

  بناءً على سلوك السداد للمدين، ودرجة الائتمان (إن وجدت)، ومبلغ الدين، والحد الائتماني (إن وجد)، ستقوم بتقييم مستوى المخاطر المرتبط بالمدين.

  سلوك السداد: {{{paymentBehavior}}}
  درجة الائتمان: {{#if creditScore}}{{{creditScore}}}{{else}}غير متوفر{{/if}}
  مبلغ الدين: {{{debtAmount}}}
  الحد الائتماني: {{#if creditLimit}}{{{creditLimit}}}{{else}}غير متوفر{{/if}}

  مستوى المخاطرة: حدد مستوى المخاطرة (مرتفع، متوسط، منخفض) باللغة العربية بناءً على المعلومات المقدمة. اعتبر أن مبلغ الدين المرتفع مقارنة بالحد الائتماني هو عامل خطر كبير.
  عوامل المخاطرة: اذكر العوامل الرئيسية التي تساهم في مستوى المخاطرة المحدد باللغة العربية.
  الإجراءات المقترحة: قدم الإجراءات المقترحة لإدارة المدين بناءً على مستوى المخاطرة لديه باللغة العربية.
  `,
});

const debtorRiskAssessmentFlow = ai.defineFlow(
  {
    name: 'debtorRiskAssessmentFlow',
    inputSchema: DebtorRiskAssessmentInputSchema,
    outputSchema: DebtorRiskAssessmentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

