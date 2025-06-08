// debt-suggestions.ts
// 'use server';

/**
 * @fileOverview AI assistant for debt management, providing credit limit suggestions based on debtor data.
 *
 * - suggestCreditLimits - Analyzes debt data and suggests optimal credit limits for each debtor.
 * - SuggestCreditLimitsInput - Input type for the suggestCreditLimits function.
 * - SuggestCreditLimitsOutput - Output type for the suggestCreditLimits function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DebtorSchema = z.object({
  debtorName: z.string().describe('Name of the debtor'),
  paymentHistory: z.string().describe('Payment history of the debtor'),
  overallDebtAmount: z.number().describe('Overall debt amount owed by the debtor'),
  currentCreditLimit: z.number().describe('Current credit limit for the debtor'),
});

const SuggestCreditLimitsInputSchema = z.array(DebtorSchema).describe('Array of debtor objects with their debt information.');
export type SuggestCreditLimitsInput = z.infer<typeof SuggestCreditLimitsInputSchema>;

const CreditLimitSuggestionSchema = z.object({
  debtorName: z.string().describe('Name of the debtor'),
  suggestedCreditLimit: z.number().describe('Suggested credit limit for the debtor'),
  reasoning: z.string().describe('التبرير وراء اقتراح الحد الائتماني. يجب أن يكون هذا النص باللغة العربية.'),
});

const SuggestCreditLimitsOutputSchema = z.array(CreditLimitSuggestionSchema).describe('Array of credit limit suggestions for each debtor.');
export type SuggestCreditLimitsOutput = z.infer<typeof SuggestCreditLimitsOutputSchema>;

export async function suggestCreditLimits(input: SuggestCreditLimitsInput): Promise<SuggestCreditLimitsOutput> {
  try {
    const result = await suggestCreditLimitsFlow(input);
    return result;
  } catch (error) {
    console.error(`[Flow Error: suggestCreditLimits] ${error instanceof Error ? error.message : String(error)}`, {input, error});
    throw error;
  }
}

const prompt = ai.definePrompt({
  name: 'suggestCreditLimitsPrompt',
  input: {schema: SuggestCreditLimitsInputSchema},
  output: {schema: SuggestCreditLimitsOutputSchema},
  prompt: `أنت مساعد ذكاء اصطناعي متخصص في إدارة الديون وتقييم المخاطر.
قم بتحليل بيانات الديون المقدمة لكل مدين واقترح حدًا ائتمانيًا أمثل بناءً على تاريخ السداد ومبلغ الدين الإجمالي.
قدم تبريرًا واضحًا (حقل 'reasoning') لكل حد ائتماني مقترح، ويجب أن يكون هذا التبرير باللغة العربية.

بيانات المدينين: {{{json input}}}

بناءً على هذه البيانات، قدم مصفوفة من اقتراحات الحدود الائتمانية. تأكد من أن الاقتراحات تقلل المخاطر وتعظم العوائد.
قم بتنسيق ردك كمصفوفة JSON من كائنات CreditLimitSuggestion.
`,
});

const suggestCreditLimitsFlow = ai.defineFlow(
  {
    name: 'suggestCreditLimitsFlow',
    inputSchema: SuggestCreditLimitsInputSchema,
    outputSchema: SuggestCreditLimitsOutputSchema,
  },
  async (input: SuggestCreditLimitsInput) => {
    // تمرير المصفوفة مباشرة بدون غلاف object {input: ...}
    const {output} = await prompt(input);
    return output!;
  }
);

