'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useDoc, supabase } from '@/supabase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoaderCircle, Mail, Calendar, Clock, Edit2, Check, X } from 'lucide-react';
import type { UserProfile } from '@/lib/types';
import { avatarOptions, type AvatarOption } from '@/lib/avatars';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Supabase: useDoc for user profile
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(
    'users',
    user?.id || null,
    !!user
  );

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const isLoading = isUserLoading || isProfileLoading;

  // Create user profile if it doesn't exist
  useEffect(() => {
    if (!isLoading && user && !userProfile) {
      const createProfile = async () => {
        try {
          const { error } = await supabase.from('users').insert({
            id: user.id,
            username: user.user_metadata?.username || null,
            email: user.email || null,
            total_study_time: 0,
            companion_clicks: 0,
          } as any);
          if (error && error.code !== '23505') { // Ignore duplicate key errors
            console.error('Error creating profile:', error);
          }
        } catch (error) {
          // Silently handle - profile might already exist
        }
      };
      createProfile();
    }
  }, [user, userProfile, isLoading]);

  if (isLoading || !user) {
    return <div className="flex-1 flex items-center justify-center"><LoaderCircle className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  // Get current avatar from user metadata
  const currentAvatarId = user.user_metadata?.avatar_id || 'adventurer';
  const currentAvatar = avatarOptions.find(av => av.id === currentAvatarId) || avatarOptions[0];

  // Show loading if profile is still being created
  if (!userProfile) {
    return <div className="flex-1 flex items-center justify-center"><LoaderCircle className="h-12 w-12 animate-spin text-primary" /></div>;
  }
  
  const formatStudyTime = (seconds: number = 0) => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
  }
  
  const memberSince = new Date(userProfile.created_at || new Date()).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
  });

  const displayName = userProfile.username || user?.user_metadata?.username || user?.email || 'Anonymous';
  const avatarFallback = displayName.charAt(0).toUpperCase();

  const handleAvatarSelect = (avatarId: string) => {
    setSelectedAvatar(avatarId);
  };

  const handleSaveAvatar = async () => {
    if (!user || !selectedAvatar) return;

    setIsSaving(true);
    try {
      const avatar = avatarOptions.find(av => av.id === selectedAvatar);
      if (!avatar) return;

      const avatarUrl = avatar.url(user.id);

      // Update user metadata in Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          avatar_id: selectedAvatar,
          avatar_url: avatarUrl,
        },
      });

      if (updateError) throw updateError;

      toast({
        title: "Avatar Updated!",
        description: "Your avatar has been successfully updated.",
      });

      setIsEditingAvatar(false);
      setSelectedAvatar(null);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update avatar. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingAvatar(false);
    setSelectedAvatar(null);
  };

  const getAvatarUrl = () => {
    if (user?.user_metadata?.avatar_url) {
      return user.user_metadata.avatar_url;
    }
    return currentAvatar.url(user?.id || 'default');
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader className="text-center">
            <div className="relative inline-block">
              <Avatar className="w-32 h-32 mx-auto mb-4 border-4 border-primary">
                <AvatarImage src={getAvatarUrl()} alt={displayName} />
                <AvatarFallback className="text-4xl">{avatarFallback}</AvatarFallback>
              </Avatar>
              <Button
                variant="outline"
                size="icon"
                className="absolute bottom-4 right-0 rounded-full"
                onClick={() => setIsEditingAvatar(!isEditingAvatar)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            </div>
            <CardTitle className="text-3xl font-bold">{displayName}</CardTitle>
            <CardDescription>Click the edit icon to change your avatar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-lg">
             <div className="flex items-center gap-4">
                <Mail className="w-6 h-6 text-primary" />
                <span className="text-muted-foreground">{userProfile.email}</span>
            </div>
             <div className="flex items-center gap-4">
                <Calendar className="w-6 h-6 text-primary" />
                <span className="text-muted-foreground">Member since {memberSince}</span>
            </div>
            <div className="flex items-center gap-4">
                <Clock className="w-6 h-6 text-primary" />
                <span className="text-muted-foreground">Total study time: <strong>{formatStudyTime(userProfile.total_study_time)}</strong></span>
            </div>
          </CardContent>
        </Card>

        {isEditingAvatar && (
          <Card>
            <CardHeader>
              <CardTitle>Choose Your Avatar</CardTitle>
              <CardDescription>Select an avatar style that represents you</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 mb-6">
                {avatarOptions.map((avatar) => {
                  const isSelected = selectedAvatar === avatar.id || (!selectedAvatar && currentAvatarId === avatar.id);
                  return (
                    <button
                      key={avatar.id}
                      onClick={() => handleAvatarSelect(avatar.id)}
                      className={cn(
                        "relative aspect-square rounded-lg border-2 transition-all hover:scale-105",
                        isSelected
                          ? "border-primary ring-2 ring-primary ring-offset-2"
                          : "border-muted hover:border-primary/50"
                      )}
                    >
                      <img
                        src={avatar.url(user?.id || 'default')}
                        alt={avatar.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      {isSelected && (
                        <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-1">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 rounded-b-lg text-center truncate">
                        {avatar.emoji} {avatar.name}
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveAvatar}
                  disabled={isSaving || !selectedAvatar || selectedAvatar === currentAvatarId}
                >
                  {isSaving ? (
                    <>
                      <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Save Avatar
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
