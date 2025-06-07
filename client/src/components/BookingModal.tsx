import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import type { Court } from "@shared/schema";

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  court: Court | null;
}

const BookingForm = ({ court, onSuccess }: { court: Court; onSuccess: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin,
        },
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Booking Confirmed",
          description: "Your court has been booked successfully!",
        });
        onSuccess();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <div className="flex gap-3">
        <Button type="button" variant="outline" className="flex-1" onClick={onSuccess}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          className="flex-1 bg-pickleball-600 hover:bg-pickleball-700" 
          disabled={!stripe || isProcessing}
        >
          {isProcessing ? 'Processing...' : `Confirm & Pay $${parseFloat(court.hourlyRate) + 2.50}`}
        </Button>
      </div>
    </form>
  );
};

export default function BookingModal({ isOpen, onClose, court }: BookingModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState('10:00');
  const [duration, setDuration] = useState('1');
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen && court) {
      setClientSecret(null);
      setSelectedDate(new Date().toISOString().split('T')[0]);
      setSelectedTime('10:00');
      setDuration('1');
    }
  }, [isOpen, court]);

  const createPaymentIntentMutation = useMutation({
    mutationFn: async () => {
      if (!court) throw new Error('No court selected');
      
      const hourlyRate = parseFloat(court.hourlyRate);
      const durationHours = parseInt(duration);
      const platformFee = 2.50;
      const totalAmount = (hourlyRate * durationHours) + platformFee;

      const response = await apiRequest("POST", "/api/create-payment-intent", {
        amount: totalAmount,
        courtId: court.id,
        date: selectedDate,
        time: selectedTime,
        duration: durationHours,
      });
      
      return response.json();
    },
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to process payment",
        variant: "destructive",
      });
    },
  });

  const createBookingMutation = useMutation({
    mutationFn: async () => {
      if (!court) throw new Error('No court selected');
      
      const startTime = new Date(`${selectedDate}T${selectedTime}:00`);
      const endTime = new Date(startTime.getTime() + parseInt(duration) * 60 * 60 * 1000);
      const hourlyRate = parseFloat(court.hourlyRate);
      const platformFee = 2.50;
      const totalAmount = (hourlyRate * parseInt(duration)) + platformFee;

      const response = await apiRequest("POST", "/api/bookings", {
        courtId: court.id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        totalAmount: totalAmount.toString(),
        platformFee: platformFee.toString(),
      });
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      toast({
        title: "Booking Created",
        description: "Your booking has been created successfully!",
      });
      onClose();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to create booking",
        variant: "destructive",
      });
    },
  });

  const handleProceedToPayment = () => {
    createPaymentIntentMutation.mutate();
  };

  const handleBookingSuccess = () => {
    createBookingMutation.mutate();
  };

  if (!court) return null;

  const hourlyRate = parseFloat(court.hourlyRate);
  const durationHours = parseInt(duration);
  const platformFee = 2.50;
  const totalAmount = (hourlyRate * durationHours) + platformFee;

  // Available time slots (mock data)
  const timeSlots = [
    '09:00', '10:00', '11:00', '13:00', '14:00', '15:00'
  ];
  const bookedSlots = ['12:00'];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book {court.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Court Info */}
          <div>
            <img 
              src={court.imageUrl || "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=300"} 
              alt={`${court.name} Overview`} 
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-lg font-semibold text-gray-900">{court.name}</h4>
                <p className="text-gray-600">{court.description}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-pickleball-600">${court.hourlyRate}</div>
                <div className="text-sm text-gray-600">per hour</div>
              </div>
            </div>
          </div>

          {/* Date & Time Selection */}
          <div>
            <h5 className="font-semibold text-gray-900 mb-4">Select Date & Time</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pickleball-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                <select 
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pickleball-500 focus:border-transparent"
                >
                  <option value="1">1 hour</option>
                  <option value="2">2 hours</option>
                  <option value="3">3 hours</option>
                </select>
              </div>
            </div>
            
            {/* Available Time Slots */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Available Time Slots</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {timeSlots.map(slot => (
                  <Button
                    key={slot}
                    variant={selectedTime === slot ? "default" : "outline"}
                    className={`p-3 text-sm font-medium ${
                      selectedTime === slot 
                        ? 'bg-pickleball-600 hover:bg-pickleball-700' 
                        : 'hover:border-pickleball-500 hover:bg-pickleball-50'
                    }`}
                    onClick={() => setSelectedTime(slot)}
                  >
                    {slot}
                  </Button>
                ))}
                {bookedSlots.map(slot => (
                  <Button
                    key={slot}
                    variant="outline"
                    className="p-3 text-sm font-medium bg-gray-100 text-gray-400 cursor-not-allowed"
                    disabled
                  >
                    {slot}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Booking Summary */}
          <Card>
            <CardContent className="p-4 bg-gray-50">
              <h5 className="font-semibold text-gray-900 mb-3">Booking Summary</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>{court.name}</span>
                  <span>${(hourlyRate * durationHours).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{selectedDate} • {selectedTime} - {String(parseInt(selectedTime.split(':')[0]) + durationHours).padStart(2, '0')}:{selectedTime.split(':')[1]}</span>
                  <span>{duration} hour{durationHours > 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Platform fee</span>
                  <span>${platformFee.toFixed(2)}</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-pickleball-600">${totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cancellation Policy */}
          <Alert>
            <i className="fas fa-info-circle"></i>
            <AlertDescription>
              <strong>Cancellation Policy:</strong>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Full refund if cancelled 1+ hours before start time</li>
                <li>• 50% refund if cancelled within 5 minutes of start time</li>
                <li>• No refund for no-shows or late cancellations</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Payment or Action Buttons */}
          {!clientSecret ? (
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-pickleball-600 hover:bg-pickleball-700" 
                onClick={handleProceedToPayment}
                disabled={createPaymentIntentMutation.isPending}
              >
                {createPaymentIntentMutation.isPending ? 'Processing...' : 'Proceed to Payment'}
              </Button>
            </div>
          ) : (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <BookingForm court={court} onSuccess={handleBookingSuccess} />
            </Elements>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
