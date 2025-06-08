
// 'use server';
/**
 * @fileOverview Generates a polite WhatsApp reminder message for a debtor who has exceeded their credit limit.
 *
 * - generateWhatsappReminder - A function that generates the WhatsApp reminder message.
 * - WhatsappReminderInput - The input type for the generateWhatsappReminder function.
 * - WhatsappReminderOutput - The return type for the generateWhatsappReminder function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { Transaction } from '@/types/debt';

const TransactionDetailSchema = z.object({
  date: z.string().describe('تاريخ المعاملة'),
  type: z.string().describe('نوع المعاملة (مثال: دين جديد, دفعة)'),
  amount: z.number().describe('مبلغ المعاملة'),
  description: z.string().optional().describe('وصف المعاملة'),
});

const WhatsappReminderInputSchema = z.object({
  debtorName: z.string().describe('اسم المدين'),
  amountOwed: z.number().describe('المبلغ الإجمالي المستحق على المدين'),
  creditLimit: z.number().describe('الحد الائتماني للمدين'),
  transactions: z.array(TransactionDetailSchema).describe('قائمة بمعاملات المدين التي أدت إلى الدين الحالي. يجب أن تكون باللغة العربية إذا كانت نصية. لا تتضمن الرصيد الافتتاحي.'),
  debtorPhoneNumber: z.string().optional().describe('رقم هاتف المدين لإدراجه في الرسالة إذا لزم الأمر'),
  businessName: z.string().describe('اسم البقالة أو الشركة المُرسلة للتذكير. هذا الاسم سيظهر في توقيع الرسالة.'),
});
export type WhatsappReminderInput = z.infer<typeof WhatsappReminderInputSchema>;

const WhatsappReminderOutputSchema = z.object({
  whatsappMessage: z.string().describe('رسالة التذكير الجاهزة للإرسال عبر واتساب باللغة العربية.'),
});
export type WhatsappReminderOutput = z.infer<typeof WhatsappReminderOutputSchema>;

export async function generateWhatsappReminder(input: WhatsappReminderInput): Promise<WhatsappReminderOutput> {
  try {
    const result = await whatsappReminderFlow(input);
    return result;
  } catch (error) {
    console.error(`[Flow Error: generateWhatsappReminder] ${error instanceof Error ? error.message : String(error)}`, {input, error});
    throw error;
  }
}

const prompt = ai.definePrompt({
  name: 'whatsappReminderPrompt',
  input: {schema: WhatsappReminderInputSchema},
  output: {schema: WhatsappReminderOutputSchema},
  prompt: `أنت مساعد ودود ومحترف. مهمتك هي إنشاء رسالة تذكير مهذبة عبر واتساب باللغة العربية للمدين التالي الذي تجاوز حده الائتماني.
لا تقم بتضمين أي معاملات من نوع 'رصيد افتتاحي' في الملخص.

اسم المدين: {{{debtorName}}}
المبلغ الإجمالي المستحق: {{{amountOwed}}} ريال
الحد الائتماني: {{{creditLimit}}} ريال
{{#if debtorPhoneNumber}}رقم هاتف المدين: {{{debtorPhoneNumber}}}{{/if}}

الرجاء تضمين العناصر التالية في الرسالة:
1.  تحية ودية للمدين باسمه.
2.  إشعار بأنه قد تجاوز حده الائتماني.
3.  ذكر المبلغ الإجمالي المستحق والحد الائتماني.
4.  ملخص موجز للمعاملات الرئيسية المقدمة لك التي ساهمت في الدين الحالي، مع التركيز على كيفية تراكم الدين. لا تذكر الرصيد الافتتاحي.
    المعاملات المقدمة (تمت تصفيتها لتشمل الديون الرئيسية):
    {{#each transactions}}
    - تاريخ: {{{date}}}, النوع: {{{type}}}, المبلغ: {{{amount}}} ريال{{#if description}}, الوصف: {{{description}}}{{/if}}
    {{/each}}
5.  طلب مهذب لسداد المبلغ المستحق أو جزء منه في أقرب وقت ممكن.
6.  خاتمة مناسبة مع ذكر اسم النشاط التجاري الخاص بك.

اجعل الرسالة واضحة وموجزة ومهنية. يجب أن تكون الرسالة بالكامل باللغة العربية.

مثال للخاتمة:
...
نشكر تعاونكم.
مع تحيات،
{{{businessName}}}
`,
});

const whatsappReminderFlow = ai.defineFlow(
  {
    name: 'whatsappReminderFlow',
    inputSchema: WhatsappReminderInputSchema,
    outputSchema: WhatsappReminderOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

// Helper function to select relevant transactions (e.g., last 5 debt-increasing ones, excluding initial balance)
export async function prepareTransactionsForReminder(transactions: Transaction[]): Promise<WhatsappReminderInput['transactions']> {
  return transactions
    .filter(tx => tx.type === 'new_credit' || tx.type === 'adjustment_increase') // Exclude 'initial_balance' and other non-debt increasing types
    .slice(-5) // Take last 5 relevant debt-increasing transactions
    .map(tx => {
      return {
        date: new Date(tx.date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' }),
        type: tx.type, 
        amount: tx.amount,
        description: tx.description,
      };
    });
}
