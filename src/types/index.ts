// src/types/index.ts

// تعریف enum برای لحن مقاله
export enum ArticleTone {
  INFORMATIVE = "Informative",
  CASUAL = "Casual",
  FORMAL = "Formal",
  // هر لحن دیگه‌ای که لازم داری
}

// تعریف enum برای طول مقاله
export enum ArticleLength {
  SHORT = "Short",
  MEDIUM = "Medium",
  LONG = "Long",
}

// نگاشت طول مقاله به تعداد کلمات تقریبی
export const ArticleLengthValues: Record<ArticleLength, number> = {
  [ArticleLength.SHORT]: 300,
  [ArticleLength.MEDIUM]: 600,
  [ArticleLength.LONG]: 1000,
};

// تعریف نوع (type) یا اینترفیس برای درخواست مقاله
export interface ArticleRequest {
  topic: string;
  keyword?: string;
  tone: ArticleTone;
  wordCount: number;
}
