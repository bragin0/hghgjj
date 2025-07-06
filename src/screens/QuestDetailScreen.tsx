import React, { useState } from 'react';
import { MapPin, Clock, CreditCard, Shield, AlertTriangle, CheckCircle, Navigation } from 'lucide-react';
import { Button } from '../components/Button';
import { Layout } from '../components/Layout';
import { Quest } from '../types';
import { apiService } from '../services/api';

interface QuestDetailScreenProps {
  quest: Quest;
  onPay: () => void;
  onBack: () => void;
  currentUser: any;
}

export const QuestDetailScreen: React.FC<QuestDetailScreenProps> = ({ quest, onPay, onBack, currentUser }) => {
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'details' | 'payment' | 'success'>('details');

  const handlePayment = async () => {
    setPaymentLoading(true);
    setPaymentStep('payment');
    
    try {
      // Process payment
      const paymentResult = await apiService.processPayment(currentUser.id, quest.id, quest.price);
      
      if (paymentResult.success) {
        // Register for quest
        await apiService.registerForQuest(currentUser.id, quest.id);
        
        // Schedule notifications
        const questStartTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow
        await apiService.scheduleNotifications(currentUser.id, quest.id, questStartTime);
        
        setPaymentStep('success');
        
        // Auto-proceed after showing success
        setTimeout(() => {
          onPay();
        }, 3000);
      } else {
        throw new Error('Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStep('details');
    } finally {
      setPaymentLoading(false);
    }
  };

  if (paymentStep === 'payment') {
    return (
      <Layout title="Оплата" onBack={onBack} showBack>
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CreditCard className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Обработка платежа
          </h2>
          <p className="text-gray-600 mb-6">
            Пожалуйста, подождите. Обрабатываем ваш платеж...
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </Layout>
    );
  }

  if (paymentStep === 'success') {
    return (
      <Layout title="Оплата успешна" onBack={onBack} showBack>
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Оплата успешна!
          </h2>
          <p className="text-gray-600 mb-6">
            Вы успешно зарегистрированы на квест "{quest.title}"
          </p>
          
          <div className="bg-green-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-green-900 mb-2">Что дальше?</h3>
            <ul className="text-sm text-green-800 space-y-1 text-left">
              <li>• Уведомления будут отправлены за 24ч, 3ч и 1ч до начала</li>
              <li>• Стартовая локация придет за час до начала квеста</li>
              <li>• Убедитесь, что геолокация включена</li>
              <li>• Соблюдайте лимит скорости 27 км/ч</li>
            </ul>
          </div>

          <p className="text-sm text-gray-600">
            Переход к квесту через 3 секунды...
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Детали квеста" onBack={onBack} showBack>
      <div className="pb-6">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{quest.title}</h1>
            <p className="text-gray-600">{quest.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <MapPin className="w-5 h-5 text-blue-600 mr-2" />
                <span className="font-medium text-blue-900">Локации</span>
              </div>
              <p className="text-blue-800">{quest.locationCount} точек</p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <Navigation className="w-5 h-5 text-green-600 mr-2" />
                <span className="font-medium text-green-900">Город</span>
              </div>
              <p className="text-green-800">{quest.city}</p>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Маршрут квеста</h2>
            
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <h3 className="font-semibold text-blue-900 mb-2">Стартовая локация:</h3>
              <p className="text-blue-800 font-medium">{quest.startLocation.name}</p>
              <p className="text-sm text-blue-700">
                Координаты: {quest.startLocation.coordinates.lat.toFixed(4)}, {quest.startLocation.coordinates.lng.toFixed(4)}
              </p>
              {quest.startLocation.yandexMapsLink && (
                <a 
                  href={quest.startLocation.yandexMapsLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Открыть в Яндекс.Картах
                </a>
              )}
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">Финальная локация:</h3>
              <p className="text-green-800 font-medium">{quest.finalLocation.name}</p>
              <p className="text-sm text-green-700">
                Координаты: {quest.finalLocation.coordinates.lat.toFixed(4)}, {quest.finalLocation.coordinates.lng.toFixed(4)}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Условия квеста</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-800">{quest.conditions}</p>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Механика прохождения</h2>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-semibold text-sm">1</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Прибытие на стартовую локацию</p>
                  <p className="text-sm text-gray-600">Система проверит ваше местоположение в радиусе 10 метров</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-semibold text-sm">2</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Получение заданий</p>
                  <p className="text-sm text-gray-600">В каждой локации вас ждет вопрос с вариантами ответа</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-semibold text-sm">3</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Переход к следующей точке</p>
                  <p className="text-sm text-gray-600">После правильного ответа получите координаты следующей локации</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Важные требования</h2>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3 bg-amber-50 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-amber-800 font-medium">Контроль скорости</p>
                  <p className="text-sm text-amber-700">Превышение скорости 27 км/ч приведет к дисквалификации</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-blue-800 font-medium">Точность геолокации</p>
                  <p className="text-sm text-blue-700">Необходимо находиться в радиусе 10 метров от каждой локации</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-green-800 font-medium">Уведомления</p>
                  <p className="text-sm text-green-700">Получите напоминания в Telegram, SMS и email</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl font-bold text-gray-900">Стоимость участия</span>
              <span className="text-3xl font-bold text-blue-600">{quest.price} ₽</span>
            </div>
            
            <Button
              onClick={handlePayment}
              loading={paymentLoading}
              size="lg"
              fullWidth
              className="bg-green-600 hover:bg-green-700"
            >
              <CreditCard className="w-5 h-5 mr-2" />
              Оплатить участие
            </Button>

            <p className="text-xs text-gray-500 mt-3 text-center">
              После оплаты вы получите подтверждение и уведомления о начале квеста
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};