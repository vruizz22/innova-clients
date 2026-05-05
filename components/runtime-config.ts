export type PublicRuntimeConfig = {
  apiUrl: string
  landingUrl: string
  practiceUrl: string
  teacherUrl: string
  parentUrl: string
  studentId: string
}

const PROD_CONFIG = {
  apiUrl: 'https://api.superprofes.app',
  landingUrl: 'https://superprofes.app',
  practiceUrl: 'https://practice.superprofes.app',
  teacherUrl: 'https://profe.superprofes.app',
  parentUrl: 'https://superprofes.app',
} as const

const LOCAL_CONFIG = {
  apiUrl: 'http://localhost:3000',
  landingUrl: 'http://localhost:3004',
  practiceUrl: 'http://localhost:3002',
  teacherUrl: 'http://localhost:3001',
  parentUrl: 'http://localhost:8081',
  studentId: 'seed-student-001',
} as const

function requiredPublicEnv(name: string, fallback?: string): string {
  const value = process.env[name]
  if (value && value.trim().length > 0) return value.trim()
  if (fallback) return fallback
  throw new Error(`${name} is required`)
}

export function getPublicRuntimeConfig(): PublicRuntimeConfig {
  const isProd = process.env.NODE_ENV === 'production'
  const defaults = isProd ? PROD_CONFIG : LOCAL_CONFIG

  return {
    apiUrl: requiredPublicEnv('NEXT_PUBLIC_API_URL', defaults.apiUrl),
    landingUrl: requiredPublicEnv('NEXT_PUBLIC_LANDING_URL', defaults.landingUrl),
    practiceUrl: requiredPublicEnv('NEXT_PUBLIC_PRACTICE_URL', defaults.practiceUrl),
    teacherUrl: requiredPublicEnv('NEXT_PUBLIC_TEACHER_URL', defaults.teacherUrl),
    parentUrl: requiredPublicEnv('NEXT_PUBLIC_PARENT_URL', defaults.parentUrl),
    studentId: requiredPublicEnv('NEXT_PUBLIC_STUDENT_ID', LOCAL_CONFIG.studentId),
  }
}
