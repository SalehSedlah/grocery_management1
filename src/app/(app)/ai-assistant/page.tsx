
"use client";

import { RiskAssessmentForm } from "@/components/ai-assistant/risk-assessment-form";
import { CreditSuggestionTool } from "@/components/ai-assistant/credit-suggestion-tool";

export default function AiAssistantPage() {
  const pageTitle = "المساعد الذكي"; 
  const pageDescription = "استفد من الذكاء الاصطناعي للحصول على رؤى واتخاذ قرارات مالية أفضل."; 

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-semibold text-foreground">{pageTitle}</h1>
        <p className="text-muted-foreground">{pageDescription}</p>
      </div>
      
      <RiskAssessmentForm />
      
      <CreditSuggestionTool />
    </div>
  );
}
