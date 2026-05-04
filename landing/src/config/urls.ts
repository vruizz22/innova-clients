const PROD_URLS = {
  landing: 'https://superprofes.app',
  practice: 'https://practice.superprofes.app',
  teacher: 'https://profe.superprofes.app',
  parent: 'https://superprofes.app',
} as const;

function publicUrl(name: string, fallback: string): string {
  const value = import.meta.env[name];
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : fallback;
}

export const landingUrl = publicUrl('PUBLIC_LANDING_URL', PROD_URLS.landing);
export const practiceUrl = publicUrl('PUBLIC_PRACTICE_URL', PROD_URLS.practice);
export const teacherUrl = publicUrl('PUBLIC_TEACHER_URL', PROD_URLS.teacher);
export const parentUrl = publicUrl('PUBLIC_PARENT_URL', PROD_URLS.parent);

export const registerUrl = `${practiceUrl.replace(/\/$/, '')}/register`;
export const loginUrl = `${practiceUrl.replace(/\/$/, '')}/login`;
export const teacherLoginUrl = `${teacherUrl.replace(/\/$/, '')}/login`;
export const parentLoginUrl = `${parentUrl.replace(/\/$/, '')}/login`;

