import React, { useState } from 'react';
import { MapPin, AlertCircle, CheckCircle, Shield } from 'lucide-react';
import { Button } from '../components/Button';
import { Layout } from '../components/Layout';
import { ProgressBar } from '../components/ProgressBar';
import { useLocation } from '../hooks/useLocation';
import { apiService } from '../services/api';

interface LocationScreenProps {
  onComplete: () => void;
  onBack: () => void;
  currentUser: any;
}

export const LocationScreen: React.FC<LocationScreenProps> = ({ onComplete, onBack, currentUser }) => {
  const [locationStatus, setLocationStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle');
  const { getCurrentLocation } = useLocation();

  const requestLocation = async () => {
    setLocationStatus('requesting');
    
    try {
      const location = await getCurrentLocation();
      
      if (location) {
        // Save location to user profile
        await apiService.updateUserLocation(currentUser.id, location);
        setLocationStatus('granted');
      } else {
        setLocationStatus('denied');
      }
    } catch (error) {
      console.error('Location error:', error);
      setLocationStatus('denied');
    }
  };

  const handleContinue = () => {
    if (locationStatus === 'granted') {
      onComplete();
    }
  };

  return (
    <Layout title="Геолокация" onBack={onBack} showBack>
      <div className="p-6">
        <div className="mb-6">
          <ProgressBar current={2} total={4} />
        </div>

        <div className="text-center mb-8">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
            locationStatus === 'granted' ? 'bg-green-100' : 
            locationStatus === 'denied' ? 'bg-red-100' : 'bg-blue-100'
          }`}>
            {locationStatus === 'granted' ? (
              <CheckCircle className="w-12 h-12 text-green-600" />
            ) : locationStatus === 'denied' ? (
              <AlertCircle className="w-12 h-12 text-red-600" />
            ) : (
              <MapPin className="w-12 h-12 text-blue-600" />
            )}
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Доступ к геолокации
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Для участия в квестах необходим постоянный доступ к вашему местоположению. 
            Это обязательное требование согласно ТЗ.
          </p>
        </div>

        {locationStatus === 'idle' && (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Зачем нужна геолокация?</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Определение доступных квестов в вашем городе</li>
                <li>• Точное отслеживание прохождения маршрута</li>
                <li>• Контроль нахождения в радиусе 10 метров от локации</li>
                <li>• Мониторинг скорости передвижения (лимит 27 км/ч)</li>
                <li>• Предотвращение мошенничества</li>
              </ul>
            </div>

            <div className="bg-amber-50 p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-amber-800 font-medium">Обязательное требование</p>
                  <p className="text-sm text-amber-700 mt-1">
                    Без предоставления доступа к геолокации участие в квестах невозможно. 
                    Это требование безопасности и честности игры.
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={requestLocation}
              size="lg"
              fullWidth
              className="bg-blue-600 hover:bg-blue-700"
            >
              Предоставить доступ к геолокации
            </Button>
          </div>
        )}

        {locationStatus === 'requesting' && (
          <div className="text-center">
            <Button loading size="lg" fullWidth disabled>
              Получение доступа к геолокации...
            </Button>
            <p className="text-sm text-gray-600 mt-3">
              Разрешите доступ к местоположению в браузере или Telegram
            </p>
          </div>
        )}

        {locationStatus === 'granted' && (
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-green-800 font-medium">
                Доступ к геолокации предоставлен!
              </p>
              <p className="text-sm text-green-700 mt-1">
                Система будет отслеживать ваше местоположение во время квестов
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Контроль скорости</h3>
              <p className="text-sm text-blue-800">
                Система автоматически отслеживает скорость передвижения. 
                При превышении 27 км/ч участник будет дисквалифицирован.
              </p>
            </div>

            <Button
              onClick={handleContinue}
              size="lg"
              fullWidth
              variant="success"
            >
              Продолжить к соглашениям
            </Button>
          </div>
        )}

        {locationStatus === 'denied' && (
          <div className="space-y-4">
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <p className="text-red-800 font-medium">
                Доступ к геолокации отклонен
              </p>
              <p className="text-sm text-red-700 mt-1">
                Без доступа к геолокации участие в квестах невозможно
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Как предоставить доступ:</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• В браузере нажмите "Разрешить" при запросе геолокации</li>
                <li>• В настройках браузера включите доступ к местоположению</li>
                <li>• Убедитесь, что GPS включен на устройстве</li>
              </ul>
            </div>

            <Button
              onClick={requestLocation}
              size="lg"
              fullWidth
              variant="danger"
            >
              Попробовать еще раз
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};