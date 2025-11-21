import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Logo from '@/components/Logo';
import { ArrowLeft, Upload, Shield, AlertTriangle } from 'lucide-react';
import { getDatabaseStats, updateBrandingAsset, updateColors, updateBackgroundOpacity, getSystemInfo } from '@/lib/api/developer';
import { getBusinessConfig } from '@/lib/api/setup';

const DeveloperPanel = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [bgFile, setBgFile] = useState<File | null>(null);
  const [primaryColor, setPrimaryColor] = useState('#D4AF37');
  const [accentColor, setAccentColor] = useState('#1A1A1A');
  const [bgOpacity, setBgOpacity] = useState(0.35);

  const { data: config } = useQuery({
    queryKey: ['business-config'],
    queryFn: getBusinessConfig,
  });

  const { data: dbStats } = useQuery({
    queryKey: ['db-stats'],
    queryFn: getDatabaseStats,
  });

  const { data: sysInfo } = useQuery({
    queryKey: ['system-info'],
    queryFn: getSystemInfo,
  });

  const uploadAssetMutation = useMutation({
    mutationFn: ({ type, file }: { type: 'logo' | 'hero' | 'background'; file: File }) => 
      updateBrandingAsset(type, file),
    onSuccess: (url, variables) => {
      toast({
        title: "Upload successful",
        description: `${variables.type} updated successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ['business-config'] });
      if (variables.type === 'logo') setLogoFile(null);
      if (variables.type === 'hero') setHeroFile(null);
      if (variables.type === 'background') setBgFile(null);
    },
    onError: (error: any) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateColorsMutation = useMutation({
    mutationFn: () => updateColors(primaryColor, accentColor),
    onSuccess: () => {
      toast({
        title: "Colors updated",
        description: "Brand colors have been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['business-config'] });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateOpacityMutation = useMutation({
    mutationFn: (opacity: number) => updateBackgroundOpacity(opacity),
    onSuccess: () => {
      toast({
        title: "Opacity updated",
        description: "Background opacity has been updated",
      });
      queryClient.invalidateQueries({ queryKey: ['business-config'] });
    },
  });

  const handleUploadLogo = () => {
    if (logoFile) {
      uploadAssetMutation.mutate({ type: 'logo', file: logoFile });
    }
  };

  const handleUploadHero = () => {
    if (heroFile) {
      uploadAssetMutation.mutate({ type: 'hero', file: heroFile });
    }
  };

  const handleUploadBackground = () => {
    if (bgFile) {
      uploadAssetMutation.mutate({ type: 'background', file: bgFile });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/admin">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Admin
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-yellow-600" />
                <h1 className="text-2xl font-bold">Developer Panel</h1>
              </div>
            </div>
            <Button variant="outline" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="branding" className="space-y-4">
          <TabsList>
            <TabsTrigger value="branding">Branding & Assets</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
            <TabsTrigger value="system">System Info</TabsTrigger>
          </TabsList>

          {/* Branding Tab */}
          <TabsContent value="branding" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Logo Management</CardTitle>
                <CardDescription>Upload and manage your business logo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {config?.logo_url && (
                  <div className="mb-4">
                    <Label>Current Logo</Label>
                    <div className="mt-2 p-4 border rounded-lg bg-muted flex items-center justify-center">
                      <img src={config.logo_url} alt="Current logo" className="h-16" />
                    </div>
                  </div>
                )}
                <div>
                  <Label htmlFor="logo-upload">Upload New Logo</Label>
                  <Input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                    className="mt-2"
                  />
                </div>
                <Button 
                  onClick={handleUploadLogo} 
                  disabled={!logoFile || uploadAssetMutation.isPending}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {uploadAssetMutation.isPending ? 'Uploading...' : 'Upload Logo'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Navigation Hero Image</CardTitle>
                <CardDescription>Background image for the navigation bar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {config?.hero_image_url && (
                  <div className="mb-4">
                    <Label>Current Hero Image</Label>
                    <div className="mt-2 border rounded-lg overflow-hidden">
                      <img src={config.hero_image_url} alt="Current hero" className="w-full h-32 object-cover" />
                    </div>
                  </div>
                )}
                <div>
                  <Label htmlFor="hero-upload">Upload New Hero Image</Label>
                  <Input
                    id="hero-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setHeroFile(e.target.files?.[0] || null)}
                    className="mt-2"
                  />
                </div>
                <Button 
                  onClick={handleUploadHero} 
                  disabled={!heroFile || uploadAssetMutation.isPending}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {uploadAssetMutation.isPending ? 'Uploading...' : 'Upload Hero Image'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Home Page Background Pattern</CardTitle>
                <CardDescription>Repeating background pattern for the home page</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {(config as any)?.background_pattern_url && (
                  <div className="mb-4">
                    <Label>Current Pattern</Label>
                    <div className="mt-2 border rounded-lg p-4" style={{
                      backgroundImage: `url(${(config as any).background_pattern_url})`,
                      backgroundRepeat: 'repeat',
                      backgroundSize: '200px 200px',
                      height: '200px'
                    }} />
                  </div>
                )}
                <div>
                  <Label htmlFor="bg-upload">Upload New Pattern (400x400px recommended)</Label>
                  <Input
                    id="bg-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setBgFile(e.target.files?.[0] || null)}
                    className="mt-2"
                  />
                </div>
                <Button 
                  onClick={handleUploadBackground} 
                  disabled={!bgFile || uploadAssetMutation.isPending}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {uploadAssetMutation.isPending ? 'Uploading...' : 'Upload Pattern'}
                </Button>
                
                <div className="pt-4 border-t">
                  <Label htmlFor="opacity-slider">Background Opacity: {bgOpacity.toFixed(2)}</Label>
                  <Input
                    id="opacity-slider"
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={bgOpacity}
                    onChange={(e) => setBgOpacity(parseFloat(e.target.value))}
                    className="mt-2"
                  />
                  <Button 
                    onClick={() => updateOpacityMutation.mutate(bgOpacity)}
                    disabled={updateOpacityMutation.isPending}
                    className="mt-2"
                    size="sm"
                  >
                    Save Opacity
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Brand Colors</CardTitle>
                <CardDescription>Customize primary and accent colors</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="primary-color">Primary Color</Label>
                    <Input
                      id="primary-color"
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="mt-2 h-12"
                    />
                  </div>
                  <div>
                    <Label htmlFor="accent-color">Accent Color</Label>
                    <Input
                      id="accent-color"
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="mt-2 h-12"
                    />
                  </div>
                </div>
                <Button 
                  onClick={() => updateColorsMutation.mutate()}
                  disabled={updateColorsMutation.isPending}
                >
                  {updateColorsMutation.isPending ? 'Saving...' : 'Save Colors'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Database Tab */}
          <TabsContent value="database" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Database Statistics</CardTitle>
                <CardDescription>Overview of your database records</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {dbStats && Object.entries(dbStats).map(([table, count]) => (
                    <div key={table} className="p-4 border rounded-lg">
                      <div className="text-2xl font-bold">{count}</div>
                      <div className="text-sm text-muted-foreground capitalize">
                        {table.replace('_', ' ')}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  <CardTitle className="text-destructive">Danger Zone</CardTitle>
                </div>
                <CardDescription>
                  Advanced operations that cannot be undone
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Database management features coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Info Tab */}
          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Information</CardTitle>
                <CardDescription>Your Lovable Cloud project details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Project ID</Label>
                  <Input value={sysInfo?.projectId || ''} readOnly className="mt-2" />
                </div>
                <div>
                  <Label>Backend URL</Label>
                  <Input value={sysInfo?.supabaseUrl || ''} readOnly className="mt-2" />
                </div>
                <div>
                  <Label>Business Name</Label>
                  <Input value={sysInfo?.businessConfig?.business_name || ''} readOnly className="mt-2" />
                </div>
                <div>
                  <Label>Business Type</Label>
                  <Input value={sysInfo?.businessConfig?.business_type || ''} readOnly className="mt-2" />
                </div>
                <div>
                  <Label>Setup Completed</Label>
                  <Input 
                    value={sysInfo?.setupCompletedAt ? new Date(sysInfo.setupCompletedAt).toLocaleDateString() : 'N/A'} 
                    readOnly 
                    className="mt-2" 
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DeveloperPanel;
