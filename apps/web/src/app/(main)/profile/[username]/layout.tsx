import type { Metadata } from 'next';
import { getUserByUsername } from '@readixon/core';

export async function generateMetadata({ params }: { params: { username: string } }): Promise<Metadata> {
  const rawUsernameParam = typeof params.username === 'string' ? params.username : '';
  const decodedParam = decodeURIComponent(rawUsernameParam);
  const targetUsername = decodedParam.startsWith('@') ? decodedParam.slice(1) : decodedParam;
  
  if (!targetUsername) {
    return { title: 'Profil Bulunamadı - Readixon' };
  }

  try {
    const user = await getUserByUsername(targetUsername);
    if (!user) {
      return { title: 'Profil Bulunamadı - Readixon' };
    }

    return {
      title: `${user.displayName} (@${user.username}) | Readixon`,
      description: user.bio || `${user.displayName} adlı yazarın profilini ve hikayelerini keşfedin.`,
      openGraph: {
        title: `${user.displayName} (@${user.username}) | Readixon`,
        description: user.bio || `${user.displayName} adlı yazarın profilini ve hikayelerini keşfedin.`,
        images: user.avatarUrl ? [user.avatarUrl] : [],
        type: 'profile',
      },
    };
  } catch (error) {
    return { title: 'Readixon' };
  }
}

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
