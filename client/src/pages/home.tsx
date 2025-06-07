import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/Navigation";
import CourtCard from "@/components/CourtCard";
import BookingModal from "@/components/BookingModal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Court, Booking, Notification } from "@shared/schema";

export default function Home() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: courts = [], isLoading: courtsLoading } = useQuery<Court[]>({
    queryKey: ["/api/courts"],
    retry: false,
  });

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
    retry: false,
  });

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    retry: false,
  });

  const activeBookings = bookings.filter(booking => 
    booking.status === "confirmed" || booking.status === "active"
  );

  const unreadNotifications = notifications.filter(n => !n.isRead);

  const handleBookCourt = (court: Court) => {
    setSelectedCourt(court);
    setIsBookingModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-pickleball-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation user={user} unreadCount={unreadNotifications.length} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-pickleball-500 to-pickleball-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">
                  Welcome back, {user?.firstName || 'Player'}!
                </h2>
                <p className="text-pickleball-100 text-lg">
                  Ready for your next match? Check out available courts below.
                </p>
              </div>
              <div className="mt-4 md:mt-0 grid grid-cols-2 gap-4 text-center">
                <div className="bg-white/20 rounded-lg p-3">
                  <div className="text-2xl font-bold">{bookings.length}</div>
                  <div className="text-sm text-pickleball-100">Total Bookings</div>
                </div>
                <div className="bg-white/20 rounded-lg p-3">
                  <div className="text-2xl font-bold">
                    {bookings.reduce((acc, b) => {
                      const start = new Date(b.startTime);
                      const end = new Date(b.endTime);
                      return acc + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                    }, 0)}
                  </div>
                  <div className="text-sm text-pickleball-100">Hours Played</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex items-center justify-start bg-white border-gray-200 hover:shadow-md"
              onClick={() => document.getElementById('courts-section')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <div className="bg-pickleball-100 p-3 rounded-lg mr-4">
                <i className="fas fa-calendar-plus text-pickleball-600 text-xl"></i>
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Book a Court</h3>
                <p className="text-sm text-gray-600">Reserve your playing time</p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex items-center justify-start bg-white border-gray-200 hover:shadow-md"
              onClick={() => document.getElementById('bookings-section')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <div className="bg-amber-100 p-3 rounded-lg mr-4">
                <i className="fas fa-clock text-amber-600 text-xl"></i>
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">My Bookings</h3>
                <p className="text-sm text-gray-600">View upcoming sessions</p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex items-center justify-start bg-white border-gray-200 hover:shadow-md"
              disabled={activeBookings.length === 0}
            >
              <div className="bg-green-100 p-3 rounded-lg mr-4">
                <i className="fas fa-play text-green-600 text-xl"></i>
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Start Session</h3>
                <p className="text-sm text-gray-600">Begin your court time</p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex items-center justify-start bg-white border-gray-200 hover:shadow-md"
              onClick={() => window.location.href = '/subscribe'}
            >
              <div className="bg-blue-100 p-3 rounded-lg mr-4">
                <i className="fas fa-credit-card text-blue-600 text-xl"></i>
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Billing</h3>
                <p className="text-sm text-gray-600">Manage payments</p>
              </div>
            </Button>
          </div>
        </div>

        {/* Available Courts Section */}
        <div id="courts-section" className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">Available Courts</h2>
            <div className="flex flex-col sm:flex-row gap-2">
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pickleball-500 focus:border-transparent">
                <option>Today</option>
                <option>Tomorrow</option>
                <option>This Week</option>
              </select>
              <input 
                type="time" 
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pickleball-500 focus:border-transparent" 
                defaultValue="09:00"
              />
            </div>
          </div>

          {courtsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-4"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courts.map(court => (
                <CourtCard 
                  key={court.id} 
                  court={court} 
                  onBook={() => handleBookCourt(court)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Active Bookings & Notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8" id="bookings-section">
          {/* Active Bookings */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Active Bookings</h3>
              <Button variant="ghost" size="sm">View All</Button>
            </div>
            
            <div className="space-y-4">
              {bookingsLoading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2].map(i => (
                    <div key={i} className="border border-gray-200 rounded-lg p-4">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mb-4"></div>
                      <div className="flex gap-2">
                        <div className="h-8 bg-gray-200 rounded flex-1"></div>
                        <div className="h-8 bg-gray-200 rounded flex-1"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : activeBookings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <i className="fas fa-calendar-times text-4xl mb-4"></i>
                  <p>No active bookings</p>
                </div>
              ) : (
                activeBookings.map(booking => (
                  <div key={booking.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">Court {booking.courtId}</h4>
                        <p className="text-sm text-gray-600">
                          {new Date(booking.startTime).toLocaleDateString()} • {' '}
                          {new Date(booking.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {' '}
                          {new Date(booking.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'active' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.status === 'confirmed' ? 'Confirmed' :
                         booking.status === 'active' ? 'Active' :
                         booking.status}
                      </span>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        disabled={booking.status !== 'confirmed'}
                      >
                        <i className="fas fa-play mr-2"></i>Start Session
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <i className="fas fa-times mr-2"></i>Cancel
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Notifications */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Notifications</h3>
              <Button variant="ghost" size="sm">Mark All Read</Button>
            </div>
            
            <div className="space-y-4">
              {notifications.slice(0, 4).map(notification => (
                <div key={notification.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className={`p-2 rounded-full ${
                    notification.type === 'booking_confirmed' ? 'bg-pickleball-100' :
                    notification.type === 'session_reminder' ? 'bg-amber-100' :
                    notification.type === 'payment_received' ? 'bg-blue-100' :
                    'bg-green-100'
                  }`}>
                    <i className={`fas ${
                      notification.type === 'booking_confirmed' ? 'fa-check-circle text-pickleball-600' :
                      notification.type === 'session_reminder' ? 'fa-clock text-amber-600' :
                      notification.type === 'payment_received' ? 'fa-credit-card text-blue-600' :
                      'fa-gift text-green-600'
                    }`}></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
              
              {notifications.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <i className="fas fa-bell-slash text-4xl mb-4"></i>
                  <p>No notifications</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Subscription & Billing Info */}
        <Card className="p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Subscription & Billing</h3>
              <p className="text-gray-600">Manage your membership and payment methods</p>
            </div>
            <Button 
              className="mt-4 md:mt-0"
              onClick={() => window.location.href = '/subscribe'}
            >
              Upgrade Plan
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="text-center">
                <h4 className="font-semibold text-gray-900 mb-2">Current Plan</h4>
                <div className="text-2xl font-bold text-pickleball-600 mb-1">
                  {user?.subscriptionStatus === 'active' ? 'Premium' : 'Free'}
                </div>
                <div className="text-sm text-gray-600">
                  {user?.subscriptionStatus === 'active' ? '$49/month' : '$0/month'}
                </div>
                <div className="mt-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user?.subscriptionStatus === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user?.subscriptionStatus === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="text-center">
                <h4 className="font-semibold text-gray-900 mb-2">Next Billing</h4>
                <div className="text-2xl font-bold text-gray-900 mb-1">Dec 15</div>
                <div className="text-sm text-gray-600">$49.00</div>
                <div className="mt-3">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">Auto-Renew</span>
                </div>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="text-center">
                <h4 className="font-semibold text-gray-900 mb-2">This Month</h4>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  ${bookings.reduce((acc, b) => acc + parseFloat(b.totalAmount), 0).toFixed(0)}
                </div>
                <div className="text-sm text-gray-600">Total spent</div>
                <div className="mt-3">
                  <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-medium">
                    {bookings.length} Bookings
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        court={selectedCourt}
      />
    </div>
  );
}
