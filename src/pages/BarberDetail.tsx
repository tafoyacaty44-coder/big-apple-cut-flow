import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SevenDayAvailability } from '@/components/booking/SevenDayAvailability';
import { ArrowLeft, Calendar } from 'lucide-react';

const BarberDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: barber, isLoading } = useQuery({
    queryKey: ['barber', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('barbers')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const handleSelectTime = (date: string, time: string) => {
    navigate(`/book?barber=${id}&date=${date}&time=${time}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4">
          <div className="animate-pulse space-y-8">
            <div className="h-8 w-32 bg-muted rounded"></div>
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="h-96 bg-muted rounded"></div>
              <div className="h-96 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!barber) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Barber not found</h2>
          <Button onClick={() => navigate('/barbers')}>
            View All Barbers
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/barbers')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Barbers
        </Button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Barber Profile */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-6">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={barber.profile_image_url || undefined} />
                  <AvatarFallback className="text-3xl">
                    {barber.full_name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <h1 className="text-3xl font-bold mb-2">{barber.full_name}</h1>
                  <p className="text-muted-foreground text-lg">
                    {barber.years_experience} years of experience
                  </p>
                </div>

                {barber.bio && (
                  <p className="text-muted-foreground max-w-md">
                    {barber.bio}
                  </p>
                )}

                {barber.specialties && barber.specialties.length > 0 && (
                  <div className="w-full">
                    <h3 className="text-sm font-medium mb-3">Specialties</h3>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {barber.specialties.map((specialty: string) => (
                        <Badge key={specialty} variant="secondary">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => navigate(`/book?barber=${id}`)}
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  Book Appointment
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 7-Day Availability */}
          <SevenDayAvailability 
            barberId={id!} 
            onSelectTime={handleSelectTime}
          />
        </div>
      </div>
    </div>
  );
};

export default BarberDetail;