import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Court } from "@shared/schema";

export default function Admin() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== "admin")) {
      toast({
        title: "Unauthorized",
        description: "Admin access required",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, user, toast]);

  const { data: stats } = useQuery({
    queryKey: ["/api/admin/stats"],
    retry: false,
  });

  const { data: courts = [] } = useQuery<Court[]>({
    queryKey: ["/api/courts"],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Navigation */}
      <nav className="bg-purple-600 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white">
                <i className="fas fa-shield-alt mr-2"></i>Admin Panel
              </h1>
              <div className="hidden md:block ml-10">
                <div className="flex items-baseline space-x-4">
                  <a href="#" className="text-white bg-purple-700 px-3 py-2 rounded-md text-sm font-medium">Dashboard</a>
                  <a href="#" className="text-purple-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Courts</a>
                  <a href="#" className="text-purple-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Bookings</a>
                  <a href="#" className="text-purple-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Users</a>
                  <a href="#" className="text-purple-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Settings</a>
                </div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              className="text-white hover:text-purple-200"
              onClick={() => window.location.href = '/'}
            >
              <i className="fas fa-times text-xl"></i>
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <i className="fas fa-users text-blue-600 text-xl"></i>
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</div>
                  <div className="text-sm text-gray-600">Total Users</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-pickleball-100 p-3 rounded-lg">
                  <i className="fas fa-table-tennis text-pickleball-600 text-xl"></i>
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{stats?.activeCourts || 0}</div>
                  <div className="text-sm text-gray-600">Active Courts</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-lg">
                  <i className="fas fa-calendar-check text-green-600 text-xl"></i>
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{stats?.todaysBookings || 0}</div>
                  <div className="text-sm text-gray-600">Today's Bookings</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-amber-100 p-3 rounded-lg">
                  <i className="fas fa-dollar-sign text-amber-600 text-xl"></i>
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">${stats?.monthlyRevenue || 0}</div>
                  <div className="text-sm text-gray-600">Monthly Revenue</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Court Management */}
        <Card className="p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Court Management</h3>
            <Button className="bg-pickleball-600 hover:bg-pickleball-700">
              <i className="fas fa-plus mr-2"></i>Add New Court
            </Button>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Court</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courts.map(court => (
                  <TableRow key={court.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-pickleball-100 rounded-lg flex items-center justify-center mr-4">
                          <i className="fas fa-table-tennis text-pickleball-600"></i>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{court.name}</div>
                          <div className="text-sm text-gray-500">{court.description}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={court.isActive ? "default" : "secondary"}>
                        {court.isActive ? "Available" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>${court.hourlyRate}/hour</TableCell>
                    <TableCell>{court.capacity} players</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button variant="outline" size="sm">Schedule</Button>
                        <Button variant="outline" size="sm" className="text-red-600">
                          {court.isActive ? 'Disable' : 'Enable'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Recent Bookings */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Recent Bookings</h3>
            <Button variant="ghost" size="sm">View All</Button>
          </div>
          
          <div className="text-center py-8 text-gray-500">
            <i className="fas fa-calendar-times text-4xl mb-4"></i>
            <p>No recent bookings to display</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
