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
import { getDatabaseStats, updateBrandingAsset, updateColors, updateBackgroundOpacity, getSystemInfo, getAllUsers, promoteToMasterAdmin } from '@/lib/api/developer';
import { getBusinessConfig } from '@/lib/api/setup';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

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
  const [promoteEmail, setPromoteEmail] = useState('');
  const [showPromoteDialog, setShowPromoteDialog] = useState(false);

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

  const { data: users } = useQuery({
    queryKey: ['all-users'],
    queryFn: getAllUsers,
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

  const promoteMutation = useMutation({
    mutationFn: (email: string) => promoteToMasterAdmin(email),
    onSuccess: () => {
      toast({
        title: "User promoted",
        description: "User has been promoted to master admin",
      });
      queryClient.invalidateQueries({ queryKey: ['all-users'] });
      setPromoteEmail('');
      setShowPromoteDialog(false);
    },
    onError: (error: any) => {
      toast({
        title: "Promotion failed",
        description: error.message,
        variant: "destructive",
      });
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
            <TabsTrigger value="users">User & Role Management</TabsTrigger>
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

          {/* User & Role Management Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>View and manage user roles</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users?.map((user: any) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.full_name}</TableCell>
                        <TableCell>{user.phone || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant={user.user_roles?.role === 'master_admin' ? 'default' : 'secondary'}>
                            {user.user_roles?.role || 'customer'}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="border-yellow-600">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-yellow-600" />
                  <CardTitle>Promote to Master Admin</CardTitle>
                </div>
                <CardDescription>
                  Grant full system access including developer tools access
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg dark:bg-yellow-950/20 dark:border-yellow-900">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                        Warning: Master Admin Access
                      </p>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        Master admins have unrestricted access to all data, can bypass security policies, 
                        and manage branding and system configuration. Only promote trusted users.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="promote-email">User Email</Label>
                  <Input
                    id="promote-email"
                    type="email"
                    placeholder="user@example.com"
                    value={promoteEmail}
                    onChange={(e) => setPromoteEmail(e.target.value)}
                  />
                </div>

                <Button 
                  onClick={() => setShowPromoteDialog(true)}
                  disabled={!promoteEmail || promoteMutation.isPending}
                  variant="default"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Promote to Master Admin
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

      {/* Promotion Confirmation Dialog */}
      <AlertDialog open={showPromoteDialog} onOpenChange={setShowPromoteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Master Admin Promotion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to promote <strong>{promoteEmail}</strong> to master admin? 
              This will grant them full system access including:
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>Access to Developer Panel</li>
                <li>Ability to manage branding and assets</li>
                <li>Full database access with RLS bypass</li>
                <li>Ability to promote other users</li>
              </ul>
              <p className="mt-3 font-semibold">This action should only be done for fully trusted users.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => promoteMutation.mutate(promoteEmail)}
              disabled={promoteMutation.isPending}
            >
              {promoteMutation.isPending ? 'Promoting...' : 'Confirm Promotion'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DeveloperPanel;
