import type { ExpoConfig } from '@expo/config-types';

const config: ExpoConfig = {
  name: 'SuperProfes Mobile',
  slug: 'superprofes-mobile',
  version: '1.0.0',
  platforms: ['ios', 'android', 'web'],
  assetBundlePatterns: ['**/*'],
  scheme: 'superprofes',
  web: {
    favicon: './public/favicon.png',
  },
  extra: {
    eas: {
      projectId: 'REPLACE_WITH_EAS_PROJECT_ID',
    },
  },
};

export default config;
