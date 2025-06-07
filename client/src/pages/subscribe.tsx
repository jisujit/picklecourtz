import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const SubscribeForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

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
        title: "Payment Successful",
        description: "You are subscribed!",
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button type="submit" className="w-full" disabled={!stripe}>
        Subscribe to Premium
      </Button>
    </form>
  );
};

export default function Subscribe() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [clientSecret, setClientSecret] = useState("");

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

  useEffect(() => {
    if (isAuthenticated) {
      apiRequest("POST", "/api/get-or-create-subscription")
        .then((res) => res.json())
        .then((data) => {
          setClientSecret(data.clientSecret)
        })
        .catch((error) => {
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
            description: "Failed to load subscription details",
            variant: "destructive",
          });
        });
    }
  }, [isAuthenticated, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-pickleball-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-pickleball-600 border-t-transparent rounded-full" aria-label="Loading"/>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-pickleball-600">
                <i className="fas fa-table-tennis mr-2"></i>PickleCourt Pro
              </h1>
            </div>
            <Button variant="ghost" onClick={() => window.location.href = '/'}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
          <p className="text-lg text-gray-600">
            Upgrade to Premium for unlimited court access and exclusive features
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Free Plan */}
          <Card>
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Free Plan</h3>
                <div className="text-3xl font-bold text-gray-900 mb-1">$0</div>
                <div className="text-sm text-gray-600">per month</div>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center">
                  <i className="fas fa-check text-green-600 mr-3"></i>
                  <span className="text-gray-700">2 court bookings per month</span>
                </li>
                <li className="flex items-center">
                  <i className="fas fa-check text-green-600 mr-3"></i>
                  <span className="text-gray-700">Standard court access</span>
                </li>
                <li className="flex items-center">
                  <i className="fas fa-check text-green-600 mr-3"></i>
                  <span className="text-gray-700">Basic notifications</span>
                </li>
              </ul>
              <Button 
                variant="outline" 
                className="w-full"
                disabled={user?.subscriptionStatus !== 'active'}
              >
                Current Plan
              </Button>
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className="border-pickleball-500 border-2 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-pickleball-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                Most Popular
              </span>
            </div>
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Premium Plan</h3>
                <div className="text-3xl font-bold text-pickleball-600 mb-1">$49</div>
                <div className="text-sm text-gray-600">per month</div>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center">
                  <i className="fas fa-check text-green-600 mr-3"></i>
                  <span className="text-gray-700">Unlimited court bookings</span>
                </li>
                <li className="flex items-center">
                  <i className="fas fa-check text-green-600 mr-3"></i>
                  <span className="text-gray-700">Premium court access</span>
                </li>
                <li className="flex items-center">
                  <i className="fas fa-check text-green-600 mr-3"></i>
                  <span className="text-gray-700">Priority booking</span>
                </li>
                <li className="flex items-center">
                  <i className="fas fa-check text-green-600 mr-3"></i>
                  <span className="text-gray-700">Advanced notifications</span>
                </li>
                <li className="flex items-center">
                  <i className="fas fa-check text-green-600 mr-3"></i>
                  <span className="text-gray-700">20% discount on all bookings</span>
                </li>
              </ul>
              
              {user?.subscriptionStatus === 'active' ? (
                <Button className="w-full" disabled>
                  Current Plan
                </Button>
              ) : (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <SubscribeForm />
                </Elements>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Billing Information */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Billing Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {user?.subscriptionStatus === 'active' ? 'Active' : 'Inactive'}
              </div>
              <div className="text-sm text-gray-600">Subscription Status</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">Dec 15</div>
              <div className="text-sm text-gray-600">Next Billing Date</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">Auto-Renew</div>
              <div className="text-sm text-gray-600">Billing Type</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
