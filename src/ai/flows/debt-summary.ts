
'use server'

/**
 * @fileOverview AI flow to provide a summary of total debts, breakdown by debtor, and overall risk assessment.
 *
 * - getDebtSummary - A function that returns the debt summary.
 * - DebtSummaryInput - The input type for the getDebtSummary function.
 * - DebtSummaryOutput - The return type for the getDebtSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DebtSummaryInputSchema = z.object({
  totalDebt: z.number().describe('The total debt amount.'),
  numberOfDebtors: z.number().describe('The number of debtors.'),
  averageDebtPerDebtor: z.number().describe('The average debt per debtor.'),
  largestDebt: z.number().describe('The largest single debt amount.'),
  creditLimitUtilization: z
    .number()
    .describe(
      'The percentage of total credit limit that is currently utilized.'
    ),
});
export type DebtSummaryInput = z.infer<typeof DebtSummaryInputSchema>;

const DebtSummaryOutputSchema = z.object({
  summary: z.string().describe('ملخص لوضع الدين الإجمالي. يجب أن يكون هذا النص باللغة العربية.'),
  riskAssessment: z
    .string()
    .describe('تقييم لمستوى المخاطر الإجمالي. يجب أن يكون هذا النص باللغة العربية.'),
  recommendations: z
    .string()
    .describe('توصيات لإدارة الدين. يجب أن يكون هذا النص باللغة العربية.'),
});
export type DebtSummaryOutput = z.infer<typeof DebtSummaryOutputSchema>;

export async function getDebtSummary(input: DebtSummaryInput): Promise<DebtSummaryOutput> {
  try {
    const result = await debtSummaryFlow(input);
    return result;
  } catch (error) {
    console.error(`[Flow Error: getDebtSummary] ${error instanceof Error ? error.message : String(error)}`, {input, error});
    throw error; // Re-throw the error to be handled by the caller or Next.js error boundaries
  }
}

const prompt = ai.definePrompt({
  name: 'debtSummaryPrompt',
  input: {schema: DebtSummaryInputSchema},
  output: {schema: DebtSummaryOutputSchema},
  prompt: `أنت مستشار مالي متخصص في تقديم ملخصات الديون وتقييمات المخاطر. الرجاء تقديم جميع الردود باللغة العربية.

  بناءً على المعلومات التالية، قدم ملخصًا لوضع الدين الإجمالي، وتقييمًا للمخاطر، وتوصيات لإدارة الدين.

  إجمالي الدين: {{{totalDebt}}}
  عدد المدينين: {{{numberOfDebtors}}}
  متوسط الدين لكل مدين: {{{averageDebtPerDebtor}}}
  أكبر دين: {{{largestDebt}}}
  نسبة استخدام الحد الائتماني: {{{creditLimitUtilization}}}%
  `,
});

const debtSummaryFlow = ai.defineFlow(
  {
    name: 'debtSummaryFlow',
    inputSchema: DebtSummaryInputSchema,
    outputSchema: DebtSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

