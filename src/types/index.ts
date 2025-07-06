export interface User {
  id: string;
  telegramId: string;
  firstName: string;
  lastName?: string;
  age: number;
  phone: string;
  email?: string;
  location?: {
    lat: number;
    lng: number;
    city?: string;
    district?: string;
  };
  agreementsSigned: {
    personalData: boolean;
    liability: boolean;
    contract: boolean;
    media: boolean;
    safety: boolean;
    minor: boolean;
    refusal: boolean;
  };
  registeredAt: Date;
  questsCompleted: string[];
  currentQuest?: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  city: string;
  district?: string;
  locationCount: number; // 4-10
  price: number;
  startLocation: Location;
  finalLocation: Location;
  locations: Location[];
  conditions: string;
  isActive: boolean;
  createdAt: Date;
  media?: {
    photos: string[];
    videos: string[];
  };
}

export interface Location {
  id: string;
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  city: string;
  district?: string;
  yandexMapsLink?: string;
  questions: Question[];
  media?: {
    photos: string[];
    videos: string[];
  };
  description?: string;
}

export interface Question {
  id: string;
  text: string;
  type: 'multiple_choice' | 'open_text' | 'ai_generated';
  options?: string[];
  correctAnswer: string | number;
  isAI?: boolean;
  locationId?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface QuestParticipation {
  id: string;
  userId: string;
  questId: string;
  status: 'registered' | 'in_progress' | 'completed' | 'disqualified' | 'cancelled';
  currentLocationIndex: number;
  startTime?: Date;
  endTime?: Date;
  registrationTime: Date;
  paymentId?: string;
  answers: {
    locationId: string;
    questionId: string;
    answer: string;
    isCorrect: boolean;
    timestamp: Date;
    timeSpent: number;
  }[];
  speedViolations: {
    timestamp: Date;
    speed: number;
    location: { lat: number; lng: number };
    violationCount: number;
  }[];
  totalScore?: number;
  completionTime?: number;
}

export interface Agreement {
  id: string;
  type: 'personal_data' | 'liability' | 'contract' | 'media' | 'safety' | 'minor' | 'refusal';
  title: string;
  content: string;
  isRequired: boolean;
  updatedAt: Date;
  version: string;
}

export interface Notification {
  id: string;
  userId: string;
  questId: string;
  type: 'quest_reminder_24h' | 'quest_reminder_3h' | 'quest_reminder_1h' | 'quest_start' | 'quest_complete' | 'payment_success';
  channels: ('telegram' | 'sms' | 'email')[];
  scheduledFor: Date;
  sent: boolean;
  sentAt?: Date;
  content: {
    title: string;
    message: string;
    startLocation?: string;
    questConditions?: string;
  };
}

export interface City {
  id: string;
  name: string;
  districts: District[];
  coordinates: {
    lat: number;
    lng: number;
  };
  isActive: boolean;
}

export interface District {
  id: string;
  name: string;
  cityId: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  isActive: boolean;
}

export interface Payment {
  id: string;
  userId: string;
  questId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: 'telegram_payments' | 'yookassa' | 'stripe';
  transactionId?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface QuestStatistics {
  questId: string;
  totalParticipants: number;
  completedParticipants: number;
  averageCompletionTime: number;
  averageScore: number;
  popularLocations: string[];
  commonMistakes: string[];
}

export interface UserProgress {
  userId: string;
  questId: string;
  currentLocation: number;
  visitedLocations: string[];
  answeredQuestions: string[];
  score: number;
  timeSpent: number;
  lastActivity: Date;
}