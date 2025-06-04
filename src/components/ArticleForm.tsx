import React, { useState } from 'react';
import { ArticleTone, ArticleLength, ArticleLengthValues } from '../types';
import type { ArticleRequest } from '../types';

interface ArticleFormProps {
  onSubmit: (request: ArticleRequest) => void;
  isLoading: boolean;
}

export const ArticleForm: React.FC<ArticleFormProps> = ({ onSubmit, isLoading }) => {
  const [topic, setTopic] = useState<string>('');
  const [keyword, setKeyword] = useState<string>('');
  const [tone, setTone] = useState<ArticleTone>(ArticleTone.INFORMATIVE);
  const [selectedArticleLength, setSelectedArticleLength] = useState<ArticleLength>(ArticleLength.SHORT);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!topic.trim()) {
        alert("لطفا موضوع مقاله را وارد کنید.");
        return;
    }
    // Keyword is now optional, so no validation needed for it.
    const wordCount = ArticleLengthValues[selectedArticleLength];
    onSubmit({ topic, keyword: keyword.trim(), tone, wordCount });
  };

  const toneOptions = Object.values(ArticleTone);
  const lengthOptions = Object.values(ArticleLength);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="topic" className="block text-sm font-medium text-purple-300 mb-1">
          موضوع مقاله
        </label>
        <input
          type="text"
          id="topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="مثال: تاثیر هوش مصنوعی بر آینده مشاغل"
          className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 placeholder-slate-500 text-slate-100"
          required
          aria-required="true"
        />
      </div>

      <div>
        <label htmlFor="keyword" className="block text-sm font-medium text-purple-300 mb-1">
          کلمه کلیدی اصلی (اختیاری)
        </label>
        <input
          type="text"
          id="keyword"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="مثال: برنامه نویسی پایتون"
          className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 placeholder-slate-500 text-slate-100"
        />
      </div>

      <div>
        <label htmlFor="tone" className="block text-sm font-medium text-purple-300 mb-1">
          لحن مقاله
        </label>
        <select
          id="tone"
          value={tone}
          onChange={(e) => setTone(e.target.value as ArticleTone)}
          className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-slate-100"
        >
          {toneOptions.map((toneValue) => (
            <option key={toneValue} value={toneValue} className="bg-slate-700 text-slate-100">
              {toneValue}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="wordCount" className="block text-sm font-medium text-purple-300 mb-1">
          تعداد کلمات (تقریبی)
        </label>
        <select
          id="wordCount"
          value={selectedArticleLength}
          onChange={(e) => setSelectedArticleLength(e.target.value as ArticleLength)}
          className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-slate-100"
        >
          {lengthOptions.map((lengthValue) => (
            <option key={lengthValue} value={lengthValue} className="bg-slate-700 text-slate-100">
              {lengthValue}
            </option>
          ))}
        </select>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 ease-in-out"
          aria-live="polite"
          aria-busy={isLoading}
        >
          {isLoading ? 'در حال پردازش...' : 'تولید مقاله'}
        </button>
      </div>
    </form>
  );
};