import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import type { ArticleRequest } from '../types';

// Select  api_key1 or api_key2 randomly here
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY environment variable is not set. Please ensure it is configured.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const generateArticleContent = async (request: ArticleRequest): Promise<string> => {
  if (!API_KEY) {
    throw new Error("کلید API برای Gemini تنظیم نشده است. لطفا از طریق متغیرهای محیطی آن را تنظیم کنید.");
  }
  
  const model = ai.models;

  let prompt = `
شما یک نویسنده متخصص سئو و تولید محتوای بسیار با کیفیت هستید.
وظیفه شما نوشتن یک مقاله کامل، جامع، بسیار با کیفیت و کاملاً بهینه شده برای موتورهای جستجو (SEO-friendly) به زبان فارسی است.
کاربر نهایی باید این مقاله را به عنوان یک محتوای درجه یک و عالی ارزیابی کند.

موضوع مقاله: "${request.topic}"`;

  if (request.keyword && request.keyword.trim() !== "") {
    prompt += `
کلمه کلیدی اصلی مقاله: "${request.keyword}"
مقاله باید عمیقاً حول محور کلمه کلیدی اصلی ("${request.keyword}") نوشته شود و آن را به بهترین شکل ممکن پوشش دهد. از کلمه کلیدی اصلی به طور طبیعی و با چگالی مناسب در سراسر مقاله، به خصوص در تیترها، مقدمه و نتیجه‌گیری استفاده کن. همچنین، در صورت امکان، از کلمات کلیدی مرتبط (LSI keywords) و هم‌معنی با کلمه کلیدی اصلی نیز به طور طبیعی در متن استفاده کن تا به درک بهتر موضوع توسط موتورهای جستجو کمک شود.`;
  } else {
    prompt += `
مقاله باید به طور جامع موضوع اصلی را پوشش دهد و نکات کلیدی آن را برجسته نماید.`
  }

  prompt += `
لحن مقاله: ${request.tone}
تعداد کلمات مقاله: تقریبا ${request.wordCount} کلمه. تلاش کن تا محتوای عمیق و کاملی در این محدوده ارائه دهی.`;

  prompt += `

**دستورالعمل‌های حیاتی برای کیفیت و سئو:**
1.  **ساختار و خوانایی**: مقاله باید دارای مقدمه جذاب و گیرا، بدنه اصلی با پاراگراف‌بندی منطقی، منسجم و خوانا، و نتیجه‌گیری کامل و تاثیرگذار باشد. هر پاراگراف باید بر یک ایده اصلی متمرکز باشد.
2.  **تیترگذاری حرفه‌ای (برای سئو و خوانایی)**: برای ایجاد ساختار بهتر در مقاله، از عناوین و زیرعناوین با استفاده از علامت # (مانند "# عنوان اصلی مقاله [شامل کلمه کلیدی اصلی در صورت امکان]" یا "## عنوان فرعی مرتبط" یا "### عنوان خیلی فرعی جزئی‌تر") برای بخش‌های مختلف مقاله استفاده کن. تیترها باید جذاب و توصیفی باشند و به کاربر کمک کنند تا به سرعت محتوای مورد نظر خود را پیدا کند.
3.  **محتوای منحصر به فرد و ارزشمند**: از ارائه محتوای تکراری، کپی شده، بی‌معنی یا اطلاعات نادرست و سطحی به شدت خودداری کن. مقاله باید کاملاً منحصر به فرد (unique) باشد و اطلاعات دقیق، بروز، مفید و کاربردی به خواننده ارائه دهد.
4.  **جذابیت و تعامل**: مقاله باید به گونه‌ای نوشته شود که برای خواننده جذاب باشد و او را به خواندن تا انتها ترغیب کند.
5.  **پرهیز از Keyword Stuffing**: از تکرار بیش از حد و غیرطبیعی کلمه کلیدی اصلی و کلمات مرتبط خودداری کن. استفاده از کلمات کلیدی باید کاملاً طبیعی و در خدمت محتوا باشد.
6.  **خروجی تمیز**: مقاله را به صورت متن خام و روان، بدون هیچگونه قالب‌بندی اضافی دیگری (مانند HTML یا Markdown اضافی غیر از # برای تیترها) ارائه بده.

هدف نهایی، تولید یک مقاله است که هم برای موتورهای جستجو رتبه بالایی کسب کند و هم رضایت کامل خواننده را جلب نماید.
`;

  try {
    const result: GenerateContentResponse = await model.generateContent({
        model: "gemini-2.5-flash-preview-04-17",
        contents: prompt,
        config: {
          // Disable thinking for potentially faster responses with gemini-2.5-flash
          thinkingConfig: { thinkingBudget: 0 }
        }
    });
    
    const text = result.text;
    if (!text) {
        throw new Error("پاسخ دریافتی از Gemini خالی است.");
    }
    return text.trim();

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    if (error instanceof Error) {
        if (error.message.includes("API key not valid") || error.message.includes("API_KEY_INVALID")) {
            throw new Error("کلید API نامعتبر است. لطفا کلید صحیح را بررسی و در متغیرهای محیطی تنظیم کنید.");
        }
         if (error.message.includes("Quota exceeded") || error.message.includes("RESOURCE_EXHAUSTED")) {
            throw new Error("سهمیه استفاده از API به پایان رسیده است. لطفا بعدا تلاش کنید یا سهمیه خود را بررسی نمایید.");
        }
        throw new Error(`خطا در ارتباط با Gemini: ${error.message}`);
    }
    throw new Error('خطای ناشناخته هنگام فراخوانی Gemini API.');
  }
};