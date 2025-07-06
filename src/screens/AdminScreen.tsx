import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Users, MapPin, Settings, BarChart3, FileText, Bell, Save, X, Map, HelpCircle, Eye, Play, Pause, DollarSign, TrendingUp, Clock, Award, AlertTriangle } from 'lucide-react';
import { Button } from '../components/Button';
import { Layout } from '../components/Layout';
import { Input } from '../components/Input';
import { Quest, Agreement, User, Location, Question, City, District, QuestParticipation, Payment, QuestStatistics } from '../types';
import { apiService } from '../services/api';

interface AdminScreenProps {
  onBack: () => void;
}

export const AdminScreen: React.FC<AdminScreenProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'quests' | 'locations' | 'questions' | 'cities' | 'users' | 'agreements' | 'progress' | 'analytics' | 'payments'>('quests');
  
  // State for different entities
  const [quests, setQuests] = useState<Quest[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [participations, setParticipations] = useState<QuestParticipation[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [statistics, setStatistics] = useState<Record<string, QuestStatistics>>({});

  // Notification counts state
  const [notifications24hCount, setNotifications24hCount] = useState(0);
  const [notifications3hCount, setNotifications3hCount] = useState(0);
  const [notifications1hCount, setNotifications1hCount] = useState(0);

  // Modal states
  const [showCreateQuest, setShowCreateQuest] = useState(false);
  const [showEditQuest, setShowEditQuest] = useState<Quest | null>(null);
  const [showCreateLocation, setShowCreateLocation] = useState(false);
  const [showEditLocation, setShowEditLocation] = useState<Location | null>(null);
  const [showCreateQuestion, setShowCreateQuestion] = useState(false);
  const [showEditQuestion, setShowEditQuestion] = useState<Question | null>(null);
  const [showCreateCity, setShowCreateCity] = useState(false);
  const [showEditCity, setShowEditCity] = useState<City | null>(null);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState<User | null>(null);
  const [showCreateAgreement, setShowCreateAgreement] = useState(false);
  const [showEditAgreement, setShowEditAgreement] = useState<Agreement | null>(null);

  // Form states
  const [questForm, setQuestForm] = useState({
    title: '',
    description: '',
    city: '',
    district: '',
    locationCount: 4,
    price: 0,
    conditions: '',
    startLocationName: '',
    startLocationLat: '',
    startLocationLng: '',
    startLocationYandex: '',
    finalLocationName: '',
    finalLocationLat: '',
    finalLocationLng: '',
    finalLocationYandex: '',
    isActive: true
  });

  const [locationForm, setLocationForm] = useState({
    name: '',
    city: '',
    district: '',
    lat: '',
    lng: '',
    yandexMapsLink: '',
    description: ''
  });

  const [questionForm, setQuestionForm] = useState({
    text: '',
    type: 'multiple_choice' as 'multiple_choice' | 'open_text' | 'ai_generated',
    options: ['', '', '', ''],
    correctAnswer: 0,
    locationId: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    isAI: false
  });

  const [cityForm, setCityForm] = useState({
    name: '',
    lat: '',
    lng: '',
    isActive: true,
    newDistrict: ''
  });

  const [userForm, setUserForm] = useState({
    firstName: '',
    lastName: '',
    age: '',
    phone: '',
    email: '',
    telegramId: ''
  });

  const [agreementForm, setAgreementForm] = useState({
    type: 'personal_data' as Agreement['type'],
    title: '',
    content: '',
    isRequired: true,
    version: '1.0'
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [questsData, locationsData, questionsData, citiesData, usersData, agreementsData, participationsData, paymentsData] = await Promise.all([
        apiService.getAllQuests(),
        apiService.getAllLocations(),
        apiService.getAllQuestions(),
        apiService.getAllCities(),
        apiService.getAllUsers(),
        apiService.getAgreements(),
        apiService.getAllParticipations(),
        apiService.getAllPayments()
      ]);

      setQuests(questsData);
      setLocations(locationsData);
      setQuestions(questionsData);
      setCities(citiesData);
      setUsers(usersData);
      setAgreements(agreementsData);
      setParticipations(participationsData);
      setPayments(paymentsData);

      // Load statistics for each quest
      const stats: Record<string, QuestStatistics> = {};
      for (const quest of questsData) {
        stats[quest.id] = await apiService.getQuestStatistics(quest.id);
      }
      setStatistics(stats);

      // Load notification counts
      const notifications = await apiService.getAllNotifications();
      setNotifications24hCount(notifications.filter(n => n.type === 'quest_reminder_24h' && n.sent).length);
      setNotifications3hCount(notifications.filter(n => n.type === 'quest_reminder_3h' && n.sent).length);
      setNotifications1hCount(notifications.filter(n => n.type === 'quest_reminder_1h' && n.sent).length);
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  };

  // Quest management
  const handleCreateQuest = async () => {
    if (!questForm.title || !questForm.city || questForm.locationCount < 4 || questForm.locationCount > 10) {
      alert('Заполните все обязательные поля. Количество локаций: 4-10');
      return;
    }

    try {
      const newQuest: Omit<Quest, 'id' | 'createdAt'> = {
        title: questForm.title,
        description: questForm.description,
        city: questForm.city,
        district: questForm.district || undefined,
        locationCount: questForm.locationCount,
        price: questForm.price,
        startLocation: {
          id: 'start_' + Date.now(),
          name: questForm.startLocationName,
          city: questForm.city,
          district: questForm.district,
          coordinates: {
            lat: parseFloat(questForm.startLocationLat),
            lng: parseFloat(questForm.startLocationLng)
          },
          questions: [],
          yandexMapsLink: questForm.startLocationYandex
        },
        finalLocation: {
          id: 'final_' + Date.now(),
          name: questForm.finalLocationName,
          city: questForm.city,
          district: questForm.district,
          coordinates: {
            lat: parseFloat(questForm.finalLocationLat),
            lng: parseFloat(questForm.finalLocationLng)
          },
          questions: [],
          yandexMapsLink: questForm.finalLocationYandex
        },
        locations: [],
        conditions: questForm.conditions,
        isActive: questForm.isActive
      };

      await apiService.createQuest(newQuest);
      await loadAllData();
      resetQuestForm();
      setShowCreateQuest(false);
    } catch (error) {
      console.error('Error creating quest:', error);
      alert('Ошибка при создании квеста');
    }
  };

  const handleUpdateQuest = async () => {
    if (!showEditQuest) return;

    try {
      const updates: Partial<Quest> = {
        title: questForm.title,
        description: questForm.description,
        city: questForm.city,
        district: questForm.district || undefined,
        locationCount: questForm.locationCount,
        price: questForm.price,
        conditions: questForm.conditions,
        isActive: questForm.isActive,
        startLocation: {
          ...showEditQuest.startLocation,
          name: questForm.startLocationName,
          coordinates: {
            lat: parseFloat(questForm.startLocationLat),
            lng: parseFloat(questForm.startLocationLng)
          },
          yandexMapsLink: questForm.startLocationYandex
        },
        finalLocation: {
          ...showEditQuest.finalLocation,
          name: questForm.finalLocationName,
          coordinates: {
            lat: parseFloat(questForm.finalLocationLat),
            lng: parseFloat(questForm.finalLocationLng)
          },
          yandexMapsLink: questForm.finalLocationYandex
        }
      };

      await apiService.updateQuest(showEditQuest.id, updates);
      await loadAllData();
      resetQuestForm();
      setShowEditQuest(null);
    } catch (error) {
      console.error('Error updating quest:', error);
      alert('Ошибка при обновлении квеста');
    }
  };

  const handleDeleteQuest = async (questId: string) => {
    if (confirm('Вы уверены, что хотите удалить этот квест?')) {
      try {
        await apiService.deleteQuest(questId);
        await loadAllData();
      } catch (error) {
        console.error('Error deleting quest:', error);
        alert('Ошибка при удалении квеста');
      }
    }
  };

  const handleEditQuest = (quest: Quest) => {
    setQuestForm({
      title: quest.title,
      description: quest.description,
      city: quest.city,
      district: quest.district || '',
      locationCount: quest.locationCount,
      price: quest.price,
      conditions: quest.conditions,
      startLocationName: quest.startLocation.name,
      startLocationLat: quest.startLocation.coordinates.lat.toString(),
      startLocationLng: quest.startLocation.coordinates.lng.toString(),
      startLocationYandex: quest.startLocation.yandexMapsLink || '',
      finalLocationName: quest.finalLocation.name,
      finalLocationLat: quest.finalLocation.coordinates.lat.toString(),
      finalLocationLng: quest.finalLocation.coordinates.lng.toString(),
      finalLocationYandex: quest.finalLocation.yandexMapsLink || '',
      isActive: quest.isActive
    });
    setShowEditQuest(quest);
  };

  const resetQuestForm = () => {
    setQuestForm({
      title: '',
      description: '',
      city: '',
      district: '',
      locationCount: 4,
      price: 0,
      conditions: '',
      startLocationName: '',
      startLocationLat: '',
      startLocationLng: '',
      startLocationYandex: '',
      finalLocationName: '',
      finalLocationLat: '',
      finalLocationLng: '',
      finalLocationYandex: '',
      isActive: true
    });
  };

  // Location management
  const handleCreateLocation = async () => {
    if (!locationForm.name || !locationForm.city || !locationForm.lat || !locationForm.lng) {
      alert('Заполните все обязательные поля');
      return;
    }

    try {
      const newLocation: Omit<Location, 'id'> = {
        name: locationForm.name,
        city: locationForm.city,
        district: locationForm.district,
        coordinates: {
          lat: parseFloat(locationForm.lat),
          lng: parseFloat(locationForm.lng)
        },
        yandexMapsLink: locationForm.yandexMapsLink || undefined,
        description: locationForm.description,
        questions: []
      };

      await apiService.createLocation(newLocation);
      await loadAllData();
      resetLocationForm();
      setShowCreateLocation(false);
    } catch (error) {
      console.error('Error creating location:', error);
      alert('Ошибка при создании локации');
    }
  };

  const handleUpdateLocation = async () => {
    if (!showEditLocation) return;

    try {
      const updates: Partial<Location> = {
        name: locationForm.name,
        city: locationForm.city,
        district: locationForm.district,
        coordinates: {
          lat: parseFloat(locationForm.lat),
          lng: parseFloat(locationForm.lng)
        },
        yandexMapsLink: locationForm.yandexMapsLink || undefined,
        description: locationForm.description
      };

      await apiService.updateLocation(showEditLocation.id, updates);
      await loadAllData();
      resetLocationForm();
      setShowEditLocation(null);
    } catch (error) {
      console.error('Error updating location:', error);
      alert('Ошибка при обновлении локации');
    }
  };

  const handleDeleteLocation = async (locationId: string) => {
    if (confirm('Вы уверены, что хотите удалить эту локацию?')) {
      try {
        await apiService.deleteLocation(locationId);
        await loadAllData();
      } catch (error) {
        console.error('Error deleting location:', error);
        alert('Ошибка при удалении локации');
      }
    }
  };

  const handleEditLocation = (location: Location) => {
    setLocationForm({
      name: location.name,
      city: location.city,
      district: location.district || '',
      lat: location.coordinates.lat.toString(),
      lng: location.coordinates.lng.toString(),
      yandexMapsLink: location.yandexMapsLink || '',
      description: location.description || ''
    });
    setShowEditLocation(location);
  };

  const resetLocationForm = () => {
    setLocationForm({
      name: '',
      city: '',
      district: '',
      lat: '',
      lng: '',
      yandexMapsLink: '',
      description: ''
    });
  };

  // Question management
  const handleCreateQuestion = async () => {
    if (!questionForm.text) {
      alert('Заполните текст вопроса');
      return;
    }

    try {
      const newQuestion: Omit<Question, 'id'> = {
        text: questionForm.text,
        type: questionForm.type,
        options: questionForm.type === 'multiple_choice' ? questionForm.options.filter(o => o.trim()) : undefined,
        correctAnswer: questionForm.type === 'multiple_choice' ? questionForm.correctAnswer : questionForm.text,
        locationId: questionForm.locationId,
        difficulty: questionForm.difficulty,
        isAI: questionForm.isAI
      };

      await apiService.createQuestion(newQuestion);
      await loadAllData();
      resetQuestionForm();
      setShowCreateQuestion(false);
    } catch (error) {
      console.error('Error creating question:', error);
      alert('Ошибка при создании вопроса');
    }
  };

  const handleUpdateQuestion = async () => {
    if (!showEditQuestion) return;

    try {
      const updates: Partial<Question> = {
        text: questionForm.text,
        type: questionForm.type,
        options: questionForm.type === 'multiple_choice' ? questionForm.options.filter(o => o.trim()) : undefined,
        correctAnswer: questionForm.type === 'multiple_choice' ? questionForm.correctAnswer : questionForm.text,
        locationId: questionForm.locationId,
        difficulty: questionForm.difficulty,
        isAI: questionForm.isAI
      };

      await apiService.updateQuestion(showEditQuestion.id, updates);
      await loadAllData();
      resetQuestionForm();
      setShowEditQuestion(null);
    } catch (error) {
      console.error('Error updating question:', error);
      alert('Ошибка при обновлении вопроса');
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (confirm('Вы уверены, что хотите удалить этот вопрос?')) {
      try {
        await apiService.deleteQuestion(questionId);
        await loadAllData();
      } catch (error) {
        console.error('Error deleting question:', error);
        alert('Ошибка при удалении вопроса');
      }
    }
  };

  const handleEditQuestion = (question: Question) => {
    setQuestionForm({
      text: question.text,
      type: question.type,
      options: question.options || ['', '', '', ''],
      correctAnswer: typeof question.correctAnswer === 'number' ? question.correctAnswer : 0,
      locationId: question.locationId || '',
      difficulty: question.difficulty || 'medium',
      isAI: question.isAI || false
    });
    setShowEditQuestion(question);
  };

  const resetQuestionForm = () => {
    setQuestionForm({
      text: '',
      type: 'multiple_choice',
      options: ['', '', '', ''],
      correctAnswer: 0,
      locationId: '',
      difficulty: 'medium',
      isAI: false
    });
  };

  // City management
  const handleCreateCity = async () => {
    if (!cityForm.name || !cityForm.lat || !cityForm.lng) {
      alert('Заполните все обязательные поля');
      return;
    }

    try {
      const newCity: Omit<City, 'id'> = {
        name: cityForm.name,
        coordinates: {
          lat: parseFloat(cityForm.lat),
          lng: parseFloat(cityForm.lng)
        },
        isActive: cityForm.isActive,
        districts: []
      };

      await apiService.createCity(newCity);
      await loadAllData();
      resetCityForm();
      setShowCreateCity(false);
    } catch (error) {
      console.error('Error creating city:', error);
      alert('Ошибка при создании города');
    }
  };

  const handleUpdateCity = async () => {
    if (!showEditCity) return;

    try {
      const updates: Partial<City> = {
        name: cityForm.name,
        coordinates: {
          lat: parseFloat(cityForm.lat),
          lng: parseFloat(cityForm.lng)
        },
        isActive: cityForm.isActive
      };

      await apiService.updateCity(showEditCity.id, updates);
      await loadAllData();
      resetCityForm();
      setShowEditCity(null);
    } catch (error) {
      console.error('Error updating city:', error);
      alert('Ошибка при обновлении города');
    }
  };

  const handleDeleteCity = async (cityId: string) => {
    if (confirm('Вы уверены, что хотите удалить этот город?')) {
      try {
        await apiService.deleteCity(cityId);
        await loadAllData();
      } catch (error) {
        console.error('Error deleting city:', error);
        alert('Ошибка при удалении города');
      }
    }
  };

  const handleEditCity = (city: City) => {
    setCityForm({
      name: city.name,
      lat: city.coordinates.lat.toString(),
      lng: city.coordinates.lng.toString(),
      isActive: city.isActive,
      newDistrict: ''
    });
    setShowEditCity(city);
  };

  const handleAddDistrict = async () => {
    if (!showEditCity || !cityForm.newDistrict) return;

    try {
      const newDistrict: Omit<District, 'id'> = {
        name: cityForm.newDistrict,
        cityId: showEditCity.id,
        coordinates: showEditCity.coordinates,
        isActive: true
      };

      await apiService.createDistrict(newDistrict);
      await loadAllData();
      setCityForm(prev => ({ ...prev, newDistrict: '' }));
    } catch (error) {
      console.error('Error adding district:', error);
      alert('Ошибка при добавлении района');
    }
  };

  const resetCityForm = () => {
    setCityForm({
      name: '',
      lat: '',
      lng: '',
      isActive: true,
      newDistrict: ''
    });
  };

  // User management
  const handleCreateUser = async () => {
    if (!userForm.firstName || !userForm.age || !userForm.phone || !userForm.telegramId) {
      alert('Заполните все обязательные поля');
      return;
    }

    try {
      const newUser: Omit<User, 'id' | 'registeredAt' | 'questsCompleted'> = {
        telegramId: userForm.telegramId,
        firstName: userForm.firstName,
        lastName: userForm.lastName || undefined,
        age: parseInt(userForm.age),
        phone: userForm.phone,
        email: userForm.email || undefined,
        agreementsSigned: {
          personalData: false,
          liability: false,
          contract: false,
          media: false,
          safety: false,
          minor: false,
          refusal: false
        }
      };

      await apiService.registerUser(newUser);
      await loadAllData();
      resetUserForm();
      setShowCreateUser(false);
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Ошибка при создании пользователя');
    }
  };

  const handleUpdateUser = async () => {
    if (!showEditUser) return;

    try {
      const updates: Partial<User> = {
        firstName: userForm.firstName,
        lastName: userForm.lastName || undefined,
        age: parseInt(userForm.age),
        phone: userForm.phone,
        email: userForm.email || undefined,
        telegramId: userForm.telegramId
      };

      await apiService.updateUser(showEditUser.id, updates);
      await loadAllData();
      resetUserForm();
      setShowEditUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Ошибка при обновлении пользователя');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      try {
        await apiService.deleteUser(userId);
        await loadAllData();
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Ошибка при удалении пользователя');
      }
    }
  };

  const handleEditUser = (user: User) => {
    setUserForm({
      firstName: user.firstName,
      lastName: user.lastName || '',
      age: user.age.toString(),
      phone: user.phone,
      email: user.email || '',
      telegramId: user.telegramId
    });
    setShowEditUser(user);
  };

  const resetUserForm = () => {
    setUserForm({
      firstName: '',
      lastName: '',
      age: '',
      phone: '',
      email: '',
      telegramId: ''
    });
  };

  // Agreement management
  const handleCreateAgreement = async () => {
    if (!agreementForm.title || !agreementForm.content) {
      alert('Заполните все обязательные поля');
      return;
    }

    try {
      const newAgreement: Omit<Agreement, 'id' | 'updatedAt'> = {
        type: agreementForm.type,
        title: agreementForm.title,
        content: agreementForm.content,
        isRequired: agreementForm.isRequired,
        version: agreementForm.version
      };

      await apiService.createAgreement(newAgreement);
      await loadAllData();
      resetAgreementForm();
      setShowCreateAgreement(false);
    } catch (error) {
      console.error('Error creating agreement:', error);
      alert('Ошибка при создании соглашения');
    }
  };

  const handleUpdateAgreement = async () => {
    if (!showEditAgreement) return;

    try {
      const updates: Partial<Agreement> = {
        title: agreementForm.title,
        content: agreementForm.content,
        isRequired: agreementForm.isRequired,
        version: agreementForm.version
      };

      await apiService.updateAgreement(showEditAgreement.id, updates);
      await loadAllData();
      resetAgreementForm();
      setShowEditAgreement(null);
    } catch (error) {
      console.error('Error updating agreement:', error);
      alert('Ошибка при обновлении соглашения');
    }
  };

  const handleDeleteAgreement = async (agreementId: string) => {
    if (confirm('Вы уверены, что хотите удалить это соглашение?')) {
      try {
        await apiService.deleteAgreement(agreementId);
        await loadAllData();
      } catch (error) {
        console.error('Error deleting agreement:', error);
        alert('Ошибка при удалении соглашения');
      }
    }
  };

  const handleEditAgreement = (agreement: Agreement) => {
    setAgreementForm({
      type: agreement.type,
      title: agreement.title,
      content: agreement.content,
      isRequired: agreement.isRequired,
      version: agreement.version
    });
    setShowEditAgreement(agreement);
  };

  const resetAgreementForm = () => {
    setAgreementForm({
      type: 'personal_data',
      title: '',
      content: '',
      isRequired: true,
      version: '1.0'
    });
  };

  // Generate AI Question
  const handleGenerateAIQuestion = async () => {
    if (!questionForm.locationId) {
      alert('Выберите локацию для генерации вопроса');
      return;
    }

    try {
      const aiQuestion = await apiService.generateAIQuestion(questionForm.locationId, questionForm.difficulty);
      setQuestionForm(prev => ({
        ...prev,
        text: aiQuestion.text,
        type: 'ai_generated',
        isAI: true
      }));
    } catch (error) {
      console.error('Error generating AI question:', error);
      alert('Ошибка при генерации вопроса ИИ');
    }
  };

  const tabs = [
    { id: 'quests', label: 'Квесты', icon: MapPin },
    { id: 'locations', label: 'Локации', icon: Map },
    { id: 'questions', label: 'Вопросы', icon: HelpCircle },
    { id: 'cities', label: 'Города', icon: Settings },
    { id: 'users', label: 'Пользователи', icon: Users },
    { id: 'agreements', label: 'Соглашения', icon: FileText },
    { id: 'progress', label: 'Прогресс', icon: TrendingUp },
    { id: 'payments', label: 'Платежи', icon: DollarSign },
    { id: 'analytics', label: 'Аналитика', icon: BarChart3 }
  ];

  const renderQuestForm = (isEdit = false) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          {isEdit ? 'Редактирование квеста' : 'Создание квеста'}
        </h2>
        <div className="flex space-x-2">
          <Button 
            size="sm" 
            variant="secondary" 
            onClick={() => {
              resetQuestForm();
              setShowCreateQuest(false);
              setShowEditQuest(null);
            }}
          >
            <X className="w-4 h-4 mr-1" />
            Отмена
          </Button>
          <Button 
            size="sm" 
            onClick={isEdit ? handleUpdateQuest : handleCreateQuest}
          >
            <Save className="w-4 h-4 mr-1" />
            {isEdit ? 'Сохранить' : 'Создать'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Input
          label="Название квеста *"
          value={questForm.title}
          onChange={(e) => setQuestForm(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Тайны Старого Города"
        />

        <textarea
          className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="Описание квеста"
          value={questForm.description}
          onChange={(e) => setQuestForm(prev => ({ ...prev, description: e.target.value }))}
        />

        <div className="grid grid-cols-2 gap-4">
          <select
            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={questForm.city}
            onChange={(e) => setQuestForm(prev => ({ ...prev, city: e.target.value }))}
          >
            <option value="">Выберите город *</option>
            {cities.map(city => (
              <option key={city.id} value={city.name}>{city.name}</option>
            ))}
          </select>
          
          <select
            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={questForm.district}
            onChange={(e) => setQuestForm(prev => ({ ...prev, district: e.target.value }))}
          >
            <option value="">Выберите район</option>
            {cities.find(c => c.name === questForm.city)?.districts.map(district => (
              <option key={district.id} value={district.name}>{district.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Количество локаций (4-10) *"
            type="number"
            min="4"
            max="10"
            value={questForm.locationCount.toString()}
            onChange={(e) => setQuestForm(prev => ({ ...prev, locationCount: parseInt(e.target.value) || 4 }))}
          />
          <Input
            label="Стоимость (₽) *"
            type="number"
            min="0"
            value={questForm.price.toString()}
            onChange={(e) => setQuestForm(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
          />
        </div>

        <textarea
          className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="Условия квеста *"
          value={questForm.conditions}
          onChange={(e) => setQuestForm(prev => ({ ...prev, conditions: e.target.value }))}
        />

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            checked={questForm.isActive}
            onChange={(e) => setQuestForm(prev => ({ ...prev, isActive: e.target.checked }))}
            className="mr-2"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
            Квест активен
          </label>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-semibold text-gray-900 mb-3">Стартовая локация</h3>
          <div className="grid grid-cols-1 gap-4">
            <Input
              label="Название *"
              value={questForm.startLocationName}
              onChange={(e) => setQuestForm(prev => ({ ...prev, startLocationName: e.target.value }))}
              placeholder="Красная площадь"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Широта *"
                type="number"
                step="0.000001"
                value={questForm.startLocationLat}
                onChange={(e) => setQuestForm(prev => ({ ...prev, startLocationLat: e.target.value }))}
                placeholder="55.7539"
              />
              <Input
                label="Долгота *"
                type="number"
                step="0.000001"
                value={questForm.startLocationLng}
                onChange={(e) => setQuestForm(prev => ({ ...prev, startLocationLng: e.target.value }))}
                placeholder="37.6208"
              />
            </div>
            <Input
              label="Ссылка на Яндекс.Карты"
              value={questForm.startLocationYandex}
              onChange={(e) => setQuestForm(prev => ({ ...prev, startLocationYandex: e.target.value }))}
              placeholder="https://yandex.ru/maps/?pt=37.6208,55.7539&z=18"
            />
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-semibold text-gray-900 mb-3">Финальная локация</h3>
          <div className="grid grid-cols-1 gap-4">
            <Input
              label="Название *"
              value={questForm.finalLocationName}
              onChange={(e) => setQuestForm(prev => ({ ...prev, finalLocationName: e.target.value }))}
              placeholder="Парк Зарядье"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Широта *"
                type="number"
                step="0.000001"
                value={questForm.finalLocationLat}
                onChange={(e) => setQuestForm(prev => ({ ...prev, finalLocationLat: e.target.value }))}
                placeholder="55.7508"
              />
              <Input
                label="Долгота *"
                type="number"
                step="0.000001"
                value={questForm.finalLocationLng}
                onChange={(e) => setQuestForm(prev => ({ ...prev, finalLocationLng: e.target.value }))}
                placeholder="37.6281"
              />
            </div>
            <Input
              label="Ссылка на Яндекс.Карты"
              value={questForm.finalLocationYandex}
              onChange={(e) => setQuestForm(prev => ({ ...prev, finalLocationYandex: e.target.value }))}
              placeholder="https://yandex.ru/maps/?pt=37.6281,55.7508&z=18"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderLocationForm = (isEdit = false) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          {isEdit ? 'Редактирование локации' : 'Создание локации'}
        </h2>
        <div className="flex space-x-2">
          <Button 
            size="sm" 
            variant="secondary" 
            onClick={() => {
              resetLocationForm();
              setShowCreateLocation(false);
              setShowEditLocation(null);
            }}
          >
            <X className="w-4 h-4 mr-1" />
            Отмена
          </Button>
          <Button 
            size="sm" 
            onClick={isEdit ? handleUpdateLocation : handleCreateLocation}
          >
            <Save className="w-4 h-4 mr-1" />
            {isEdit ? 'Сохранить' : 'Создать'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Input
          label="Название локации *"
          value={locationForm.name}
          onChange={(e) => setLocationForm(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Красная площадь"
        />

        <div className="grid grid-cols-2 gap-4">
          <select
            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={locationForm.city}
            onChange={(e) => setLocationForm(prev => ({ ...prev, city: e.target.value }))}
          >
            <option value="">Выберите город *</option>
            {cities.map(city => (
              <option key={city.id} value={city.name}>{city.name}</option>
            ))}
          </select>
          
          <select
            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={locationForm.district}
            onChange={(e) => setLocationForm(prev => ({ ...prev, district: e.target.value }))}
          >
            <option value="">Выберите район</option>
            {cities.find(c => c.name === locationForm.city)?.districts.map(district => (
              <option key={district.id} value={district.name}>{district.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Широта *"
            type="number"
            step="0.000001"
            value={locationForm.lat}
            onChange={(e) => setLocationForm(prev => ({ ...prev, lat: e.target.value }))}
            placeholder="55.7539"
          />
          <Input
            label="Долгота *"
            type="number"
            step="0.000001"
            value={locationForm.lng}
            onChange={(e) => setLocationForm(prev => ({ ...prev, lng: e.target.value }))}
            placeholder="37.6208"
          />
        </div>

        <Input
          label="Ссылка на Яндекс.Карты"
          value={locationForm.yandexMapsLink}
          onChange={(e) => setLocationForm(prev => ({ ...prev, yandexMapsLink: e.target.value }))}
          placeholder="https://yandex.ru/maps/?pt=37.6208,55.7539&z=18"
        />

        <textarea
          className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="Описание локации"
          value={locationForm.description}
          onChange={(e) => setLocationForm(prev => ({ ...prev, description: e.target.value }))}
        />
      </div>
    </div>
  );

  const renderQuestionForm = (isEdit = false) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          {isEdit ? 'Редактирование вопроса' : 'Создание вопроса'}
        </h2>
        <div className="flex space-x-2">
          <Button 
            size="sm" 
            variant="secondary" 
            onClick={() => {
              resetQuestionForm();
              setShowCreateQuestion(false);
              setShowEditQuestion(null);
            }}
          >
            <X className="w-4 h-4 mr-1" />
            Отмена
          </Button>
          <Button 
            size="sm" 
            onClick={isEdit ? handleUpdateQuestion : handleCreateQuestion}
          >
            <Save className="w-4 h-4 mr-1" />
            {isEdit ? 'Сохранить' : 'Создать'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <textarea
          className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="Текст вопроса *"
          value={questionForm.text}
          onChange={(e) => setQuestionForm(prev => ({ ...prev, text: e.target.value }))}
        />

        <div className="grid grid-cols-2 gap-4">
          <select
            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={questionForm.type}
            onChange={(e) => setQuestionForm(prev => ({ ...prev, type: e.target.value as any }))}
          >
            <option value="multiple_choice">Множественный выбор</option>
            <option value="open_text">Открытый ответ</option>
            <option value="ai_generated">ИИ генерация</option>
          </select>

          <select
            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={questionForm.difficulty}
            onChange={(e) => setQuestionForm(prev => ({ ...prev, difficulty: e.target.value as any }))}
          >
            <option value="easy">Легкий</option>
            <option value="medium">Средний</option>
            <option value="hard">Сложный</option>
          </select>
        </div>

        <select
          className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={questionForm.locationId}
          onChange={(e) => setQuestionForm(prev => ({ ...prev, locationId: e.target.value }))}
        >
          <option value="">Выберите локацию</option>
          {locations.map(location => (
            <option key={location.id} value={location.id}>
              {location.name} ({location.city})
            </option>
          ))}
        </select>

        {questionForm.type === 'multiple_choice' && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Варианты ответов</label>
            {questionForm.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="correctAnswer"
                  checked={questionForm.correctAnswer === index}
                  onChange={() => setQuestionForm(prev => ({ ...prev, correctAnswer: index }))}
                  className="text-blue-600"
                />
                <Input
                  placeholder={`Вариант ${index + 1}`}
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...questionForm.options];
                    newOptions[index] = e.target.value;
                    setQuestionForm(prev => ({ ...prev, options: newOptions }));
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {questionForm.type === 'ai_generated' && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-blue-900">Генерация вопроса ИИ</h3>
              <Button size="sm" onClick={handleGenerateAIQuestion}>
                Генерировать вопрос
              </Button>
            </div>
            <p className="text-sm text-blue-800">
              Выберите локацию и сложность, затем нажмите "Генерировать вопрос" для создания вопроса с помощью ИИ
            </p>
          </div>
        )}

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isAI"
            checked={questionForm.isAI}
            onChange={(e) => setQuestionForm(prev => ({ ...prev, isAI: e.target.checked }))}
            className="mr-2"
          />
          <label htmlFor="isAI" className="text-sm font-medium text-gray-700">
            Вопрос создан ИИ
          </label>
        </div>
      </div>
    </div>
  );

  const renderCityForm = (isEdit = false) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          {isEdit ? 'Редактирование города' : 'Создание города'}
        </h2>
        <div className="flex space-x-2">
          <Button 
            size="sm" 
            variant="secondary" 
            onClick={() => {
              resetCityForm();
              setShowCreateCity(false);
              setShowEditCity(null);
            }}
          >
            <X className="w-4 h-4 mr-1" />
            Отмена
          </Button>
          <Button 
            size="sm" 
            onClick={isEdit ? handleUpdateCity : handleCreateCity}
          >
            <Save className="w-4 h-4 mr-1" />
            {isEdit ? 'Сохранить' : 'Создать'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Input
          label="Название города *"
          value={cityForm.name}
          onChange={(e) => setCityForm(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Москва"
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Широта *"
            type="number"
            step="0.000001"
            value={cityForm.lat}
            onChange={(e) => setCityForm(prev => ({ ...prev, lat: e.target.value }))}
            placeholder="55.7558"
          />
          <Input
            label="Долгота *"
            type="number"
            step="0.000001"
            value={cityForm.lng}
            onChange={(e) => setCityForm(prev => ({ ...prev, lng: e.target.value }))}
            placeholder="37.6176"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="cityIsActive"
            checked={cityForm.isActive}
            onChange={(e) => setCityForm(prev => ({ ...prev, isActive: e.target.checked }))}
            className="mr-2"
          />
          <label htmlFor="cityIsActive" className="text-sm font-medium text-gray-700">
            Город активен
          </label>
        </div>

        {isEdit && showEditCity && (
          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-900 mb-3">Районы города</h3>
            <div className="space-y-2 mb-4">
              {showEditCity.districts.map(district => (
                <div key={district.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span>{district.name}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    district.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {district.isActive ? 'Активен' : 'Неактивен'}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex space-x-2">
              <Input
                placeholder="Название нового района"
                value={cityForm.newDistrict}
                onChange={(e) => setCityForm(prev => ({ ...prev, newDistrict: e.target.value }))}
              />
              <Button size="sm" onClick={handleAddDistrict}>
                <Plus className="w-4 h-4 mr-1" />
                Добавить
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderUserForm = (isEdit = false) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          {isEdit ? 'Редактирование пользователя' : 'Создание пользователя'}
        </h2>
        <div className="flex space-x-2">
          <Button 
            size="sm" 
            variant="secondary" 
            onClick={() => {
              resetUserForm();
              setShowCreateUser(false);
              setShowEditUser(null);
            }}
          >
            <X className="w-4 h-4 mr-1" />
            Отмена
          </Button>
          <Button 
            size="sm" 
            onClick={isEdit ? handleUpdateUser : handleCreateUser}
          >
            <Save className="w-4 h-4 mr-1" />
            {isEdit ? 'Сохранить' : 'Создать'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Input
          label="Telegram ID *"
          value={userForm.telegramId}
          onChange={(e) => setUserForm(prev => ({ ...prev, telegramId: e.target.value }))}
          placeholder="123456789"
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Имя *"
            value={userForm.firstName}
            onChange={(e) => setUserForm(prev => ({ ...prev, firstName: e.target.value }))}
            placeholder="Иван"
          />
          <Input
            label="Фамилия"
            value={userForm.lastName}
            onChange={(e) => setUserForm(prev => ({ ...prev, lastName: e.target.value }))}
            placeholder="Петров"
          />
        </div>

        <Input
          label="Возраст *"
          type="number"
          min="12"
          max="99"
          value={userForm.age}
          onChange={(e) => setUserForm(prev => ({ ...prev, age: e.target.value }))}
          placeholder="25"
        />

        <Input
          label="Телефон *"
          value={userForm.phone}
          onChange={(e) => setUserForm(prev => ({ ...prev, phone: e.target.value }))}
          placeholder="+7 999 123 45 67"
        />

        <Input
          label="Email"
          type="email"
          value={userForm.email}
          onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
          placeholder="ivan@example.com"
        />
      </div>
    </div>
  );

  const renderAgreementForm = (isEdit = false) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          {isEdit ? 'Редактирование соглашения' : 'Создание соглашения'}
        </h2>
        <div className="flex space-x-2">
          <Button 
            size="sm" 
            variant="secondary" 
            onClick={() => {
              resetAgreementForm();
              setShowCreateAgreement(false);
              setShowEditAgreement(null);
            }}
          >
            <X className="w-4 h-4 mr-1" />
            Отмена
          </Button>
          <Button 
            size="sm" 
            onClick={isEdit ? handleUpdateAgreement : handleCreateAgreement}
          >
            <Save className="w-4 h-4 mr-1" />
            {isEdit ? 'Сохранить' : 'Создать'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="grid grid-cols-2 gap-4">
          <select
            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={agreementForm.type}
            onChange={(e) => setAgreementForm(prev => ({ ...prev, type: e.target.value as Agreement['type'] }))}
          >
            <option value="personal_data">Персональные данные</option>
            <option value="liability">Освобождение от ответственности</option>
            <option value="contract">Договор оферты</option>
            <option value="media">Фото- и видеосъемка</option>
            <option value="safety">Правила безопасности</option>
            <option value="minor">Участие несовершеннолетнего</option>
            <option value="refusal">Право на отказ</option>
          </select>

          <Input
            label="Версия"
            value={agreementForm.version}
            onChange={(e) => setAgreementForm(prev => ({ ...prev, version: e.target.value }))}
            placeholder="1.0"
          />
        </div>

        <Input
          label="Заголовок *"
          value={agreementForm.title}
          onChange={(e) => setAgreementForm(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Согласие на обработку персональных данных"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Текст соглашения *</label>
          <textarea
            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={8}
            placeholder="Полный текст соглашения..."
            value={agreementForm.content}
            onChange={(e) => setAgreementForm(prev => ({ ...prev, content: e.target.value }))}
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="agreementIsRequired"
            checked={agreementForm.isRequired}
            onChange={(e) => setAgreementForm(prev => ({ ...prev, isRequired: e.target.checked }))}
            className="mr-2"
          />
          <label htmlFor="agreementIsRequired" className="text-sm font-medium text-gray-700">
            Обязательное соглашение
          </label>
        </div>
      </div>
    </div>
  );

  const renderQuestsList = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Управление квестами</h2>
        <Button size="sm" onClick={() => setShowCreateQuest(true)} className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Создать квест
        </Button>
      </div>
      
      {quests.map((quest) => (
        <div key={quest.id} className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{quest.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{quest.description}</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  quest.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {quest.isActive ? 'Активен' : 'Неактивен'}
                </span>
                <span className="text-sm text-gray-600">{quest.city}</span>
                {quest.district && <span className="text-sm text-gray-600">{quest.district}</span>}
                <span className="text-sm text-gray-600">{quest.locationCount} локаций</span>
                <span className="text-sm text-gray-600">{quest.price} ₽</span>
              </div>
              {statistics[quest.id] && (
                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                  <span>Участников: {statistics[quest.id].totalParticipants}</span>
                  <span>Завершили: {statistics[quest.id].completedParticipants}</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="secondary" onClick={() => handleEditQuest(quest)}>
                <Edit className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="danger" onClick={() => handleDeleteQuest(quest.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderLocationsList = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Управление локациями</h2>
        <Button size="sm" onClick={() => setShowCreateLocation(true)} className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Добавить локацию
        </Button>
      </div>
      
      {locations.map((location) => (
        <div key={location.id} className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{location.name}</h3>
              <p className="text-sm text-gray-600">{location.city}{location.district && `, ${location.district}`}</p>
              <p className="text-sm text-gray-600">
                {location.coordinates.lat.toFixed(4)}, {location.coordinates.lng.toFixed(4)}
              </p>
              {location.description && (
                <p className="text-sm text-gray-600 mt-1">{location.description}</p>
              )}
              {location.yandexMapsLink && (
                <a href={location.yandexMapsLink} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800">
                  Открыть в Яндекс.Картах
                </a>
              )}
              <p className="text-sm text-green-600 mt-1">Вопросов: {location.questions.length}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="secondary" onClick={() => handleEditLocation(location)}>
                <Edit className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="danger" onClick={() => handleDeleteLocation(location.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderQuestionsList = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Управление вопросами</h2>
        <Button size="sm" onClick={() => setShowCreateQuestion(true)} className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Добавить вопрос
        </Button>
      </div>
      
      {questions.map((question) => (
        <div key={question.id} className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{question.text}</h3>
              <div className="flex items-center space-x-4 mt-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  question.type === 'multiple_choice' ? 'bg-blue-100 text-blue-800' :
                  question.type === 'open_text' ? 'bg-green-100 text-green-800' :
                  'bg-purple-100 text-purple-800'
                }`}>
                  {question.type === 'multiple_choice' ? 'Выбор' : 
                   question.type === 'open_text' ? 'Открытый' : 'ИИ'}
                </span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  question.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                  question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {question.difficulty === 'easy' ? 'Легкий' : 
                   question.difficulty === 'medium' ? 'Средний' : 'Сложный'}
                </span>
                {question.isAI && (
                  <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                    ИИ
                  </span>
                )}
              </div>
              {question.locationId && (
                <p className="text-sm text-gray-600 mt-1">
                  Локация: {locations.find(l => l.id === question.locationId)?.name || 'Не найдена'}
                </p>
              )}
              {question.options && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">Варианты ответов:</p>
                  <ul className="text-sm text-gray-600 ml-4">
                    {question.options.map((option, index) => (
                      <li key={index} className={index === question.correctAnswer ? 'font-semibold text-green-600' : ''}>
                        {index + 1}. {option} {index === question.correctAnswer && '✓'}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="secondary" onClick={() => handleEditQuestion(question)}>
                <Edit className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="danger" onClick={() => handleDeleteQuestion(question.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderCitiesList = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Управление городами</h2>
        <Button size="sm" onClick={() => setShowCreateCity(true)} className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Добавить город
        </Button>
      </div>
      
      {cities.map((city) => (
        <div key={city.id} className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{city.name}</h3>
              <p className="text-sm text-gray-600">
                {city.coordinates.lat.toFixed(4)}, {city.coordinates.lng.toFixed(4)}
              </p>
              <div className="flex items-center space-x-4 mt-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  city.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {city.isActive ? 'Активен' : 'Неактивен'}
                </span>
                <span className="text-sm text-gray-600">Районов: {city.districts.length}</span>
              </div>
              {city.districts.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">Районы:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {city.districts.map(district => (
                      <span key={district.id} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {district.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="secondary" onClick={() => handleEditCity(city)}>
                <Edit className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="danger" onClick={() => handleDeleteCity(city.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderUsersList = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Пользователи</h2>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            Всего: {users.length}
          </div>
          <Button size="sm" onClick={() => setShowCreateUser(true)} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Добавить пользователя
          </Button>
        </div>
      </div>
      
      {users.map((user) => (
        <div key={user.id} className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{user.firstName} {user.lastName}</h3>
              <p className="text-sm text-gray-600">Telegram ID: {user.telegramId}</p>
              <p className="text-sm text-gray-600">{user.phone}</p>
              {user.email && <p className="text-sm text-gray-600">{user.email}</p>}
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Возраст: {user.age}
                </span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  Квестов завершено: {user.questsCompleted.length}
                </span>
                {user.location && (
                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                    {user.location.city}
                  </span>
                )}
              </div>
              <div className="mt-2">
                <p className="text-sm text-gray-600">Соглашения:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {Object.entries(user.agreementsSigned).map(([key, signed]) => (
                    <span key={key} className={`text-xs px-2 py-1 rounded ${
                      signed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {key}: {signed ? '✓' : '✗'}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="secondary" onClick={() => handleEditUser(user)}>
                <Edit className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="danger" onClick={() => handleDeleteUser(user.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderAgreementsList = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Управление соглашениями</h2>
        <Button size="sm" onClick={() => setShowCreateAgreement(true)} className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Добавить соглашение
        </Button>
      </div>
      
      {agreements.map((agreement) => (
        <div key={agreement.id} className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{agreement.title}</h3>
              <p className="text-sm text-gray-600 mt-1">Тип: {agreement.type}</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  agreement.isRequired ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {agreement.isRequired ? 'Обязательное' : 'Опциональное'}
                </span>
                <span className="text-sm text-gray-600">
                  Версия: {agreement.version}
                </span>
                <span className="text-sm text-gray-600">
                  Обновлено: {agreement.updatedAt.toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                {agreement.content.substring(0, 150)}...
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="secondary" onClick={() => handleEditAgreement(agreement)}>
                <Edit className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="danger" onClick={() => handleDeleteAgreement(agreement.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderProgressList = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Прогресс участников</h2>
      
      {participations.map((participation) => {
        const user = users.find(u => u.id === participation.userId);
        const quest = quests.find(q => q.id === participation.questId);
        
        return (
          <div key={participation.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  {user?.firstName} {user?.lastName} - {quest?.title}
                </h3>
                <div className="flex items-center space-x-4 mt-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    participation.status === 'completed' ? 'bg-green-100 text-green-800' :
                    participation.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    participation.status === 'disqualified' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {participation.status === 'completed' ? 'Завершен' :
                     participation.status === 'in_progress' ? 'В процессе' :
                     participation.status === 'disqualified' ? 'Дисквалифицирован' :
                     participation.status === 'cancelled' ? 'Отменен' : 'Зарегистрирован'}
                  </span>
                  <span className="text-sm text-gray-600">
                    Локация: {participation.currentLocationIndex + 1}/{quest?.locationCount || 0}
                  </span>
                  <span className="text-sm text-gray-600">
                    Ответов: {participation.answers.length}
                  </span>
                  <span className="text-sm text-gray-600">
                    Нарушений: {participation.speedViolations.length}
                  </span>
                </div>
                {participation.totalScore !== undefined && (
                  <p className="text-sm text-gray-600 mt-1">
                    Очки: {participation.totalScore}
                  </p>
                )}
                {participation.completionTime && (
                  <p className="text-sm text-gray-600">
                    Время прохождения: {Math.round(participation.completionTime / 60)} мин
                  </p>
                )}
                <p className="text-sm text-gray-600">
                  Регистрация: {participation.registrationTime.toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="secondary">
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderPaymentsList = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Платежи</h2>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-green-900">Успешные</h3>
          <p className="text-2xl font-bold text-green-600">
            {payments.filter(p => p.status === 'completed').length}
          </p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="font-semibold text-yellow-900">В ожидании</h3>
          <p className="text-2xl font-bold text-yellow-600">
            {payments.filter(p => p.status === 'pending').length}
          </p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-900">Общая сумма</h3>
          <p className="text-2xl font-bold text-blue-600">
            {payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0)} ₽
          </p>
        </div>
      </div>
      
      {payments.map((payment) => {
        const user = users.find(u => u.id === payment.userId);
        const quest = quests.find(q => q.id === payment.questId);
        
        return (
          <div key={payment.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  {user?.firstName} {user?.lastName} - {quest?.title}
                </h3>
                <div className="flex items-center space-x-4 mt-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                    payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    payment.status === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {payment.status === 'completed' ? 'Завершен' :
                     payment.status === 'pending' ? 'В ожидании' :
                     payment.status === 'failed' ? 'Неудачный' : 'Возвращен'}
                  </span>
                  <span className="text-sm text-gray-600">
                    {payment.amount} {payment.currency}
                  </span>
                  <span className="text-sm text-gray-600">
                    {payment.paymentMethod}
                  </span>
                </div>
                {payment.transactionId && (
                  <p className="text-sm text-gray-600 mt-1">
                    ID транзакции: {payment.transactionId}
                  </p>
                )}
                <p className="text-sm text-gray-600">
                  Создан: {payment.createdAt.toLocaleDateString()}
                </p>
                {payment.completedAt && (
                  <p className="text-sm text-gray-600">
                    Завершен: {payment.completedAt.toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Аналитика и статистика</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-900">Активные квесты</h3>
          <p className="text-2xl font-bold text-blue-600">{quests.filter(q => q.isActive).length}</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-green-900">Пользователи</h3>
          <p className="text-2xl font-bold text-green-600">{users.length}</p>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="font-semibold text-yellow-900">Доход</h3>
          <p className="text-2xl font-bold text-yellow-600">
            ₽{payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
          </p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="font-semibold text-purple-900">Локации</h3>
          <p className="text-2xl font-bold text-purple-600">{locations.length}</p>
        </div>

        <div className="bg-indigo-50 p-4 rounded-lg">
          <h3 className="font-semibold text-indigo-900">Вопросы</h3>
          <p className="text-2xl font-bold text-indigo-600">{questions.length}</p>
        </div>

        <div className="bg-pink-50 p-4 rounded-lg">
          <h3 className="font-semibold text-pink-900">Города</h3>
          <p className="text-2xl font-bold text-pink-600">{cities.length}</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Статистика по квестам</h3>
        <div className="space-y-4">
          {quests.map(quest => {
            const stats = statistics[quest.id];
            if (!stats) return null;
            
            return (
              <div key={quest.id} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900">{quest.title}</h4>
                <div className="grid grid-cols-4 gap-4 mt-2">
                  <div>
                    <p className="text-sm text-gray-600">Участников</p>
                    <p className="font-semibold">{stats.totalParticipants}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Завершили</p>
                    <p className="font-semibold">{stats.completedParticipants}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Среднее время</p>
                    <p className="font-semibold">{Math.round(stats.averageCompletionTime / 60)} мин</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Средний балл</p>
                    <p className="font-semibold">{stats.averageScore.toFixed(1)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Система уведомлений</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">Напоминания за 24ч</p>
                <p className="text-sm text-blue-700">Отправлено: {notifications24hCount} (Telegram + SMS + Email)</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Напоминания за 3ч</p>
                <p className="text-sm text-green-700">Отправлено: {notifications3hCount} (Telegram + SMS)</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-purple-600" />
              <div>
                <p className="font-medium text-purple-900">Напоминания за 1ч</p>
                <p className="text-sm text-purple-700">Отправлено: {notifications1hCount} (Telegram)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (showCreateQuest) return renderQuestForm();
    if (showEditQuest) return renderQuestForm(true);
    if (showCreateLocation) return renderLocationForm();
    if (showEditLocation) return renderLocationForm(true);
    if (showCreateQuestion) return renderQuestionForm();
    if (showEditQuestion) return renderQuestionForm(true);
    if (showCreateCity) return renderCityForm();
    if (showEditCity) return renderCityForm(true);
    if (showCreateUser) return renderUserForm();
    if (showEditUser) return renderUserForm(true);
    if (showCreateAgreement) return renderAgreementForm();
    if (showEditAgreement) return renderAgreementForm(true);

    switch (activeTab) {
      case 'quests': return renderQuestsList();
      case 'locations': return renderLocationsList();
      case 'questions': return renderQuestionsList();
      case 'cities': return renderCitiesList();
      case 'users': return renderUsersList();
      case 'agreements': return renderAgreementsList();
      case 'progress': return renderProgressList();
      case 'payments': return renderPaymentsList();
      case 'analytics': return renderAnalytics();
      default: return null;
    }
  };

  return (
    <Layout title="Админ-панель" onBack={onBack} showBack>
      <div className="flex flex-col h-full">
        <div className="border-b border-gray-200 bg-white">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    // Reset all modal states
                    setShowCreateQuest(false);
                    setShowEditQuest(null);
                    setShowCreateLocation(false);
                    setShowEditLocation(null);
                    setShowCreateQuestion(false);
                    setShowEditQuestion(null);
                    setShowCreateCity(false);
                    setShowEditCity(null);
                    setShowCreateUser(false);
                    setShowEditUser(null);
                    setShowCreateAgreement(false);
                    setShowEditAgreement(null);
                  }}
                  className={`flex items-center space-x-2 px-4 py-3 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
        
        <div className="flex-1 p-6 bg-gray-50 overflow-y-auto">
          {renderContent()}
        </div>
      </div>
    </Layout>
  );
};