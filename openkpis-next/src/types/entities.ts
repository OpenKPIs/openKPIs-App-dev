export type EntityKind = 'kpi' | 'metric' | 'dimension' | 'event' | 'dashboard';

export type EntityStatus = 'draft' | 'published' | 'archived';

export interface BaseEntity {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  category?: string | null;
  tags?: string[] | null;
  status: EntityStatus;
  created_by?: string | null;
  created_at?: string | null;
  last_modified_by?: string | null;
  last_modified_at?: string | null;
}

export interface Kpi extends BaseEntity {
  formula?: string | null;
}

export interface Metric extends BaseEntity {
  formula?: string | null;
}

export type Dimension = BaseEntity;
export type EventEntity = BaseEntity;
export type Dashboard = BaseEntity;

export type AnyEntity = Kpi | Metric | Dimension | EventEntity | Dashboard;

export function tableFor(kind: EntityKind): string {
  switch (kind) {
    case 'kpi':
      return 'kpis';
    case 'metric':
      return 'metrics';
    case 'dimension':
      return 'dimensions';
    case 'event':
      return 'events';
    case 'dashboard':
      return 'dashboards';
  }
}

export function resolveTablePrefix(): string {
  const env = (process.env.NEXT_PUBLIC_APP_ENV || '').toLowerCase();
  if (env.startsWith('prod')) return 'prod_';
  if (env.startsWith('dev')) return 'dev_';
  return '';
}

/**
 * Logical application environment label used for shared tables like user_profiles.
 * We normalize everything to 'dev' or 'prod' so code can do simple equality checks.
 */
export function currentAppEnv(): 'dev' | 'prod' {
  const raw = (process.env.NEXT_PUBLIC_APP_ENV || '').toLowerCase();
  if (raw.startsWith('prod')) return 'prod';
  return 'dev';
}

export function sqlTableFor(kind: EntityKind): string {
  return `${resolveTablePrefix()}${tableFor(kind)}`;
}

/**
 * Get table name with environment prefix.
 * Special case: user_profiles always uses prod_user_profiles (shared across environments).
 */
export function withTablePrefix(table: string): string {
  // user_profiles is always prod_user_profiles (shared across dev/prod)
  if (table === 'user_profiles') {
    return 'prod_user_profiles';
  }
  return `${resolveTablePrefix()}${table}`;
}





