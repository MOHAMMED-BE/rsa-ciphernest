
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { FilePlus, FileText, Settings, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout';
import { usePasswordStore } from '@/store/passwordStore';
import { useCryptoStore } from '@/store/cryptoStore';
import { encryptWithPublicKey } from '@/utils/cryptoUtils';

const Profile = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const { passwords } = usePasswordStore.getState();
  const { keyManager } = useCryptoStore.getState();

  const handleExportPasswords = async () => {
    const format = (document.getElementById('export-format') as HTMLSelectElement)?.value || 'encrypted';

    if (passwords.length === 0) {
      toast({
        title: 'Aucun mot de passe à exporter',
        description: 'Votre coffre est vide.'
      });
      return;
    }

    let exportData: string | null = null;
    let fileName = 'ciphernest_passwords';

    try {
      if (format === 'encrypted') {
        if (!keyManager.publicKey) {
          toast({
            description: "Vous devez générer ou importer vos clés avant d'exporter en mode sécurisé."
          });
          return;
        }

        const jsonData = JSON.stringify(passwords);
        const encrypted = await encryptWithPublicKey(keyManager.publicKey, jsonData);
        if (!encrypted) throw new Error("Erreur de chiffrement.");
        exportData = encrypted;
        fileName += '.enc';
      } else if (format === 'csv') {
        const headers = ['id', 'title', 'username', 'password', 'url', 'categoryId'];
        const csvRows = [headers.join(',')];
        for (const entry of passwords) {
          csvRows.push(
            [entry.id, entry.title, entry.username, entry.password, entry.url, entry.categoryId].map(val => `"${val}"`).join(',')
          );
        }
        exportData = csvRows.join('\n');
        fileName += '.csv';
      } else if (format === 'json') {
        exportData = JSON.stringify(passwords, null, 2);
        fileName += '.json';
      }

      if (exportData) {
        const blob = new Blob([exportData], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(link.href);

        toast({
          title: 'Exportation réussie',
          description: `Fichier ${fileName} généré avec succès.`
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        description: (error as Error).message || "Impossible d'exporter les mots de passe."
      });
    }
  };


  return (
    <MainLayout>
      <>
        <h1 className="text-3xl font-bold mb-6">Profile</h1>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details"><User className="mr-2 h-4 w-4" /> Details</TabsTrigger>
            <TabsTrigger value="edit"><Settings className="mr-2 h-4 w-4" /> Edit Profile</TabsTrigger>
            <TabsTrigger value="export"><FileText className="mr-2 h-4 w-4" /> Export</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className=''>
            <Card>
              <CardHeader>
                <CardTitle>Profile Details</CardTitle>
                <CardDescription>View your account information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="font-medium">Name</Label>
                    <div className="col-span-3">John Doe</div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="font-medium">Email</Label>
                    <div className="col-span-3">john.doe@example.com</div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="font-medium">Account Created</Label>
                    <div className="col-span-3">January 1, 2023</div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="font-medium">Last Login</Label>
                    <div className="col-span-3">Today at 9:30 AM</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="edit" className=''>
            <Card>
              <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
                <CardDescription>Update your account information</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Name</Label>
                    <Input id="name" defaultValue="John Doe" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">Email</Label>
                    <Input id="email" type="email" defaultValue="john.doe@example.com" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="current-password" className="text-right">Current Password</Label>
                    <Input id="current-password" type="password" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="new-password" className="text-right">New Password</Label>
                    <Input id="new-password" type="password" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="confirm-password" className="text-right">Confirm Password</Label>
                    <Input id="confirm-password" type="password" className="col-span-3" />
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="export">
            <Card>
              <CardHeader>
                <CardTitle>Export Passwords</CardTitle>
                <CardDescription>Securely export your stored passwords</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Export your passwords in an encrypted format. You'll need your master password to decrypt the exported file.
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className="w-full max-w-md">
                      <Label htmlFor="export-format">Format</Label>
                      <select
                        id="export-format"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      >
                        <option value="encrypted">Encrypted (.enc)</option>
                        <option value="csv">CSV (Unencrypted)</option>
                        <option value="json">JSON (Unencrypted)</option>
                      </select>
                    </div>
                  </div>
                  <Separator />
                  <div className="rounded-md bg-amber-50 p-4 border border-amber-200">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-amber-800">Warning</h3>
                        <div className="mt-2 text-sm text-amber-700">
                          <p>
                            Exporting in unencrypted formats poses a security risk. Only use these formats if you
                            understand the implications and will secure the exported file appropriately.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleExportPasswords}>
                  <FileText className="mr-2 h-4 w-4" />
                  Export Passwords
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </>
    </MainLayout>
  );
};

export default Profile;
