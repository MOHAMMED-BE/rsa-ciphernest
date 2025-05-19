import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ThemeProvider } from "@/components/theme-provider"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster"
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PasswordList from './pages/PasswordList';
import AddPassword from './pages/AddPassword';
import EditPassword from './pages/EditPassword';
import GeneratePassword from './pages/GeneratePassword';
import CategoryPage from './pages/CategoryPage';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import { MainLayout } from './components/layouts/MainLayout';
import Profile from './pages/Profile';
import { useAuthStore } from './store/authStore';
import { SidebarProvider } from './components/ui/sidebar';

const queryClient = new QueryClient();

// Auth Guard component to handle protected routes
const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const App = () => {
  return (
    <Router>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <SidebarProvider>
          <QueryClientProvider client={queryClient}>
            <Toaster />
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Redirect root to dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* Protected routes */}
              <Route path="/dashboard" element={
                <AuthGuard>
                  <Dashboard />
                </AuthGuard>
              } />
              <Route path="/passwords" element={
                <AuthGuard>
                  <PasswordList />
                </AuthGuard>
              } />
              <Route path="/password-list" element={
                <AuthGuard>
                  <PasswordList />
                </AuthGuard>
              } />
              <Route path="/add-password" element={
                <AuthGuard>
                  <AddPassword />
                </AuthGuard>
              } />
              <Route path="/edit-password/:id" element={
                <AuthGuard>
                  <EditPassword />
                </AuthGuard>
              } />
              <Route path="/generate-password" element={
                <AuthGuard>
                  <GeneratePassword />
                </AuthGuard>
              } />
              <Route path="/categories/:categoryId" element={
                <AuthGuard>
                  <CategoryPage />
                </AuthGuard>
              } />
              <Route path="/settings" element={
                <AuthGuard>
                  <Settings />
                </AuthGuard>
              } />
              <Route path="/profile" element={
                <AuthGuard>
                  <Profile />
                </AuthGuard>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </QueryClientProvider>
        </SidebarProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;