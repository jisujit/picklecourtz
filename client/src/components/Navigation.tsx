import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { User } from "@shared/schema";

interface NavigationProps {
  user: User | null | undefined;
  unreadCount?: number;
}

export default function Navigation({ user, unreadCount = 0 }: NavigationProps) {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-pickleball-600">
                <i className="fas fa-table-tennis mr-2"></i>PickleCourt Pro
              </h1>
            </div>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                <a 
                  href="/" 
                  className="text-pickleball-600 bg-pickleball-50 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </a>
                <a 
                  href="#courts-section" 
                  className="text-gray-600 hover:text-pickleball-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Courts
                </a>
                <a 
                  href="#bookings-section" 
                  className="text-gray-600 hover:text-pickleball-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  My Bookings
                </a>
                <a 
                  href="/subscribe" 
                  className="text-gray-600 hover:text-pickleball-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Billing
                </a>
                {user?.role === 'admin' && (
                  <a 
                    href="/admin" 
                    className="text-purple-600 hover:text-purple-700 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Admin
                  </a>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="relative">
              <i className="fas fa-bell text-xl"></i>
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 text-xs rounded-full p-0 flex items-center justify-center"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={user?.profileImageUrl || undefined} 
                      alt={`${user?.firstName} ${user?.lastName}`} 
                    />
                    <AvatarFallback>
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-gray-700 hidden sm:block">
                    {user?.firstName} {user?.lastName}
                  </span>
                  <i className="fas fa-chevron-down text-gray-600"></i>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem>
                  <i className="fas fa-user mr-2"></i>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <i className="fas fa-cog mr-2"></i>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-600" 
                  onClick={() => window.location.href = '/api/logout'}
                >
                  <i className="fas fa-sign-out-alt mr-2"></i>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" size="sm" className="bg-pickleball-50 text-pickleball-600">
            Dashboard
          </Button>
          <Button variant="ghost" size="sm">
            Courts
          </Button>
          <Button variant="ghost" size="sm">
            Bookings
          </Button>
          <Button variant="ghost" size="sm">
            Billing
          </Button>
          {user?.role === 'admin' && (
            <Button variant="ghost" size="sm" className="text-purple-600">
              Admin
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
