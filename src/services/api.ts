import { User, Quest, QuestParticipation, Agreement, Notification, City, District, Location, Question, Payment, QuestStatistics, UserProgress } from '../types';

class ApiService {
  private baseUrl = '/api';

  // User management
  async registerUser(userData: Omit<User, 'id' | 'registeredAt' | 'questsCompleted'>): Promise<User> {
    const user: User = {
      ...userData,
      id: Math.random().toString(36).substr(2, 9),
      registeredAt: new Date(),
      questsCompleted: []
    };
    
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.saveToStorage('users', user);
    return user;
  }

  async getUserByTelegramId(telegramId: string): Promise<User | null> {
    const users = this.getFromStorage<User[]>('users') || [];
    return users.find(user => user.telegramId === telegramId) || null;
  }

  async updateUserLocation(userId: string, location: { lat: number; lng: number; city?: string; district?: string }): Promise<void> {
    const users = this.getFromStorage<User[]>('users') || [];
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      users[userIndex].location = location;
      localStorage.setItem('users', JSON.stringify(users));
      
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        const user = JSON.parse(stored);
        if (user.id === userId) {
          user.location = location;
          localStorage.setItem('currentUser', JSON.stringify(user));
        }
      }
    }
  }

  async updateUserAgreements(userId: string, agreements: User['agreementsSigned']): Promise<void> {
    const users = this.getFromStorage<User[]>('users') || [];
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      users[userIndex].agreementsSigned = agreements;
      localStorage.setItem('users', JSON.stringify(users));
      
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        const user = JSON.parse(stored);
        if (user.id === userId) {
          user.agreementsSigned = agreements;
          localStorage.setItem('currentUser', JSON.stringify(user));
        }
      }
    }
  }

  async getAllUsers(): Promise<User[]> {
    return this.getFromStorage<User[]>('users') || [];
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    const users = this.getFromStorage<User[]>('users') || [];
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updates };
      localStorage.setItem('users', JSON.stringify(users));
    }
  }

  async deleteUser(userId: string): Promise<void> {
    const users = this.getFromStorage<User[]>('users') || [];
    const filteredUsers = users.filter(u => u.id !== userId);
    localStorage.setItem('users', JSON.stringify(filteredUsers));
  }

  // Quest management
  async getQuestsByLocation(city: string, district?: string): Promise<Quest[]> {
    const quests = this.getFromStorage<Quest[]>('quests') || this.getDefaultQuests();
    return quests.filter(quest => 
      quest.city === city && 
      quest.isActive && 
      (!district || quest.district === district)
    );
  }

  async getAllQuests(): Promise<Quest[]> {
    return this.getFromStorage<Quest[]>('quests') || this.getDefaultQuests();
  }

  async getQuestById(questId: string): Promise<Quest | null> {
    const quests = await this.getAllQuests();
    return quests.find(q => q.id === questId) || null;
  }

  async createQuest(questData: Omit<Quest, 'id' | 'createdAt'>): Promise<Quest> {
    const quest: Quest = {
      ...questData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date()
    };
    
    this.saveToStorage('quests', quest);
    return quest;
  }

  async updateQuest(questId: string, updates: Partial<Quest>): Promise<void> {
    const quests = this.getFromStorage<Quest[]>('quests') || [];
    const questIndex = quests.findIndex(q => q.id === questId);
    if (questIndex !== -1) {
      quests[questIndex] = { ...quests[questIndex], ...updates };
      localStorage.setItem('quests', JSON.stringify(quests));
    }
  }

  async deleteQuest(questId: string): Promise<void> {
    const quests = this.getFromStorage<Quest[]>('quests') || [];
    const filteredQuests = quests.filter(q => q.id !== questId);
    localStorage.setItem('quests', JSON.stringify(filteredQuests));
  }

  // Location management
  async getAllLocations(): Promise<Location[]> {
    return this.getFromStorage<Location[]>('locations') || this.getDefaultLocations();
  }

  async getLocationsByCity(city: string, district?: string): Promise<Location[]> {
    const locations = await this.getAllLocations();
    return locations.filter(loc => 
      loc.city === city && 
      (!district || loc.district === district)
    );
  }

  async createLocation(locationData: Omit<Location, 'id'>): Promise<Location> {
    const location: Location = {
      ...locationData,
      id: Math.random().toString(36).substr(2, 9)
    };
    
    this.saveToStorage('locations', location);
    return location;
  }

  async updateLocation(locationId: string, updates: Partial<Location>): Promise<void> {
    const locations = this.getFromStorage<Location[]>('locations') || [];
    const locationIndex = locations.findIndex(l => l.id === locationId);
    if (locationIndex !== -1) {
      locations[locationIndex] = { ...locations[locationIndex], ...updates };
      localStorage.setItem('locations', JSON.stringify(locations));
    }
  }

  async deleteLocation(locationId: string): Promise<void> {
    const locations = this.getFromStorage<Location[]>('locations') || [];
    const filteredLocations = locations.filter(l => l.id !== locationId);
    localStorage.setItem('locations', JSON.stringify(filteredLocations));
  }

  // Question management
  async getAllQuestions(): Promise<Question[]> {
    return this.getFromStorage<Question[]>('questions') || this.getDefaultQuestions();
  }

  async getQuestionsByLocation(locationId: string): Promise<Question[]> {
    const questions = await this.getAllQuestions();
    return questions.filter(q => q.locationId === locationId);
  }

  async createQuestion(questionData: Omit<Question, 'id'>): Promise<Question> {
    const question: Question = {
      ...questionData,
      id: Math.random().toString(36).substr(2, 9)
    };
    
    this.saveToStorage('questions', question);
    return question;
  }

  async updateQuestion(questionId: string, updates: Partial<Question>): Promise<void> {
    const questions = this.getFromStorage<Question[]>('questions') || [];
    const questionIndex = questions.findIndex(q => q.id === questionId);
    if (questionIndex !== -1) {
      questions[questionIndex] = { ...questions[questionIndex], ...updates };
      localStorage.setItem('questions', JSON.stringify(questions));
    }
  }

  async deleteQuestion(questionId: string): Promise<void> {
    const questions = this.getFromStorage<Question[]>('questions') || [];
    const filteredQuestions = questions.filter(q => q.id !== questionId);
    localStorage.setItem('questions', JSON.stringify(filteredQuestions));
  }

  // City and District management
  async getAllCities(): Promise<City[]> {
    return this.getFromStorage<City[]>('cities') || this.getDefaultCities();
  }

  async createCity(cityData: Omit<City, 'id'>): Promise<City> {
    const city: City = {
      ...cityData,
      id: Math.random().toString(36).substr(2, 9)
    };
    
    this.saveToStorage('cities', city);
    return city;
  }

  async updateCity(cityId: string, updates: Partial<City>): Promise<void> {
    const cities = this.getFromStorage<City[]>('cities') || [];
    const cityIndex = cities.findIndex(c => c.id === cityId);
    if (cityIndex !== -1) {
      cities[cityIndex] = { ...cities[cityIndex], ...updates };
      localStorage.setItem('cities', JSON.stringify(cities));
    }
  }

  async deleteCity(cityId: string): Promise<void> {
    const cities = this.getFromStorage<City[]>('cities') || [];
    const filteredCities = cities.filter(c => c.id !== cityId);
    localStorage.setItem('cities', JSON.stringify(filteredCities));
  }

  async createDistrict(districtData: Omit<District, 'id'>): Promise<District> {
    const district: District = {
      ...districtData,
      id: Math.random().toString(36).substr(2, 9)
    };
    
    const cities = this.getFromStorage<City[]>('cities') || [];
    const cityIndex = cities.findIndex(c => c.id === districtData.cityId);
    if (cityIndex !== -1) {
      cities[cityIndex].districts.push(district);
      localStorage.setItem('cities', JSON.stringify(cities));
    }
    
    return district;
  }

  // Quest participation
  async registerForQuest(userId: string, questId: string, paymentId: string): Promise<QuestParticipation> {
    const participation: QuestParticipation = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      questId,
      status: 'registered',
      currentLocationIndex: 0,
      registrationTime: new Date(),
      paymentId,
      answers: [],
      speedViolations: []
    };

    this.saveToStorage('participations', participation);
    return participation;
  }

  async getQuestParticipation(userId: string, questId: string): Promise<QuestParticipation | null> {
    const participations = this.getFromStorage<QuestParticipation[]>('participations') || [];
    return participations.find(p => p.userId === userId && p.questId === questId) || null;
  }

  async getAllParticipations(): Promise<QuestParticipation[]> {
    return this.getFromStorage<QuestParticipation[]>('participations') || [];
  }

  async updateQuestProgress(participationId: string, updates: Partial<QuestParticipation>): Promise<void> {
    const participations = this.getFromStorage<QuestParticipation[]>('participations') || [];
    const participationIndex = participations.findIndex(p => p.id === participationId);
    if (participationIndex !== -1) {
      participations[participationIndex] = { ...participations[participationIndex], ...updates };
      localStorage.setItem('participations', JSON.stringify(participations));
    }
  }

  // Agreements
  async getAgreements(): Promise<Agreement[]> {
    return this.getFromStorage<Agreement[]>('agreements') || this.getDefaultAgreements();
  }

  async createAgreement(agreementData: Omit<Agreement, 'id' | 'updatedAt'>): Promise<Agreement> {
    const agreement: Agreement = {
      ...agreementData,
      id: Math.random().toString(36).substr(2, 9),
      updatedAt: new Date()
    };
    
    this.saveToStorage('agreements', agreement);
    return agreement;
  }

  async updateAgreement(agreementId: string, updates: Partial<Agreement>): Promise<void> {
    const agreements = this.getFromStorage<Agreement[]>('agreements') || [];
    const agreementIndex = agreements.findIndex(a => a.id === agreementId);
    if (agreementIndex !== -1) {
      agreements[agreementIndex] = { 
        ...agreements[agreementIndex], 
        ...updates, 
        updatedAt: new Date() 
      };
      localStorage.setItem('agreements', JSON.stringify(agreements));
    }
  }

  async deleteAgreement(agreementId: string): Promise<void> {
    const agreements = this.getFromStorage<Agreement[]>('agreements') || [];
    const filteredAgreements = agreements.filter(a => a.id !== agreementId);
    localStorage.setItem('agreements', JSON.stringify(filteredAgreements));
  }

  // Notifications
  async scheduleNotifications(userId: string, questId: string, questStartTime: Date): Promise<void> {
    const quest = await this.getQuestById(questId);
    const user = await this.getUserByTelegramId(userId);
    
    if (!quest || !user) return;

    const notifications: Notification[] = [
      {
        id: Math.random().toString(36).substr(2, 9),
        userId,
        questId,
        type: 'quest_reminder_24h',
        channels: ['telegram', 'sms', 'email'],
        scheduledFor: new Date(questStartTime.getTime() - 24 * 60 * 60 * 1000),
        sent: false,
        content: {
          title: 'Напоминание о квесте',
          message: `До начала квеста "${quest.title}" осталось 24 часа`,
          questConditions: quest.conditions
        }
      },
      {
        id: Math.random().toString(36).substr(2, 9),
        userId,
        questId,
        type: 'quest_reminder_3h',
        channels: ['telegram', 'sms'],
        scheduledFor: new Date(questStartTime.getTime() - 3 * 60 * 60 * 1000),
        sent: false,
        content: {
          title: 'Напоминание о квесте',
          message: `До начала квеста "${quest.title}" осталось 3 часа`,
          startLocation: quest.startLocation.name
        }
      },
      {
        id: Math.random().toString(36).substr(2, 9),
        userId,
        questId,
        type: 'quest_reminder_1h',
        channels: ['telegram'],
        scheduledFor: new Date(questStartTime.getTime() - 60 * 60 * 1000),
        sent: false,
        content: {
          title: 'Напоминание о квесте',
          message: `До начала квеста "${quest.title}" остался 1 час`,
          startLocation: `${quest.startLocation.name} (${quest.startLocation.coordinates.lat}, ${quest.startLocation.coordinates.lng})`
        }
      }
    ];

    notifications.forEach(notification => {
      this.saveToStorage('notifications', notification);
    });
  }

  async getAllNotifications(): Promise<Notification[]> {
    return this.getFromStorage<Notification[]>('notifications') || [];
  }

  async markNotificationSent(notificationId: string): Promise<void> {
    const notifications = this.getFromStorage<Notification[]>('notifications') || [];
    const notificationIndex = notifications.findIndex(n => n.id === notificationId);
    if (notificationIndex !== -1) {
      notifications[notificationIndex].sent = true;
      notifications[notificationIndex].sentAt = new Date();
      localStorage.setItem('notifications', JSON.stringify(notifications));
    }
  }

  // Payment processing
  async processPayment(userId: string, questId: string, amount: number): Promise<{ success: boolean; paymentId?: string }> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const payment: Payment = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      questId,
      amount,
      currency: 'RUB',
      status: 'completed',
      paymentMethod: 'telegram_payments',
      transactionId: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      completedAt: new Date()
    };

    this.saveToStorage('payments', payment);
    
    return {
      success: true,
      paymentId: payment.id
    };
  }

  async getAllPayments(): Promise<Payment[]> {
    return this.getFromStorage<Payment[]>('payments') || [];
  }

  // Statistics
  async getQuestStatistics(questId: string): Promise<QuestStatistics> {
    const participations = await this.getAllParticipations();
    const questParticipations = participations.filter(p => p.questId === questId);
    
    const completed = questParticipations.filter(p => p.status === 'completed');
    const avgTime = completed.length > 0 
      ? completed.reduce((sum, p) => sum + (p.completionTime || 0), 0) / completed.length 
      : 0;
    const avgScore = completed.length > 0 
      ? completed.reduce((sum, p) => sum + (p.totalScore || 0), 0) / completed.length 
      : 0;

    return {
      questId,
      totalParticipants: questParticipations.length,
      completedParticipants: completed.length,
      averageCompletionTime: avgTime,
      averageScore: avgScore,
      popularLocations: [],
      commonMistakes: []
    };
  }

  async getUserProgress(userId: string, questId: string): Promise<UserProgress | null> {
    const participation = await this.getQuestParticipation(userId, questId);
    if (!participation) return null;

    return {
      userId,
      questId,
      currentLocation: participation.currentLocationIndex,
      visitedLocations: participation.answers.map(a => a.locationId),
      answeredQuestions: participation.answers.map(a => a.questionId),
      score: participation.totalScore || 0,
      timeSpent: participation.completionTime || 0,
      lastActivity: new Date()
    };
  }

  // AI Question Generation
  async generateAIQuestion(locationId: string, difficulty: 'easy' | 'medium' | 'hard' = 'medium'): Promise<Question> {
    // Mock AI question generation - в реальном приложении здесь будет вызов Grok API
    const location = (await this.getAllLocations()).find(l => l.id === locationId);
    const locationName = location?.name || 'локация';
    
    const templates = {
      easy: [
        `Как называется это место: ${locationName}?`,
        `В каком городе находится ${locationName}?`,
        `Что вы видите рядом с ${locationName}?`
      ],
      medium: [
        `В каком году был построен/основан ${locationName}?`,
        `Какой архитектурный стиль характерен для ${locationName}?`,
        `Кто был архитектором ${locationName}?`
      ],
      hard: [
        `Какие исторические события связаны с ${locationName}?`,
        `Какие легенды или мифы связаны с ${locationName}?`,
        `Какое культурное значение имеет ${locationName}?`
      ]
    };

    const questionText = templates[difficulty][Math.floor(Math.random() * templates[difficulty].length)];
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      text: questionText,
      type: 'ai_generated',
      correctAnswer: 'AI generated answer',
      isAI: true,
      locationId,
      difficulty
    };
  }

  // Helper methods
  private saveToStorage<T>(key: string, item: T): void {
    const items = this.getFromStorage<T[]>(key) || [];
    items.push(item);
    localStorage.setItem(key, JSON.stringify(items));
  }

  private getFromStorage<T>(key: string): T | null {
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        return this.convertDates(parsed);
      } catch (error) {
        console.error(`Error parsing ${key} from storage:`, error);
        return null;
      }
    }
    return null;
  }

  private convertDates(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(item => this.convertDates(item));
    } else if (obj && typeof obj === 'object') {
      const converted = { ...obj };
      for (const key in converted) {
        if (key.includes('At') || key.includes('Time') || key === 'updatedAt' || key === 'createdAt' || key === 'registeredAt') {
          if (typeof converted[key] === 'string') {
            converted[key] = new Date(converted[key]);
          }
        } else if (typeof converted[key] === 'object') {
          converted[key] = this.convertDates(converted[key]);
        }
      }
      return converted;
    }
    return obj;
  }

  // Default data
  private getDefaultQuests(): Quest[] {
    return [
      {
        id: '1',
        title: 'Тайны Старого Города',
        description: 'Исследуйте исторический центр и раскройте древние секреты',
        city: 'Москва',
        district: 'Центральный',
        locationCount: 8,
        price: 500,
        startLocation: {
          id: 'start1',
          name: 'Красная площадь',
          city: 'Москва',
          coordinates: { lat: 55.7539, lng: 37.6208 },
          questions: [],
          yandexMapsLink: 'https://yandex.ru/maps/?pt=37.6208,55.7539&z=18'
        },
        finalLocation: {
          id: 'final1',
          name: 'Парк Зарядье',
          city: 'Москва',
          coordinates: { lat: 55.7508, lng: 37.6281 },
          questions: [],
          yandexMapsLink: 'https://yandex.ru/maps/?pt=37.6281,55.7508&z=18'
        },
        locations: [],
        conditions: 'Квест проходит пешком. Запрещено использование транспорта. Соблюдайте лимит скорости 27 км/ч.',
        isActive: true,
        createdAt: new Date()
      }
    ];
  }

  private getDefaultLocations(): Location[] {
    return [
      {
        id: 'loc1',
        name: 'Красная площадь',
        city: 'Москва',
        district: 'Центральный',
        coordinates: { lat: 55.7539, lng: 37.6208 },
        questions: [],
        yandexMapsLink: 'https://yandex.ru/maps/?pt=37.6208,55.7539&z=18',
        description: 'Главная площадь Москвы'
      }
    ];
  }

  private getDefaultQuestions(): Question[] {
    return [
      {
        id: 'q1',
        text: 'В каком году была построена Спасская башня?',
        type: 'multiple_choice',
        options: ['1491', '1495', '1508', '1515'],
        correctAnswer: 0,
        locationId: 'loc1',
        difficulty: 'medium'
      }
    ];
  }

  private getDefaultCities(): City[] {
    return [
      {
        id: 'city1',
        name: 'Москва',
        coordinates: { lat: 55.7558, lng: 37.6176 },
        isActive: true,
        districts: [
          {
            id: 'dist1',
            name: 'Центральный',
            cityId: 'city1',
            coordinates: { lat: 55.7558, lng: 37.6176 },
            isActive: true
          }
        ]
      }
    ];
  }

  private getDefaultAgreements(): Agreement[] {
    return [
      {
        id: '1',
        type: 'personal_data',
        title: 'Согласие на обработку персональных данных',
        content: 'Я даю согласие на обработку моих персональных данных в соответствии с Федеральным законом от 27.07.2006 № 152-ФЗ "О персональных данных". Обработка персональных данных осуществляется в целях организации и проведения квестов, уведомления о мероприятиях, обеспечения безопасности участников.',
        isRequired: true,
        updatedAt: new Date(),
        version: '1.0'
      },
      {
        id: '2',
        type: 'liability',
        title: 'Освобождение от ответственности за здоровье',
        content: 'Я освобождаю организатора квеста от ответственности за возможный вред здоровью как участника, так и третьих лиц, который может быть причинен во время участия в квесте. Я понимаю риски, связанные с участием в квесте, и принимаю их на себя.',
        isRequired: true,
        updatedAt: new Date(),
        version: '1.0'
      },
      {
        id: '3',
        type: 'contract',
        title: 'Договор оферты',
        content: 'Настоящий договор является публичной офертой. Акцептом оферты является оплата участия в квесте. Участник обязуется соблюдать правила квеста, не нарушать общественный порядок, бережно относиться к имуществу.',
        isRequired: true,
        updatedAt: new Date(),
        version: '1.0'
      },
      {
        id: '4',
        type: 'media',
        title: 'Согласие на фото- и видеосъемку',
        content: 'Я даю согласие на фото- и видеосъемку во время участия в квесте и публикацию полученных материалов в рекламных целях организатора без дополнительного вознаграждения.',
        isRequired: true,
        updatedAt: new Date(),
        version: '1.0'
      },
      {
        id: '5',
        type: 'safety',
        title: 'Правила безопасности',
        content: 'Я ознакомлен с правилами безопасности при участии в квесте: соблюдение ПДД, осторожность при перемещении, запрет на опасные действия, соблюдение лимита скорости 27 км/ч, обязательное нахождение в радиусе 10 метров от локации.',
        isRequired: true,
        updatedAt: new Date(),
        version: '1.0'
      },
      {
        id: '6',
        type: 'minor',
        title: 'Согласие на участие несовершеннолетнего',
        content: 'Я даю согласие на участие несовершеннолетнего в квесте без сопровождения законного представителя. Несовершеннолетний участник обязуется соблюдать все правила и требования квеста.',
        isRequired: false,
        updatedAt: new Date(),
        version: '1.0'
      },
      {
        id: '7',
        type: 'refusal',
        title: 'Право на отказ в предоставлении услуг',
        content: 'Организатор оставляет за собой право отказать в предоставлении услуг и удержать средства в случае несоблюдения условий, недопустимого состояния участника, нарушения правил безопасности или общественного порядка.',
        isRequired: true,
        updatedAt: new Date(),
        version: '1.0'
      }
    ];
  }
}

export const apiService = new ApiService();