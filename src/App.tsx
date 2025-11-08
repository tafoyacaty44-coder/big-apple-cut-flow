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
import Rewards from "./pages/Rewards";
import RewardsProgram from "./pages/RewardsProgram";
import AppointmentAction from "./pages/AppointmentAction";
import NotificationPreferences from "./pages/NotificationPreferences";
import VipPricing from "./pages/admin/VipPricing";
import BreakTime from "./pages/admin/BreakTime";
import BreakRequests from "./pages/admin/BreakRequests";
import Clients from "./pages/admin/Clients";
import ClientDetail from "./pages/admin/ClientDetail";
import RewardsManagement from "./pages/admin/RewardsManagement";
import ScheduleManagement from "./pages/admin/ScheduleManagement";
import ServicesManagement from "./pages/admin/ServicesManagement";
import GalleryManagement from "./pages/admin/GalleryManagement";
import BlogManagement from "./pages/admin/BlogManagement";
import Promotions from "./pages/admin/Promotions";
import BlacklistManagement from "./pages/admin/BlacklistManagement";
import SeoManagement from "./pages/admin/SeoManagement";
import MySchedule from "./pages/barber/MySchedule";
import MyClients from "./pages/barber/MyClients";
import BarberDetail from "./pages/BarberDetail";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";

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
            <Route path="/barbers/:id" element={<BarberDetail />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/book" element={<Book />} />
            <Route path="/booking-success" element={<BookingSuccess />} />
            <Route path="/rewards-program" element={<RewardsProgram />} />
            <Route path="/a/:token/:action" element={<AppointmentAction />} />
            <Route path="/notifications/manage" element={<NotificationPreferences />} />
            
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
              path="/admin/break-requests" 
              element={
                <AdminRoute>
                  <BreakRequests />
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
              path="/admin/rewards" 
              element={
                <AdminRoute>
                  <RewardsManagement />
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
              path="/barber/my-schedule" 
              element={
                <BarberRoute>
                  <MySchedule />
                </BarberRoute>
              } 
            />
            <Route
              path="/barber/my-clients" 
              element={
                <BarberRoute>
                  <MyClients />
                </BarberRoute>
              } 
            />
            <Route
              path="/admin/schedule"
              element={
                <AdminRoute>
                  <ScheduleManagement />
                </AdminRoute>
              } 
            />
            <Route
              path="/admin/services" 
              element={
                <AdminRoute>
                  <ServicesManagement />
                </AdminRoute>
              } 
            />
            <Route
              path="/admin/gallery" 
              element={
                <AdminRoute>
                  <GalleryManagement />
                </AdminRoute>
              } 
            />
            <Route
              path="/admin/blog" 
              element={
                <AdminRoute>
                  <BlogManagement />
                </AdminRoute>
              } 
            />
            <Route
              path="/admin/promotions" 
              element={
                <AdminRoute>
                  <Promotions />
                </AdminRoute>
              } 
            />
            <Route
              path="/admin/seo" 
              element={
                <AdminRoute>
                  <SeoManagement />
                </AdminRoute>
              } 
            />
            <Route
              path="/admin/blacklist" 
              element={
                <AdminRoute>
                  <BlacklistManagement />
                </AdminRoute>
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
            <Route 
              path="/rewards" 
              element={
                <CustomerRoute>
                  <Rewards />
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
