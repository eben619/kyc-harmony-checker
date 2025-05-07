
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SessionContextProvider, useSessionContext } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "./components/Layout";
import Account from "./pages/Account";
import Privacy from "./pages/Privacy";
import Notifications from "./pages/Notifications";
import Tax from "./pages/Tax";
import Language from "./pages/Language";
import Login from "./pages/Login";
import PersonalInfoForm from "./pages/kyc/PersonalInfoForm";
import DocumentUploadForm from "./pages/kyc/DocumentUploadForm";
import BiometricVerificationForm from "./pages/kyc/BiometricVerificationForm";
import ReviewForm from "./pages/kyc/ReviewForm";
import { useEffect, useState } from "react";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, isLoading } = useSessionContext();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (!currentSession) {
          // Clear any stale data
          await supabase.auth.signOut();
        }
      } catch (error) {
        console.error("Session check error:", error);
      } finally {
        setIsChecking(false);
      }
    };

    checkSession();
  }, []);

  // Show loading state while checking session
  if (isLoading || isChecking) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to login if no session
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SessionContextProvider supabaseClient={supabase}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Account />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/account"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Account />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/kyc"
              element={
                <ProtectedRoute>
                  <Layout>
                    <PersonalInfoForm />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/kyc/document-upload"
              element={
                <ProtectedRoute>
                  <Layout>
                    <DocumentUploadForm />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/kyc/biometric"
              element={
                <ProtectedRoute>
                  <Layout>
                    <BiometricVerificationForm />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/kyc/review"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ReviewForm />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/privacy"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Privacy />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Notifications />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/tax"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Tax />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/language"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Language />
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </SessionContextProvider>
  </QueryClientProvider>
);

export default App;
