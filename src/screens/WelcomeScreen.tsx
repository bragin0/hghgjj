import React, { useEffect } from 'react';
import { MapPin, Trophy, Users, Zap } from 'lucide-react';
import { Button } from '../components/Button';
import { Layout } from '../components/Layout';
import { initTelegramWebApp, getTelegramUser } from '../utils/telegram';

interface WelcomeScreenProps {
  onStart: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  useEffect(() => {
    // Initialize Telegram Web App
    initTelegramWebApp();
  }, []);

  const telegramUser = getTelegramUser();

  return (
    <Layout title="QuestMap">
      <div className="p-6 text-center">
        <div className="mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Добро пожаловать в QuestMap!
          </h2>
          {telegramUser && (
            <p className="text-lg text-blue-600 mb-2">
              Привет, {telegramUser.first_name}!
            </p>
          )}
          <p className="text-lg text-gray-600 leading-relaxed">
            Увлекательные квесты в вашем городе. Исследуйте новые места, решайте головоломки и открывайте тайны городов.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 mb-8">
          <div className="flex items-center p-4 bg-blue-50 rounded-xl">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900">Реальные локации</h3>
              <p className="text-sm text-gray-600">Посещайте интересные места города с точной геолокацией</p>
            </div>
          </div>

          <div className="flex items-center p-4 bg-green-50 rounded-xl">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <Zap className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900">Интерактивные задания</h3>
              <p className="text-sm text-gray-600">Разгадывайте загадки и отвечайте на вопросы в каждой точке</p>
            </div>
          </div>

          <div className="flex items-center p-4 bg-purple-50 rounded-xl">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900">Контроль скорости</h3>
              <p className="text-sm text-gray-600">Система отслеживает честность прохождения квеста</p>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 p-4 rounded-lg mb-6">
          <p className="text-amber-800 text-sm">
            <strong>Важно:</strong> Для участия в квестах необходимо предоставить доступ к геолокации и подписать соглашения.
          </p>
        </div>

        <Button
          onClick={onStart}
          size="lg"
          fullWidth
          className="text-lg font-semibold"
        >
          Начать регистрацию
        </Button>

        <p className="text-xs text-gray-500 mt-4">
          Нажимая "Начать регистрацию", вы переходите к процессу регистрации и подписания соглашений
        </p>
      </div>
    </Layout>
  );
};