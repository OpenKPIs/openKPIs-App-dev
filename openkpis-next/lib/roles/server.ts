import { createClient } from '@/lib/supabase/server';
import { withTablePrefix } from '@/src/types/entities';

export type UserRole = 'admin' | 'editor' | 'contributor';

export async function getUserRoleServer(): Promise<UserRole> {
	const supabase = await createClient();
	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser();

	if (authError || !user) {
		console.error('[getUserRoleServer] Auth error or no user:', authError?.message);
		return 'contributor';
	}

	const tableName = withTablePrefix('user_profiles');
	const { data: profile, error: profileError } = await supabase
		.from(tableName)
		.select('user_role, role, is_admin, is_editor')
		.eq('id', user.id)
		.maybeSingle();

	if (profileError) {
		console.error('[getUserRoleServer] Profile query error:', {
			userId: user.id,
			tableName,
			error: profileError.message,
			code: profileError.code,
			hint: profileError.hint,
		});
	}

	if (!profile) {
		console.warn('[getUserRoleServer] No profile found:', {
			userId: user.id,
			tableName,
		});
	}

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

	const finalRole = role === 'admin' ? 'admin' : role === 'editor' ? 'editor' : 'contributor';
	
	console.log('[getUserRoleServer] Role resolution:', {
		userId: user.id,
		profileExists: !!profile,
		profileUserRole: profile?.user_role,
		profileRole: profile?.role,
		profileIsAdmin: profile?.is_admin,
		profileIsEditor: profile?.is_editor,
		metadataRole: user.user_metadata?.user_role,
		resolvedRole: finalRole,
	});

	return finalRole;
}






	if (!['editor', 'admin'].includes(role)) {
		if (profile?.is_admin) {
			role = 'admin';
		} else if (profile?.is_editor) {
			role = 'editor';
		}
	}

	const finalRole = role === 'admin' ? 'admin' : role === 'editor' ? 'editor' : 'contributor';
	
	console.log('[getUserRoleServer] Role resolution:', {
		userId: user.id,
		profileExists: !!profile,
		profileUserRole: profile?.user_role,
		profileRole: profile?.role,
		profileIsAdmin: profile?.is_admin,
		profileIsEditor: profile?.is_editor,
		metadataRole: user.user_metadata?.user_role,
		resolvedRole: finalRole,
	});

	return finalRole;
}






	if (!['editor', 'admin'].includes(role)) {
		if (profile?.is_admin) {
			role = 'admin';
		} else if (profile?.is_editor) {
			role = 'editor';
		}
	}

	const finalRole = role === 'admin' ? 'admin' : role === 'editor' ? 'editor' : 'contributor';
	
	console.log('[getUserRoleServer] Role resolution:', {
		userId: user.id,
		profileExists: !!profile,
		profileUserRole: profile?.user_role,
		profileRole: profile?.role,
		profileIsAdmin: profile?.is_admin,
		profileIsEditor: profile?.is_editor,
		metadataRole: user.user_metadata?.user_role,
		resolvedRole: finalRole,
	});

	return finalRole;
}




