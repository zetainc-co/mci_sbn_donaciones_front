import { createBrowserRouter } from 'react-router-dom';
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { PSEReturnPage } from '@/pages/PSEReturnPage';
import { PaymentCallbackPage } from '@/pages/PaymentCallbackPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/pse-return',
    element: <PSEReturnPage />,
  },
  {
    path: '/payment/callback',
    element: <PaymentCallbackPage />,
  },
]);
