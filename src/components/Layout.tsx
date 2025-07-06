import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  onBack?: () => void;
  showBack?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title, 
  onBack, 
  showBack = false 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-xl">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between p-4">
            {showBack && (
              <button
                onClick={onBack}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
            )}
            <h1 className="text-lg font-semibold text-gray-900 flex-1 text-center">
              {title}
            </h1>
            {showBack && <div className="w-9" />}
          </div>
        </div>
        <div className="pb-safe">
          {children}
        </div>
      </div>
    </div>
  );
};