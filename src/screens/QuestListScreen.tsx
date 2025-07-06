import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Users, Star, CreditCard, Navigation } from 'lucide-react';
import { Button } from '../components/Button';
import { Layout } from '../components/Layout';
import { ProgressBar } from '../components/ProgressBar';
import { apiService } from '../services/api';
import { Quest } from '../types';

interface QuestListScreenProps {
  onSelectQuest: (quest: Quest) => void;
  onBack: () => void;
  currentUser: any;
}

export const QuestListScreen: React.FC<QuestListScreenProps> = ({ onSelectQuest, onBack, currentUser }) => {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [selectedCity, setSelectedCity] = useState('Москва');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuests();
  }, [selectedCity]);

  const loadQuests = async () => {
    setLoading(true);
    try {
      const questsList = await apiService.getQuestsByLocation(selectedCity);
      setQuests(questsList);
    } catch (error) {
      console.error('Error loading quests:', error);
    } finally {
      setLoading(false);
    }
  };

  const cities = ['Москва', 'Санкт-Петербург', 'Казань', 'Екатеринбург', 'Новосибирск'];

  return (
    <Layout title="Выбор квеста" onBack={onBack} showBack>
      <div className="p-6">
        <div className="mb-6">
          <ProgressBar current={4} total={4} />
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Доступные квесты
          </h2>
          <p className="text-gray-600">
            Выберите квест в вашем городе. Количество локаций: от 4 до 10.
          </p>
        </div>

        {/* City selector */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Выберите город:</h3>
          <div className="flex flex-wrap gap-2">
            {cities.map(city => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCity === city
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Загрузка квестов...</p>
          </div>
        ) : quests.length === 0 ? (
          <div className="text-center py-8">
            <Navigation className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Квесты не найдены
            </h3>
            <p className="text-gray-600">
              В городе {selectedCity} пока нет доступных квестов
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {quests.map((quest) => (
              <div key={quest.id} className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{quest.title}</h3>
                    <span className="text-lg font-bold text-blue-600">{quest.price} ₽</span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4">{quest.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      {quest.locationCount} локаций
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Navigation className="w-4 h-4 mr-2" />
                      {quest.city}
                    </div>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg mb-4">
                    <h4 className="font-semibold text-blue-900 mb-1">Стартовая локация:</h4>
                    <p className="text-sm text-blue-800">{quest.startLocation.name}</p>
                    <p className="text-xs text-blue-700">
                      {quest.startLocation.coordinates.lat.toFixed(4)}, {quest.startLocation.coordinates.lng.toFixed(4)}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg mb-4">
                    <h4 className="font-semibold text-gray-900 mb-1">Условия квеста:</h4>
                    <p className="text-sm text-gray-700">{quest.conditions}</p>
                  </div>
                  
                  <Button
                    onClick={() => onSelectQuest(quest)}
                    fullWidth
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Выбрать квест • {quest.price} ₽
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 bg-amber-50 p-4 rounded-lg">
          <h3 className="font-semibold text-amber-900 mb-2">Важная информация:</h3>
          <ul className="text-sm text-amber-800 space-y-1">
            <li>• После оплаты вы получите уведомления за 24ч, 3ч и 1ч до начала</li>
            <li>• Стартовая локация будет отправлена за час до начала квеста</li>
            <li>• Система контролирует скорость передвижения (лимит 27 км/ч)</li>
            <li>• Необходимо находиться в радиусе 10 метров от каждой локации</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};