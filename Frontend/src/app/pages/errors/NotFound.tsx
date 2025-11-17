/**
 * NotFound (404) Page
 *
 * Displayed when a user navigates to a non-existent route.
 */

import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '../../../components/ui';

const NotFound: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center">
        {/* 404 Graphic */}
        <div className="mb-8">
          <h1 className="text-9xl font-extrabold text-primary-600">404</h1>
          <div className="mt-2 h-1 w-full bg-gradient-to-r from-transparent via-primary-600 to-transparent"></div>
        </div>

        {/* Message */}
        <h2 className="mb-4 text-3xl font-bold text-foreground">
          {t('errors.404')}
        </h2>
        <p className="mb-8 text-lg text-muted-foreground">
          {t('errors.somethingWrong')}
        </p>

        {/* Actions */}
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            variant="primary"
            size="lg"
            icon={<Home className="h-5 w-5" />}
            onClick={() => navigate('/')}
          >
            {t('errors.goHome')}
          </Button>
          <Button
            variant="outline"
            size="lg"
            icon={<ArrowLeft className="h-5 w-5" />}
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
