
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useProducts } from "@/contexts/products-context";
import { useAuth } from "@/contexts/auth-context";
import { chatWithProductInsightsAI, type ProductInsightsChatInput, type ProductInsightsChatOutput } from "@/ai/flows/product-insights-chat-flow";
import { Bot, User, Send, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
}

export function ProductAIChatInterface() {
  const { products, loadingProducts } = useProducts();
  const { businessName } = useAuth();
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const placeholderText = "اطرح سؤالاً عن منتجاتك (مثال: ما هي المنتجات الأقل مخزوناً؟)";
  const submitButtonText = "إرسال";
  const loadingText = "يفكر الذكاء الاصطناعي...";
  const initialGreeting = "مرحباً! أنا مساعدك الذكي لإدارة المنتجات. كيف يمكنني مساعدتك اليوم بخصوص منتجاتك؟";

  const handleSendMessage = async () => {
    if (!question.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString() + "-user",
      sender: "user",
      text: question,
    };
    setChatHistory((prev) => [...prev, userMessage]);
    setQuestion("");
    setIsLoading(true);

    try {
      const aiInput: ProductInsightsChatInput = {
        question: userMessage.text,
        products: products.map(p => ({ // Map to AI schema
            id: p.id,
            name: p.name,
            category: p.category,
            unit: p.unit,
            pricePerUnit: p.pricePerUnit,
            purchasePricePerUnit: p.purchasePricePerUnit,
            currentStock: p.currentStock,
            lowStockThreshold: p.lowStockThreshold,
            quantitySold: p.quantitySold,
            expiryDate: p.expiryDate,
            piecesInUnit: p.piecesInUnit,
        })),
        businessName: businessName || undefined,
      };
      
      const aiResponse: ProductInsightsChatOutput = await chatWithProductInsightsAI(aiInput);
      
      const aiMessage: ChatMessage = {
        id: Date.now().toString() + "-ai",
        sender: "ai",
        text: aiResponse.answer,
      };
      setChatHistory((prev) => [...prev, aiMessage]);

    } catch (error) {
      console.error("Error calling AI chat flow:", error);
      const errorMessage: ChatMessage = {
        id: Date.now().toString() + "-error",
        sender: "ai",
        text: "عذرًا، حدث خطأ أثناء محاولة التواصل مع المساعد الذكي. يرجى المحاولة مرة أخرى.",
      };
      setChatHistory((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Display initial greeting if chat history is empty and not loading
  const displayChatHistory = chatHistory.length === 0 && !isLoading 
    ? [{ id: "initial-greeting", sender: "ai", text: initialGreeting } as ChatMessage] 
    : chatHistory;


  if (loadingProducts) {
    return (
        <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-1/3" />
        </div>
    );
  }


  return (
    <div className="flex flex-col h-[400px] border rounded-md p-4 bg-background shadow">
      <ScrollArea className="flex-1 mb-4 pr-3">
        <div className="space-y-4">
          {displayChatHistory.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${
                message.sender === "user" ? "justify-end" : ""
              }`}
            >
              {message.sender === "ai" && (
                <div className="p-2 rounded-full bg-primary/20 text-primary">
                  <Bot size={20} />
                </div>
              )}
              <div
                className={`max-w-[75%] rounded-lg p-3 text-sm ${
                  message.sender === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                {message.text.split('\n').map((line, index) => (
                  <span key={index}>{line}<br/></span>
                ))}
              </div>
              {message.sender === "user" && (
                 <div className="p-2 rounded-full bg-secondary text-secondary-foreground">
                  <User size={20} />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-primary/20 text-primary">
                <Bot size={20} />
              </div>
              <div className="max-w-[75%] rounded-lg p-3 text-sm bg-muted">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{loadingText}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="flex items-center gap-2">
        <Input
          type="text"
          placeholder={placeholderText}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && !isLoading && handleSendMessage()}
          disabled={isLoading || loadingProducts}
          className="flex-1"
        />
        <Button onClick={handleSendMessage} disabled={isLoading || loadingProducts || !question.trim()}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send size={18} />}
          <span className="mr-2 rtl:ml-2 rtl:mr-0 hidden sm:inline">{submitButtonText}</span>
        </Button>
      </div>
    </div>
  );
}
