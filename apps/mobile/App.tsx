import React from 'react'
import RootLayout from './app/_layout'

/**
 * Entry point for SuperProfes Mobile.
 * All routing and screen logic lives in app/_layout.tsx and its children.
 *
 * Note: expo-router is not yet in the dependency tree.
 * Navigation is handled via a lightweight custom useState-based navigator.
 * Migrate to expo-router when the dep is added (add 'expo-router' to package.json
 * and change "main" to "expo-router/entry" to activate file-based routing).
 */
export default function App(): JSX.Element {
  return <RootLayout />
}
