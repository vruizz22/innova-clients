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
      projectId: 'e1d3ad8c-12b6-4ea9-a1ad-087905c14295',
    },
  },
};

export default config;
