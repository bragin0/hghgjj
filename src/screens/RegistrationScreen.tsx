import React, { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Layout } from '../components/Layout';
import { ProgressBar } from '../components/ProgressBar';
import { getTelegramUser } from '../utils/telegram';
import { apiService } from '../services/api';

interface RegistrationScreenProps {
  onComplete: (userData: any) => void;
  onBack: () => void;
}

export const RegistrationScreen: React.FC<RegistrationScreenProps> = ({ onComplete, onBack }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    phone: '',
    email: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Pre-fill with Telegram user data if available
    const telegramUser = getTelegramUser();
    if (telegramUser) {
      setFormData(prev => ({
        ...prev,
        firstName: telegramUser.first_name || '',
        lastName: telegramUser.last_name || ''
      }));
    }
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Имя обязательно для заполнения';
    }

    if (!formData.age || parseInt(formData.age) < 12 || parseInt(formData.age) > 99) {
      newErrors.age = 'Возраст должен быть от 12 до 99 лет';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Номер телефона обязателен для уведомлений';
    } else if (!/^\+?[1-9]\d{10,14}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phone = 'Некорректный номер телефона';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Некорректный email адрес';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const telegramUser = getTelegramUser();
      const userData = {
        telegramId: telegramUser?.id.toString() || 'demo_user',
        firstName: formData.firstName,
        lastName: formData.lastName || undefined,
        age: parseInt(formData.age),
        phone: formData.phone,
        email: formData.email || undefined,
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

      const user = await apiService.registerUser(userData);
      onComplete(user);
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ general: 'Ошибка регистрации. Попробуйте еще раз.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Layout title="Регистрация" onBack={onBack} showBack>
      <div className="p-6">
        <div className="mb-6">
          <ProgressBar current={1} total={4} />
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Регистрация участника
          </h2>
          <p className="text-gray-600">
            Заполните данные для участия в квестах. Все поля обязательны, кроме email.
          </p>
        </div>

        {errors.general && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{errors.general}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Имя *"
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              error={errors.firstName}
              placeholder="Иван"
              required
            />
            <Input
              label="Фамилия"
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              error={errors.lastName}
              placeholder="Петров"
            />
          </div>

          <Input
            label="Возраст *"
            type="number"
            value={formData.age}
            onChange={(e) => handleChange('age', e.target.value)}
            error={errors.age}
            placeholder="25"
            min="12"
            max="99"
            required
            helperText="Минимальный возраст для участия - 12 лет"
          />

          <Input
            label="Номер телефона *"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            error={errors.phone}
            placeholder="+7 (999) 123-45-67"
            required
            helperText="Для отправки SMS-уведомлений о квестах"
          />

          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            error={errors.email}
            placeholder="ivan@example.com"
            helperText="Для дополнительных уведомлений (необязательно)"
          />

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Что дальше?</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Предоставление доступа к геолокации</li>
              <li>• Подписание обязательных соглашений</li>
              <li>• Выбор и оплата квеста</li>
              <li>• Получение уведомлений о начале</li>
            </ul>
          </div>

          <div className="pt-4">
            <Button 
              type="submit" 
              size="lg" 
              fullWidth 
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Регистрация...' : 'Продолжить'}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};