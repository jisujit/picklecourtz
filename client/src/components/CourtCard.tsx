import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Court } from "@shared/schema";

interface CourtCardProps {
  court: Court;
  onBook: (court: Court) => void;
}

export default function CourtCard({ court, onBook }: CourtCardProps) {
  // Mock available time slots for demo
  const availableSlots = ['9:00 AM', '10:00 AM', '11:00 AM'];
  const bookedSlots = ['12:00 PM'];

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <img 
        src={court.imageUrl || "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400"} 
        alt={`${court.name} Indoor Pickleball Court`} 
        className="w-full h-48 object-cover"
      />
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{court.name}</h3>
            <p className="text-gray-600 text-sm">{court.description}</p>
          </div>
          <Badge variant={court.isActive ? "default" : "secondary"}>
            {court.isActive ? "Available" : "Unavailable"}
          </Badge>
        </div>
        
        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <i className="fas fa-dollar-sign w-4"></i>
            <span className="ml-2">${court.hourlyRate}/hour</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <i className="fas fa-users w-4"></i>
            <span className="ml-2">Capacity: {court.capacity} players</span>
          </div>
          {court.amenities && court.amenities.length > 0 && (
            <div className="flex items-center text-sm text-gray-600">
              <i className="fas fa-star w-4"></i>
              <span className="ml-2">{court.amenities.join(', ')}</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {availableSlots.map(slot => (
            <Badge key={slot} variant="outline" className="bg-pickleball-50 text-pickleball-700">
              {slot}
            </Badge>
          ))}
          {bookedSlots.map(slot => (
            <Badge key={slot} variant="secondary" className="line-through">
              {slot}
            </Badge>
          ))}
        </div>
        
        <Button 
          className="w-full bg-pickleball-600 hover:bg-pickleball-700" 
          onClick={() => onBook(court)}
          disabled={!court.isActive}
        >
          {court.isActive ? 'Book Now' : 'Currently Unavailable'}
        </Button>
      </CardContent>
    </Card>
  );
}
