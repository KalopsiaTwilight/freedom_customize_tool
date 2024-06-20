import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { PublisherGithub } from "@electron-forge/publisher-github"
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives';
import { WebpackPlugin } from '@electron-forge/plugin-webpack';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';

import { mainConfig } from './webpack.main.config';
import { rendererConfig } from './webpack.renderer.config';

const config: ForgeConfig = {
  packagerConfig: {
    icon: "./app_icon.ico",
    asar: true,
    extraResource: [
      "./.webpack/x64/main/express_app.js",
      "./src/packaged/app.db",
      "../WDBXEditor2/publish/DBXPatchTool.exe"
    ]
  },
  rebuildConfig: {},
  makers: [new MakerSquirrel({
    setupIcon: "./app_icon.ico",
    certificateFile: "../signing.pfx",
    certificatePassword: process.env.FREEDOM_SIGNING_CERTIFICATE_PASSWORD
  })],
  publishers: [
    new PublisherGithub({
      repository: {
        owner: 'KalopsiaTwilight',
        name: 'freedom_customize_tool'
      }
    })
  ],
  plugins: [
    new AutoUnpackNativesPlugin({}),
    new WebpackPlugin({
      mainConfig,
      port: 8249,
      devContentSecurityPolicy: `default-src 'self' 'unsafe-inline' data: blob:; script-src 'self' 'unsafe-eval' 'unsafe-inline' data:; connect-src http://localhost:8249 ws://localhost:8249; style-src-elem http://wow.zamimg.com 'unsafe-inline'; img-src 'self' blob: data:;`,
      renderer: {
        config: rendererConfig,
        entryPoints: [
          {
            html: './src/index.html',
            js: './src/renderer.ts',
            name: 'main_window',
            preload: {
              js: './src/preload.ts',
            },
          }
        ],
      },
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

export default config;
