import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getDatabase, type Database } from 'firebase/database'

function requiredEnv(name: string): string {
  const v = import.meta.env[name] as string | undefined
  if (!v) throw new Error(`Missing env var: ${name}`)
  return v
}

let app: FirebaseApp | undefined
let db: Database | undefined

export function getFirebaseEnvStatus():
  | { ok: true }
  | { ok: false; missing: string[] } {
  const required = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_DATABASE_URL',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_APP_ID',
  ] as const

  const missing = required.filter((k) => !(import.meta.env[k] as string | undefined))
  return missing.length === 0 ? { ok: true } : { ok: false, missing }
}

export function getFirebaseApp(): FirebaseApp {
  if (app) return app

  app = initializeApp({
    apiKey: requiredEnv('VITE_FIREBASE_API_KEY'),
    authDomain: requiredEnv('VITE_FIREBASE_AUTH_DOMAIN'),
    databaseURL: requiredEnv('VITE_FIREBASE_DATABASE_URL'),
    projectId: requiredEnv('VITE_FIREBASE_PROJECT_ID'),
    appId: requiredEnv('VITE_FIREBASE_APP_ID'),
  })

  return app
}

export function getFirebaseDatabase(): Database {
  if (db) return db
  db = getDatabase(getFirebaseApp())
  return db
}

