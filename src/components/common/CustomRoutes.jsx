import React, { useContext } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';


// Import all your layouts and page components
import AuthLayout from '../auth/Layout';
import AuthLogin from '@/pages/auth/login';
import AuthRegister from '@/pages/auth/register';

import AdminLayout from '../admin-view/layout';
import AdminDashboard from '@/pages/admin-view/dashboard';
import AdminFeature from '@/pages/admin-view/feature';
import AdminOrders from '@/pages/admin-view/orders';
import AdminProducts from '@/pages/admin-view/products';

import ShoppingLayout from '../shopping-view/layout';
import ShoppingHome from '@/pages/shopping-view/home';
import ShoppingAccount from '@/pages/shopping-view/account';
import ShoppingCheckout from '@/pages/shopping-view/checkout';
import ShoppingListing from '@/pages/shopping-view/listing';

import UnAthpage from '@/pages/unauth-page/unathpage';
import NotFound from '@/pages/not-found/index';
import { GlobalContext } from '@/Context/context';
import { Skeleton } from '../ui/skeleton';
import AuthForgetPass from '@/pages/auth/forgetPass';

const CustomRoutes = () => {
  const { state } = useContext(GlobalContext);
  const location = useLocation();

  // 1. Show a loading screen while the initial authentication check is running
  if (state.isLogin === null) {
    // You can replace this with a proper spinner component
    return <Skeleton className="h-[600px] w-[600px]   " />;
  }

  // 2. Routes for AUTHENTICATED users
  if (state.isLogin === true) {
    // Assuming the user object has a 'role' property, e.g., { email: '...', role: 'admin' }
    const userRole = state.user?.role;

    // A. For ADMIN users
    if (userRole === 'admin') {
      // If an admin is somehow on a shopping route, redirect them to their dashboard
      if (location.pathname.startsWith('/shop')) {
        return <Navigate to="/admin/dashboard" replace />;
      }

      return (
        <Routes>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="feature" element={<AdminFeature />} />
            <Route path="order" element={<AdminOrders />} />
            <Route path="products" element={<AdminProducts />} />
          </Route>
          {/* Catch-all for logged-in admins: redirect any other path to their dashboard */}
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      );
    }

    // B. For REGULAR (non-admin) users
    else {
       // If a regular user tries to access an admin route, send them to an unauthorized page
      if (location.pathname.startsWith('/admin')) {
        return <Navigate to="/unauth-page" replace />;
      }

      return (
        <Routes>
          <Route path="/shop" element={<ShoppingLayout />}>
            <Route index element={<Navigate to="home" replace />} />
            <Route path="home" element={<ShoppingHome />} />
            <Route path="account" element={<ShoppingAccount />} />
            <Route path="checkout" element={<ShoppingCheckout />} />
            <Route path="listing" element={<ShoppingListing />} />
          </Route>
          <Route path="/unauth-page" element={<UnAthpage />} />
          {/* Catch-all for logged-in users: redirect any other path to their home page */}
          <Route path="*" element={<Navigate to="/shop/home" replace />} />
        </Routes>
      );
    }
  }

  // 3. Routes for UNAUTHENTICATED users
  else {
    return (
      <Routes>
        <Route path="/auth" element={<AuthLayout />}>
          <Route index element={<Navigate to="login" replace />} />
          <Route path="login" element={<AuthLogin />} />
          <Route path="register" element={<AuthRegister />} />
          <Route path='forget-password' element={<AuthForgetPass />} />
        </Route>
        <Route path="/not-found" element={<NotFound />} />
        {/* Catch-all for logged-out users: redirect any other path to the login page */}
        <Route path="*" element={<Navigate to="/auth/login" replace />} />
      </Routes>
    );
  }
};

export default CustomRoutes;