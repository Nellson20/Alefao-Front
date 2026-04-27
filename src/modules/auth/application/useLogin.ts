import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { authRepository } from '../infrastructure/auth.repository';
import { useAuth } from '../../../contexts/AuthContext';
import Cookies from 'js-cookie';

export const useLogin = () => {
  const { t } = useTranslation();
  const { login: contextLogin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const login = async (credentials: any, requestedRole: string) => {
    setIsLoading(true);
    setError(null);
    setFieldErrors({});

    try {
      const response = await authRepository.login(credentials);
      const { accessToken, refreshToken } = response;

      contextLogin(accessToken, refreshToken);
      const actualRole = Cookies.get('role') || requestedRole;
      
      return { success: true, role: actualRole };
    } catch (err: any) {
      console.error('Login error:', err);
      const errorData = err.response?.data?.message;
      
      if (Array.isArray(errorData)) {
        const newErrors: Record<string, string> = {};
        errorData.forEach((msg: string) => {
          const lowerMsg = msg.toLowerCase();
          if (lowerMsg.includes('email')) newErrors.email = msg;
          else if (lowerMsg.includes('password') || lowerMsg.includes('mot de passe')) newErrors.password = msg;
        });
        setFieldErrors(newErrors);
        setError(t('auth.fix_errors'));
      } else {
        setError(errorData || t('auth.invalid_credentials'));
      }
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  return { login, isLoading, error, fieldErrors };
};
