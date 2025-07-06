import React, { useState, useEffect } from 'react';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { RegistrationScreen } from './screens/RegistrationScreen';
import { LocationScreen } from './screens/LocationScreen';
import { AgreementsScreen } from './screens/AgreementsScreen';
import { QuestListScreen } from './screens/QuestListScreen';
import { QuestDetailScreen } from './screens/QuestDetailScreen';
import { QuestGameScreen } from './screens/QuestGameScreen';
import { AdminScreen } from './screens/AdminScreen';
import { Quest, User } from './types';
import { getTelegramUser } from './utils/telegram';
import { apiService } from './services/api';

type AppScreen = 
  | 'welcome'
  | 'registration'
  | 'location'
  | 'agreements'
  | 'quest-list'
  | 'quest-detail'
  | 'quest-game'
  | 'admin';

function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('welcome');
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [adminAccess, setAdminAccess] = useState(false);

  useEffect(() => {
    // Check if user is already registered
    checkExistingUser();
    
    // Admin access via long press on title (demo)
    let pressTimer: NodeJS.Timeout;
    const handleTitlePress = () => {
      pressTimer = setTimeout(() => {
        setAdminAccess(true);
        setCurrentScreen('admin');
      }, 3000);
    };
    
    const handleTitleRelease = () => {
      clearTimeout(pressTimer);
    };

    // Add event listeners for admin access
    const titleElement = document.querySelector('h1');
    if (titleElement) {
      titleElement.addEventListener('mousedown', handleTitlePress);
      titleElement.addEventListener('mouseup', handleTitleRelease);
      titleElement.addEventListener('touchstart', handleTitlePress);
      titleElement.addEventListener('touchend', handleTitleRelease);
    }

    return () => {
      clearTimeout(pressTimer);
      if (titleElement) {
        titleElement.removeEventListener('mousedown', handleTitlePress);
        titleElement.removeEventListener('mouseup', handleTitleRelease);
        titleElement.removeEventListener('touchstart', handleTitlePress);
        titleElement.removeEventListener('touchend', handleTitleRelease);
      }
    };
  }, []);

  const checkExistingUser = async () => {
    const telegramUser = getTelegramUser();
    if (telegramUser) {
      try {
        const existingUser = await apiService.getUserByTelegramId(telegramUser.id.toString());
        if (existingUser) {
          setCurrentUser(existingUser);
          // Navigate to appropriate screen based on user progress
          if (!existingUser.location) {
            setCurrentScreen('location');
          } else if (!Object.values(existingUser.agreementsSigned).every(Boolean)) {
            setCurrentScreen('agreements');
          } else {
            setCurrentScreen('quest-list');
          }
        }
      } catch (error) {
        console.error('Error checking existing user:', error);
      }
    }
  };

  const handleScreenNavigation = (screen: AppScreen, data?: any) => {
    switch (screen) {
      case 'registration':
        setCurrentScreen('registration');
        break;
      case 'location':
        if (data) setCurrentUser(data);
        setCurrentScreen('location');
        break;
      case 'agreements':
        setCurrentScreen('agreements');
        break;
      case 'quest-list':
        setCurrentScreen('quest-list');
        break;
      case 'quest-detail':
        setSelectedQuest(data);
        setCurrentScreen('quest-detail');
        break;
      case 'quest-game':
        setCurrentScreen('quest-game');
        break;
      case 'welcome':
        setCurrentScreen('welcome');
        setCurrentUser(null);
        setSelectedQuest(null);
        break;
      case 'admin':
        setCurrentScreen('admin');
        break;
    }
  };

  const handleBack = () => {
    switch (currentScreen) {
      case 'registration':
        setCurrentScreen('welcome');
        break;
      case 'location':
        setCurrentScreen('registration');
        break;
      case 'agreements':
        setCurrentScreen('location');
        break;
      case 'quest-list':
        setCurrentScreen('agreements');
        break;
      case 'quest-detail':
        setCurrentScreen('quest-list');
        break;
      case 'quest-game':
        setCurrentScreen('quest-detail');
        break;
      case 'admin':
        setCurrentScreen('welcome');
        break;
      default:
        setCurrentScreen('welcome');
    }
  };

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'welcome':
        return (
          <WelcomeScreen
            onStart={() => handleScreenNavigation('registration')}
          />
        );
      case 'registration':
        return (
          <RegistrationScreen
            onComplete={(userData) => handleScreenNavigation('location', userData)}
            onBack={handleBack}
          />
        );
      case 'location':
        return currentUser ? (
          <LocationScreen
            onComplete={() => handleScreenNavigation('agreements')}
            onBack={handleBack}
            currentUser={currentUser}
          />
        ) : null;
      case 'agreements':
        return currentUser ? (
          <AgreementsScreen
            onComplete={() => handleScreenNavigation('quest-list')}
            onBack={handleBack}
            currentUser={currentUser}
          />
        ) : null;
      case 'quest-list':
        return currentUser ? (
          <QuestListScreen
            onSelectQuest={(quest) => handleScreenNavigation('quest-detail', quest)}
            onBack={handleBack}
            currentUser={currentUser}
          />
        ) : null;
      case 'quest-detail':
        return selectedQuest && currentUser ? (
          <QuestDetailScreen
            quest={selectedQuest}
            onPay={() => handleScreenNavigation('quest-game')}
            onBack={handleBack}
            currentUser={currentUser}
          />
        ) : null;
      case 'quest-game':
        return currentUser ? (
          <QuestGameScreen
            onComplete={() => handleScreenNavigation('welcome')}
            onBack={handleBack}
            currentUser={currentUser}
          />
        ) : null;
      case 'admin':
        return (
          <AdminScreen
            onBack={handleBack}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderCurrentScreen()}
    </div>
  );
}

export default App;