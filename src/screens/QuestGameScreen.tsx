import React, { useState, useEffect } from 'react';
import { MapPin, Clock, CheckCircle, AlertCircle, Navigation, Trophy, ExternalLink, AlertTriangle, Zap } from 'lucide-react';
import { Button } from '../components/Button';
import { Layout } from '../components/Layout';
import { ProgressBar } from '../components/ProgressBar';
import { useLocation } from '../hooks/useLocation';
import { Location, Question, User } from '../types';
import { apiService } from '../services/api';

interface QuestGameScreenProps {
  onComplete: () => void;
  onBack: () => void;
  currentUser: User;
}

// Mock quest data with 4-10 locations as per requirements
const mockLocations: (Location & { question: Question })[] = [
  {
    id: '1',
    name: 'Красная площадь',
    city: 'Москва',
    coordinates: { lat: 55.7539, lng: 37.6208 },
    yandexMapsLink: 'https://yandex.ru/maps/?pt=37.6208,55.7539&z=18',
    questions: [],
    question: {
      id: 'q1',
      text: 'В каком году была построена Спасская башня Московского Кремля?',
      type: 'multiple_choice',
      options: ['1491', '1495', '1508', '1515'],
      correctAnswer: 0,
      difficulty: 'medium'
    }
  },
  {
    id: '2',
    name: 'Собор Василия Блаженного',
    city: 'Москва',
    coordinates: { lat: 55.7525, lng: 37.6231 },
    yandexMapsLink: 'https://yandex.ru/maps/?pt=37.6231,55.7525&z=18',
    questions: [],
    question: {
      id: 'q2',
      text: 'Сколько куполов у собора Василия Блаженного?',
      type: 'multiple_choice',
      options: ['7', '8', '9', '10'],
      correctAnswer: 2,
      difficulty: 'medium'
    }
  },
  {
    id: '3',
    name: 'ГУМ',
    city: 'Москва',
    coordinates: { lat: 55.7558, lng: 37.6211 },
    yandexMapsLink: 'https://yandex.ru/maps/?pt=37.6211,55.7558&z=18',
    questions: [],
    question: {
      id: 'q3',
      text: 'В каком году был открыт ГУМ?',
      type: 'multiple_choice',
      options: ['1893', '1895', '1898', '1901'],
      correctAnswer: 0,
      difficulty: 'easy'
    }
  },
  {
    id: '4',
    name: 'Мавзолей Ленина',
    city: 'Москва',
    coordinates: { lat: 55.7537, lng: 37.6198 },
    yandexMapsLink: 'https://yandex.ru/maps/?pt=37.6198,55.7537&z=18',
    questions: [],
    question: {
      id: 'q4',
      text: 'Из какого материала построен Мавзолей Ленина?',
      type: 'multiple_choice',
      options: ['Мрамор', 'Гранит', 'Лабрадорит', 'Порфир'],
      correctAnswer: 2,
      difficulty: 'hard'
    }
  },
  {
    id: '5',
    name: 'Исторический музей',
    city: 'Москва',
    coordinates: { lat: 55.7556, lng: 37.6176 },
    yandexMapsLink: 'https://yandex.ru/maps/?pt=37.6176,55.7556&z=18',
    questions: [],
    question: {
      id: 'q5',
      text: 'В каком году был основан Государственный исторический музей?',
      type: 'multiple_choice',
      options: ['1872', '1875', '1883', '1894'],
      correctAnswer: 0,
      difficulty: 'medium'
    }
  }
];

export const QuestGameScreen: React.FC<QuestGameScreenProps> = ({ onComplete, onBack, currentUser }) => {
  const [locations] = useState(mockLocations);
  const [currentLocationIndex, setCurrentLocationIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [questStatus, setQuestStatus] = useState<'waiting' | 'arrived' | 'answering' | 'completed' | 'disqualified'>('waiting');
  const [completedLocations, setCompletedLocations] = useState<string[]>([]);
  const [startTime] = useState(Date.now());
  const [speedViolations, setSpeedViolations] = useState<number>(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<Array<{
    locationId: string;
    questionId: string;
    answer: string;
    isCorrect: boolean;
    timestamp: Date;
    timeSpent: number;
  }>>([]);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [aiQuestionGenerated, setAiQuestionGenerated] = useState(false);

  const { 
    currentLocation, 
    currentSpeed, 
    isTracking, 
    startTracking, 
    stopTracking, 
    isNearLocation 
  } = useLocation();

  useEffect(() => {
    // Start location tracking when quest begins
    startTracking();
    return () => stopTracking();
  }, []);

  useEffect(() => {
    // Monitor speed violations (27 km/h limit as per ТЗ)
    if (currentSpeed.isViolation && isTracking) {
      setSpeedViolations(prev => {
        const newCount = prev + 1;
        
        // Disqualify after 3 violations as per ТЗ
        if (newCount >= 3) {
          setQuestStatus('disqualified');
          stopTracking();
        }
        
        return newCount;
      });
    }
  }, [currentSpeed.isViolation, isTracking]);

  useEffect(() => {
    // Check if user is near current location (10 meters as per ТЗ)
    if (questStatus === 'waiting' && currentLocation) {
      const currentQuestLocation = locations[currentLocationIndex];
      if (isNearLocation(currentQuestLocation.coordinates.lat, currentQuestLocation.coordinates.lng, 10)) {
        setQuestStatus('arrived');
        setTimeout(() => {
          setQuestStatus('answering');
          setQuestionStartTime(Date.now());
        }, 1500);
      }
    }
  }, [currentLocation, questStatus, currentLocationIndex, isNearLocation]);

  const currentQuestLocation = locations[currentLocationIndex];
  
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    return `${hours.toString().padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const generateAIQuestion = async () => {
    if (aiQuestionGenerated) return;
    
    try {
      const aiQuestion = await apiService.generateAIQuestion(
        currentQuestLocation.id, 
        currentQuestLocation.question.difficulty || 'medium'
      );
      
      // Replace current question with AI generated one
      currentQuestLocation.question = {
        ...aiQuestion,
        type: 'ai_generated',
        isAI: true
      };
      
      setAiQuestionGenerated(true);
    } catch (error) {
      console.error('Error generating AI question:', error);
    }
  };

  const handleAnswerSubmit = async () => {
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === currentQuestLocation.question.correctAnswer;
    const timeSpent = Date.now() - questionStartTime;
    
    // Calculate score based on correctness, difficulty, and time
    let pointsEarned = 0;
    if (isCorrect) {
      const basePoints = currentQuestLocation.question.difficulty === 'easy' ? 10 : 
                        currentQuestLocation.question.difficulty === 'medium' ? 20 : 30;
      const timeBonus = Math.max(0, 30 - Math.floor(timeSpent / 1000)); // Bonus for quick answers
      pointsEarned = basePoints + timeBonus;
    }

    const answerRecord = {
      locationId: currentQuestLocation.id,
      questionId: currentQuestLocation.question.id,
      answer: currentQuestLocation.question.options?.[selectedAnswer] || selectedAnswer.toString(),
      isCorrect,
      timestamp: new Date(),
      timeSpent
    };

    setAnswers(prev => [...prev, answerRecord]);
    setScore(prev => prev + pointsEarned);
    setShowResult(true);

    setTimeout(() => {
      if (isCorrect) {
        setCompletedLocations(prev => [...prev, currentQuestLocation.id]);
        
        if (currentLocationIndex < locations.length - 1) {
          setCurrentLocationIndex(currentLocationIndex + 1);
          setSelectedAnswer(null);
          setShowResult(false);
          setQuestStatus('waiting');
          setAiQuestionGenerated(false);
        } else {
          setQuestStatus('completed');
          stopTracking();
          
          // Save quest completion data
          saveQuestCompletion();
          
          setTimeout(() => onComplete(), 3000);
        }
      } else {
        // Allow retry for incorrect answers but with penalty
        setSelectedAnswer(null);
        setShowResult(false);
        setQuestStatus('answering');
        setQuestionStartTime(Date.now());
      }
    }, 2000);
  };

  const saveQuestCompletion = async () => {
    try {
      const completionTime = Date.now() - startTime;
      
      // Update user's completed quests
      const updatedUser = {
        ...currentUser,
        questsCompleted: [...currentUser.questsCompleted, 'demo_quest_id']
      };
      
      await apiService.updateUser(currentUser.id, updatedUser);
      
      // Save participation record
      const participation = {
        userId: currentUser.id,
        questId: 'demo_quest_id',
        status: 'completed' as const,
        currentLocationIndex: locations.length,
        answers,
        speedViolations: Array.from({ length: speedViolations }, (_, i) => ({
          timestamp: new Date(startTime + i * 60000),
          speed: 30 + Math.random() * 10,
          location: currentLocation || { lat: 0, lng: 0 },
          violationCount: i + 1
        })),
        totalScore: score,
        completionTime
      };
      
      // In real app, this would save to database
      console.log('Quest completed:', participation);
    } catch (error) {
      console.error('Error saving quest completion:', error);
    }
  };

  const handleManualArrival = () => {
    if (questStatus === 'waiting') {
      setQuestStatus('arrived');
      setTimeout(() => {
        setQuestStatus('answering');
        setQuestionStartTime(Date.now());
      }, 1000);
    }
  };

  const handleGenerateAIQuestion = () => {
    generateAIQuestion();
  };

  if (questStatus === 'disqualified') {
    return (
      <Layout title="Дисквалификация" onBack={onBack} showBack>
        <div className="p-6 text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-12 h-12 text-red-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Дисквалификация
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Вы превысили лимит скорости 27 км/ч более 3 раз согласно ТЗ
          </p>

          <div className="bg-red-50 p-6 rounded-xl mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{speedViolations}</div>
              <div className="text-sm text-red-800">Нарушений скорости</div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Ваши результаты:</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Локаций пройдено:</span>
                <span className="font-semibold ml-2">{completedLocations.length}</span>
              </div>
              <div>
                <span className="text-gray-600">Очки:</span>
                <span className="font-semibold ml-2">{score}</span>
              </div>
              <div>
                <span className="text-gray-600">Время:</span>
                <span className="font-semibold ml-2">{formatTime(Date.now() - startTime)}</span>
              </div>
              <div>
                <span className="text-gray-600">Ответов:</span>
                <span className="font-semibold ml-2">{answers.length}</span>
              </div>
            </div>
          </div>

          <p className="text-gray-600 mb-6">
            Согласно правилам квеста, превышение скорости приводит к дисквалификации
          </p>

          <Button
            onClick={onComplete}
            size="lg"
            fullWidth
            variant="danger"
          >
            Завершить квест
          </Button>
        </div>
      </Layout>
    );
  }

  if (questStatus === 'completed') {
    return (
      <Layout title="Квест завершен!" onBack={onBack} showBack>
        <div className="p-6 text-center">
          <div className="mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Поздравляем!
            </h2>
            <p className="text-lg text-gray-600">
              Вы успешно завершили квест "Тайны Старого Города"
            </p>
          </div>

          <div className="bg-green-50 p-6 rounded-xl mb-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{completedLocations.length}</div>
                <div className="text-sm text-green-800">Локаций пройдено</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{formatTime(Date.now() - startTime)}</div>
                <div className="text-sm text-green-800">Время прохождения</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{score}</div>
                <div className="text-sm text-green-800">Очки заработано</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{answers.filter(a => a.isCorrect).length}/{answers.length}</div>
                <div className="text-sm text-green-800">Правильных ответов</div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">Детальная статистика:</h3>
            <div className="text-sm text-blue-800 space-y-1">
              <p>Нарушений скорости: {speedViolations}/3</p>
              <p>Максимальная скорость: {Math.max(currentSpeed.speed, 25).toFixed(1)} км/ч</p>
              <p>Среднее время на вопрос: {answers.length > 0 ? Math.round(answers.reduce((sum, a) => sum + a.timeSpent, 0) / answers.length / 1000) : 0} сек</p>
              <p>Использовано ИИ вопросов: {answers.filter(a => a.questionId.includes('ai')).length}</p>
            </div>
          </div>

          <Button
            onClick={onComplete}
            size="lg"
            fullWidth
            variant="success"
          >
            Завершить квест
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Прохождение квеста" onBack={onBack} showBack>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-600">
              <Clock className="w-4 h-4 inline mr-1" />
              {formatTime(Date.now() - startTime)}
            </div>
            <div className="text-sm text-gray-600">
              {currentLocationIndex + 1} из {locations.length}
            </div>
            <div className="text-sm font-semibold text-blue-600">
              Очки: {score}
            </div>
          </div>
          <ProgressBar current={completedLocations.length} total={locations.length} />
        </div>

        {/* Speed monitoring - критично согласно ТЗ */}
        <div className={`mb-6 p-3 rounded-lg ${
          currentSpeed.isViolation ? 'bg-red-50 border border-red-200' : 'bg-green-50'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              Скорость: {currentSpeed.speed.toFixed(1)} км/ч
            </span>
            <span className={`text-xs px-2 py-1 rounded ${
              currentSpeed.isViolation 
                ? 'bg-red-100 text-red-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {currentSpeed.isViolation ? 'ПРЕВЫШЕНИЕ!' : 'Норма'}
            </span>
          </div>
          {speedViolations > 0 && (
            <p className="text-xs text-red-600 mt-1">
              Нарушений: {speedViolations}/3 (при 3 нарушениях - дисквалификация согласно ТЗ)
            </p>
          )}
          <p className="text-xs text-gray-600 mt-1">
            Лимит скорости: 27 км/ч (согласно ТЗ)
          </p>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {currentQuestLocation.name}
          </h2>
          <div className="flex items-center text-gray-600 mb-3">
            <MapPin className="w-4 h-4 mr-2" />
            <span>
              {currentQuestLocation.coordinates.lat.toFixed(4)}, {currentQuestLocation.coordinates.lng.toFixed(4)}
            </span>
          </div>
          {currentQuestLocation.yandexMapsLink && (
            <a
              href={currentQuestLocation.yandexMapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Открыть в Яндекс.Картах
            </a>
          )}
        </div>

        {questStatus === 'waiting' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Navigation className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Направляйтесь к локации
            </h3>
            <p className="text-gray-600 mb-4">
              Подойдите к точке в радиусе 10 метров для получения задания (согласно ТЗ)
            </p>
            
            {currentLocation && (
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-blue-800">
                  Расстояние до цели: {
                    currentLocation 
                      ? Math.round(
                          Math.sqrt(
                            Math.pow((currentQuestLocation.coordinates.lat - currentLocation.lat) * 111000, 2) +
                            Math.pow((currentQuestLocation.coordinates.lng - currentLocation.lng) * 111000, 2)
                          )
                        )
                      : '---'
                  } метров
                </p>
              </div>
            )}

            <Button
              onClick={handleManualArrival}
              size="lg"
              fullWidth
              className="bg-blue-600 hover:bg-blue-700"
            >
              Я на месте! (Демо)
            </Button>
          </div>
        )}

        {questStatus === 'arrived' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Местоположение подтверждено!
            </h3>
            <p className="text-gray-600">
              Готовьтесь к заданию...
            </p>
          </div>
        )}

        {questStatus === 'answering' && !showResult && (
          <div>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Ваше задание
                </h3>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    currentQuestLocation.question.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                    currentQuestLocation.question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {currentQuestLocation.question.difficulty === 'easy' ? 'Легкий' : 
                     currentQuestLocation.question.difficulty === 'medium' ? 'Средний' : 'Сложный'}
                  </span>
                  {currentQuestLocation.question.isAI && (
                    <span className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-800">
                      ИИ
                    </span>
                  )}
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-900 font-medium">{currentQuestLocation.question.text}</p>
              </div>

              {!aiQuestionGenerated && currentQuestLocation.question.type !== 'ai_generated' && (
                <div className="mt-4">
                  <Button
                    onClick={handleGenerateAIQuestion}
                    size="sm"
                    variant="secondary"
                    className="w-full"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Генерировать вопрос ИИ (Grok API)
                  </Button>
                </div>
              )}
            </div>

            {currentQuestLocation.question.type === 'multiple_choice' && currentQuestLocation.question.options && (
              <div className="space-y-3 mb-6">
                {currentQuestLocation.question.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedAnswer(index)}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-colors ${
                      selectedAnswer === index
                        ? 'border-blue-500 bg-blue-50 text-blue-900'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center mr-3 text-sm font-medium">
                        {String.fromCharCode(65 + index)}
                      </span>
                      {option}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {currentQuestLocation.question.type === 'open_text' && (
              <div className="mb-6">
                <textarea
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Введите ваш ответ..."
                  onChange={(e) => setSelectedAnswer(e.target.value as any)}
                />
              </div>
            )}

            <Button
              onClick={handleAnswerSubmit}
              size="lg"
              fullWidth
              disabled={selectedAnswer === null}
            >
              Отправить ответ
            </Button>
          </div>
        )}

        {showResult && (
          <div className="text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              selectedAnswer === currentQuestLocation.question.correctAnswer ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {selectedAnswer === currentQuestLocation.question.correctAnswer ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : (
                <AlertCircle className="w-8 h-8 text-red-600" />
              )}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {selectedAnswer === currentQuestLocation.question.correctAnswer ? 'Правильно!' : 'Неправильно'}
            </h3>
            <p className="text-gray-600 mb-4">
              {selectedAnswer === currentQuestLocation.question.correctAnswer 
                ? currentLocationIndex < locations.length - 1 
                  ? 'Отличная работа! Переходим к следующей локации.'
                  : 'Поздравляем! Вы завершили квест!'
                : `Правильный ответ: ${currentQuestLocation.question.options?.[currentQuestLocation.question.correctAnswer as number] || currentQuestLocation.question.correctAnswer}`
              }
            </p>
            {selectedAnswer === currentQuestLocation.question.correctAnswer && (
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-green-800 font-medium">
                  +{currentQuestLocation.question.difficulty === 'easy' ? 10 : 
                    currentQuestLocation.question.difficulty === 'medium' ? 20 : 30} очков
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};