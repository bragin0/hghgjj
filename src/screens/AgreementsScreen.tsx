import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, Circle, AlertTriangle } from 'lucide-react';
import { Button } from '../components/Button';
import { Layout } from '../components/Layout';
import { ProgressBar } from '../components/ProgressBar';
import { apiService } from '../services/api';
import { Agreement, User } from '../types';

interface AgreementsScreenProps {
  onComplete: () => void;
  onBack: () => void;
  currentUser: User;
}

export const AgreementsScreen: React.FC<AgreementsScreenProps> = ({ onComplete, onBack, currentUser }) => {
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [acceptedAgreements, setAcceptedAgreements] = useState<Set<string>>(new Set());
  const [showAgreement, setShowAgreement] = useState<Agreement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadAgreements();
    // Pre-populate accepted agreements based on user's current state
    const currentlyAccepted = new Set<string>();
    if (currentUser.agreementsSigned.personalData) currentlyAccepted.add('personal_data');
    if (currentUser.agreementsSigned.liability) currentlyAccepted.add('liability');
    if (currentUser.agreementsSigned.contract) currentlyAccepted.add('contract');
    if (currentUser.agreementsSigned.media) currentlyAccepted.add('media');
    if (currentUser.agreementsSigned.safety) currentlyAccepted.add('safety');
    if (currentUser.agreementsSigned.minor) currentlyAccepted.add('minor');
    if (currentUser.agreementsSigned.refusal) currentlyAccepted.add('refusal');
    setAcceptedAgreements(currentlyAccepted);
  }, [currentUser]);

  const loadAgreements = async () => {
    try {
      const agreementsList = await apiService.getAgreements();
      setAgreements(agreementsList);
    } catch (error) {
      console.error('Error loading agreements:', error);
    }
  };

  const toggleAgreement = (agreementType: string) => {
    const newAccepted = new Set(acceptedAgreements);
    if (newAccepted.has(agreementType)) {
      newAccepted.delete(agreementType);
    } else {
      newAccepted.add(agreementType);
    }
    setAcceptedAgreements(newAccepted);
  };

  const canContinue = () => {
    const requiredAgreements = agreements.filter(a => a.isRequired);
    return requiredAgreements.every(a => acceptedAgreements.has(a.type));
  };

  const handleContinue = async () => {
    if (!canContinue()) return;

    setIsSubmitting(true);

    try {
      // Map accepted agreements to user agreement structure
      const agreementsSigned = {
        personalData: acceptedAgreements.has('personal_data'),
        liability: acceptedAgreements.has('liability'),
        contract: acceptedAgreements.has('contract'),
        media: acceptedAgreements.has('media'),
        safety: acceptedAgreements.has('safety'),
        minor: acceptedAgreements.has('minor'),
        refusal: acceptedAgreements.has('refusal')
      };

      await apiService.updateUserAgreements(currentUser.id, agreementsSigned);
      onComplete();
    } catch (error) {
      console.error('Error saving agreements:', error);
      alert('Ошибка при сохранении соглашений');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showAgreement) {
    return (
      <Layout 
        title={showAgreement.title} 
        onBack={() => setShowAgreement(null)} 
        showBack
      >
        <div className="p-6">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Версия: {showAgreement.version}</span>
              <span className={`text-xs px-2 py-1 rounded ${
                showAgreement.isRequired ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {showAgreement.isRequired ? 'Обязательное' : 'Опциональное'}
              </span>
            </div>
          </div>

          <div className="prose prose-sm max-w-none">
            <div className="bg-gray-50 p-4 rounded-lg text-sm leading-relaxed mb-6">
              <div className="whitespace-pre-wrap">{showAgreement.content}</div>
            </div>
          </div>
          
          <div className="space-y-4">
            <Button
              onClick={() => {
                toggleAgreement(showAgreement.type);
                setShowAgreement(null);
              }}
              size="lg"
              fullWidth
              variant={acceptedAgreements.has(showAgreement.type) ? 'danger' : 'success'}
            >
              {acceptedAgreements.has(showAgreement.type) ? 'Отозвать согласие' : 'Принять соглашение'}
            </Button>
            
            <Button
              onClick={() => setShowAgreement(null)}
              size="lg"
              fullWidth
              variant="secondary"
            >
              Назад к списку
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Соглашения" onBack={onBack} showBack>
      <div className="p-6">
        <div className="mb-6">
          <ProgressBar current={3} total={4} />
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Соглашения и условия
          </h2>
          <p className="text-gray-600">
            Для участия в квестах необходимо принять все обязательные соглашения согласно ТЗ
          </p>
        </div>

        <div className="bg-amber-50 p-4 rounded-lg mb-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-800 font-medium">Обязательные соглашения</p>
              <p className="text-sm text-amber-700 mt-1">
                Все соглашения, отмеченные как обязательные, должны быть приняты для продолжения
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          {agreements.map((agreement) => (
            <div key={agreement.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <button
                  onClick={() => toggleAgreement(agreement.type)}
                  className="mt-1 flex-shrink-0"
                >
                  {acceptedAgreements.has(agreement.type) ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-medium text-gray-900">{agreement.title}</h3>
                    {agreement.isRequired && (
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                        Обязательно
                      </span>
                    )}
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      v{agreement.version}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {agreement.type === 'personal_data' && 'Согласие на сбор, хранение и обработку персональных данных в соответствии с ФЗ-152'}
                    {agreement.type === 'liability' && 'Согласие об освобождении организатора от ответственности за здоровье участника и третьих лиц'}
                    {agreement.type === 'contract' && 'Согласие с условиями предоставления услуг и правилами участия в квестах (договор оферты)'}
                    {agreement.type === 'media' && 'Разрешение на использование изображений участника в рекламных целях (фото- и видеосъемка)'}
                    {agreement.type === 'safety' && 'Ознакомление и согласие с правилами безопасности при участии в квестах'}
                    {agreement.type === 'minor' && 'Согласие на участие несовершеннолетнего без сопровождения законного представителя'}
                    {agreement.type === 'refusal' && 'Согласие на право отказа в предоставлении услуг и удержание средств'}
                  </p>
                  <button
                    onClick={() => setShowAgreement(agreement)}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    Читать полный текст
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          {!canContinue() && (
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-red-800 text-sm">
                Для продолжения необходимо принять все обязательные соглашения согласно ТЗ
              </p>
            </div>
          )}
          
          <Button
            onClick={handleContinue}
            size="lg"
            fullWidth
            disabled={!canContinue()}
            loading={isSubmitting}
          >
            {isSubmitting ? 'Сохранение...' : 'Продолжить к выбору квеста'}
          </Button>
        </div>
      </div>
    </Layout>
  );
};