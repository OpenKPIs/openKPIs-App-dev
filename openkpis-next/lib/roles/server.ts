import { createClient } from '@/lib/supabase/server';
import { withTablePrefix } from '@/src/types/entities';

export type UserRole = 'admin' | 'editor' | 'contributor';

export async function getUserRoleServer(): Promise<UserRole> {
	const supabase = await createClient();
	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser();

	if (authError || !user) return 'contributor';

	const { data: profile } = await supabase
		.from(withTablePrefix('user_profiles'))
		.select('user_role, role, is_admin, is_editor')
		.eq('id', user.id)
		.maybeSingle();

	let role =
		(profile?.user_role ||
			profile?.role ||
			(user.user_metadata?.user_role as string | undefined) ||
			'contributor')?.toString().toLowerCase();

	if (!['editor', 'admin'].includes(role)) {
		if (profile?.is_admin) {
			role = 'admin';
		} else if (profile?.is_editor) {
			role = 'editor';
		}
	}

	if (role === 'admin') return 'admin';
	if (role === 'editor') return 'editor';
	return 'contributor';
}




