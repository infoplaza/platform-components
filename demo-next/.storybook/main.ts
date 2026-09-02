import type { StorybookConfig } from '@storybook/nextjs-vite'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Resolve the absolute path of a package. Needed in Yarn PnP / workspaces.
 */
function getAbsolutePath(value: string) {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)))
}

const config: StorybookConfig = {
  stories: ['../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [getAbsolutePath('@storybook/addon-docs')],
  framework: getAbsolutePath('@storybook/nextjs-vite'),
  staticDirs: ['../public'],
  async viteFinal(config) {
    const { mergeConfig } = await import('vite')
    return mergeConfig(config, {
      resolve: {
        dedupe: ['react', 'react-dom'],
      },
    })
  },
}

export default config
