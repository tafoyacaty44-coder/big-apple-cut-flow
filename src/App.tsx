import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BookingProvider } from "@/contexts/BookingContext";
import { AdminRoute, BarberRoute, CustomerRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import StaffLogin from "./pages/StaffLogin";
import Signup from "./pages/Signup";
import ResetPassword from "./pages/ResetPassword";
import Barbers from "./pages/Barbers";
import Gallery from "./pages/Gallery";
import Book from "./pages/Book";
import BookingSuccess from "./pages/BookingSuccess";
import AdminDashboard from "./pages/AdminDashboard";
import BarberDashboard from "./pages/BarberDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";
import VipPricing from "./pages/admin/VipPricing";
import BreakTime from "./pages/admin/BreakTime";
import Clients from "./pages/admin/Clients";
import ClientDetail from "./pages/admin/ClientDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BookingProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/staff-login" element={<StaffLogin />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/barbers" element={<Barbers />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/book" element={<Book />} />
            <Route path="/booking-success" element={<BookingSuccess />} />
            
            {/* Protected Routes */}
            <Route 
              path="/admin" 
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/vip-pricing" 
              element={
                <AdminRoute>
                  <VipPricing />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/breaks" 
              element={
                <AdminRoute>
                  <BreakTime />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/clients" 
              element={
                <AdminRoute>
                  <Clients />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/clients/:id" 
              element={
                <AdminRoute>
                  <ClientDetail />
                </AdminRoute>
              } 
            />
            <Route 
              path="/barber" 
              element={
                <BarberRoute>
                  <BarberDashboard />
                </BarberRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <CustomerRoute>
                  <CustomerDashboard />
                </CustomerRoute>
              } 
            />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </BookingProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
