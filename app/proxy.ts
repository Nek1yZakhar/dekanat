import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export interface UserSessionProfile {
  id: string;
  email: string;
  fullName: string;
  role: 'student' | 'staff';
  groupId?: string | null;
  faculty: string;
}

/**
 * Validates current session. Redirects to /login if not authenticated.
 */
export async function requireUserSession(): Promise<UserSessionProfile> {
  // If Supabase is in placeholder/offline mode, return safe fallback student
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
  ) {
    return {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'student1@dekanat.fake',
      fullName: 'Смирнов Алексей Владимирович',
      role: 'student',
      groupId: '00000000-0000-0000-0000-000000000010',
      faculty: 'Факультет прикладной цифровизации и анализа данных',
    };
  }

  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      redirect('/login');
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return {
      id: user.id,
      email: user.email || '',
      fullName: profile?.full_name || (user.user_metadata?.full_name as string) || 'Студент',
      role: (profile?.role as 'student' | 'staff') || (user.user_metadata?.role as 'student' | 'staff') || 'student',
      groupId: profile?.group_id,
      faculty: profile?.faculty || 'Факультет прикладной цифровизации',
    };
  } catch (err) {
    // If it's a redirect from Next.js, rethrow it
    if (err && typeof err === 'object' && 'digest' in err) {
      throw err;
    }
    redirect('/login');
  }
}

/**
 * Requires staff role. Redirects non-staff to /dashboard.
 */
export async function requireStaffSession(): Promise<UserSessionProfile> {
  const session = await requireUserSession();
  if (session.role !== 'staff') {
    redirect('/dashboard');
  }
  return session;
}
