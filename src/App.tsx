
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ServiceProvider } from "./context/ServiceContext";

// Pages
import Login from "./pages/Login";
import AuthPage from "./pages/AuthPage";
import ClientProfileSetup from "./pages/client/ClientProfileSetup";
import ClientHome from "./pages/client/ClientHome";
import ClientServices from "./pages/client/ClientServices";
import ClientRequests from "./pages/client/ClientRequests";
import ServiceBooking from "./pages/client/ServiceBooking";

import Payment from "./pages/client/Payment";
import Tracking from "./pages/client/Tracking";
import ServiceSelection from "./pages/technician/ServiceSelection";
import TechnicianProfileSetup from "./pages/technician/TechnicianProfileSetup";
import TechnicianHome from "./pages/technician/TechnicianHome";
import TechnicianTracking from "./pages/technician/TechnicianTracking";
import TechnicianRequests from "./pages/technician/TechnicianRequests";
import ServiceDetails from "./pages/technician/ServiceDetails";
import NotFound from "./pages/NotFound";

// Auth routes
import ProtectedRoute from './components/ProtectedRoute';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ServiceProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Login />} />
              <Route path="/auth/client" element={<AuthPage userType="client" />} />
              <Route path="/auth/technician" element={<AuthPage userType="technician" />} />
              
              {/* Client Routes */}
              <Route path="/client/profile-setup" element={
                <ProtectedRoute userType="client" allowIfProfileIncomplete>
                  <ClientProfileSetup />
                </ProtectedRoute>
              } />
              <Route path="/client/home" element={
                <ProtectedRoute userType="client">
                  <ClientHome />
                </ProtectedRoute>
              } />
              <Route path="/client/services" element={
                <ProtectedRoute userType="client">
                  <ClientServices />
                </ProtectedRoute>
              } />
              <Route path="/client/requests" element={
                <ProtectedRoute userType="client">
                  <ClientRequests />
                </ProtectedRoute>
              } />
              <Route path="/client/booking/:serviceType" element={
                <ProtectedRoute userType="client">
                  <ServiceBooking />
                </ProtectedRoute>
              } />
              <Route path="/client/payment" element={
                <ProtectedRoute userType="client">
                  <Payment />
                </ProtectedRoute>
              } />
              <Route path="/client/tracking" element={
                <ProtectedRoute userType="client">
                  <Tracking />
                </ProtectedRoute>
              } />
              
              {/* Technician Routes */}
              <Route path="/technician/service-selection" element={
                <ProtectedRoute userType="technician" allowIfProfileIncomplete>
                  <ServiceSelection />
                </ProtectedRoute>
              } />
              <Route path="/technician/profile-setup" element={
                <ProtectedRoute userType="technician" allowIfProfileIncomplete>
                  <TechnicianProfileSetup />
                </ProtectedRoute>
              } />
              <Route path="/technician/home" element={
                <ProtectedRoute userType="technician">
                  <TechnicianHome />
                </ProtectedRoute>
              } />
              <Route path="/technician/tracking" element={
                <ProtectedRoute userType="technician">
                  <TechnicianTracking />
                </ProtectedRoute>
              } />
              <Route path="/technician/requests" element={
                <ProtectedRoute userType="technician">
                  <TechnicianRequests />
                </ProtectedRoute>
              } />
              <Route path="/technician/service-details" element={
                <ProtectedRoute userType="technician">
                  <ServiceDetails />
                </ProtectedRoute>
              } />
              
              {/* Redirect */}
              <Route path="/client" element={<Navigate to="/client/home" replace />} />
              <Route path="/technician" element={<Navigate to="/technician/home" replace />} />
              
              {/* Catch All */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ServiceProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
