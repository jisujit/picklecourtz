import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pickleball-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-pickleball-600">
                <i className="fas fa-table-tennis mr-2"></i>PickleCourt Pro
              </h1>
            </div>
            <Button onClick={() => window.location.href = '/api/login'}>
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Premium Indoor
            <span className="text-pickleball-600 block">Pickleball Courts</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Book premium climate-controlled courts, manage your playing time, 
            and enjoy the best pickleball experience in the city.
          </p>
          <Button 
            size="lg" 
            className="bg-pickleball-600 hover:bg-pickleball-700"
            onClick={() => window.location.href = '/api/login'}
          >
            Get Started Today
          </Button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="bg-pickleball-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <i className="fas fa-calendar-plus text-pickleball-600 text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Booking</h3>
              <p className="text-gray-600">
                Book courts instantly with real-time availability and flexible scheduling.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <i className="fas fa-credit-card text-blue-600 text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Payments</h3>
              <p className="text-gray-600">
                Safe and secure payment processing with flexible cancellation policies.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <i className="fas fa-star text-green-600 text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold mb-2">Premium Courts</h3>
              <p className="text-gray-600">
                Climate-controlled courts with professional lighting and sound dampening.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
