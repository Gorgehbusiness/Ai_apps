
import React, { useState, useCallback } from 'react';
import { ArticleForm } from './components/ArticleForm';
import { GeneratedArticleDisplay } from './components/GeneratedArticleDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { generateArticleContent } from './services/geminiService';
import type { ArticleRequest } from './types';

const App: React.FC = () => {
  const [generatedArticle, setGeneratedArticle] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentKeyword, setCurrentKeyword] = useState<string>('');

  const handleGenerateArticle = useCallback(async (request: ArticleRequest) => {
    setIsLoading(true);
    setError(null);
    setGeneratedArticle(null);
    console.log("[App.tsx] Keyword received from form to be set in state:", request.keyword); // For debugging
    setCurrentKeyword(request.keyword); 

    try {
      const article = await generateArticleContent(request);
      setGeneratedArticle(article);
    } catch (err) {
      if (err instanceof Error) {
        setError(`خطا در تولید مقاله: ${err.message}. لطفا از تنظیم صحیح کلید API اطمینان حاصل کنید و دوباره امتحان کنید.`);
      } else {
        setError("خطای ناشناخته ای هنگام تولید مقاله رخ داد.");
      }
      console.error("Error generating article:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-slate-100 p-4 sm:p-6 md:p-8 flex flex-col items-center">
      <header className="mb-8 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
          مقاله ساز هوشمند
        </h1>
        <p className="text-slate-400 mt-2 text-lg">
          موضوع، لحن و تعداد کلمات مقاله خود را مشخص کنید و اجازه دهید هوش مصنوعی برای شما بنویسد!
        </p>
      </header>

      <main className="w-full max-w-2xl bg-slate-800 shadow-2xl rounded-lg p-6 sm:p-8">
        <ArticleForm onSubmit={handleGenerateArticle} isLoading={isLoading} />
        
        {isLoading && (
          <div className="mt-8 flex flex-col items-center">
            <LoadingSpinner />
            <p className="text-purple-400 mt-2">در حال تولید مقاله، لطفا صبر کنید...</p>
          </div>
        )}
        
        {error && <ErrorMessage message={error} />}
        
        {generatedArticle && !isLoading && (
          <GeneratedArticleDisplay article={generatedArticle} keyword={currentKeyword} />
        )}
      </main>

      <footer className="mt-12 text-center text-slate-500 text-sm">
        <p>قدرت گرفته از هوش مصنوعی Gemini</p>
        <p>&copy; {new Date().getFullYear()} مقاله ساز هوشمند. تمامی حقوق محفوظ است.</p>
      </footer>
    </div>
  );
};

export default App;
