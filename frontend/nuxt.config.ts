export default defineNuxtConfig({
  devtools: { enabled: true },
  ssr: false,

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxtjs/color-mode',
  ],

  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
    configPath: 'tailwind.config.js',
    exposeConfig: false,
    viewer: true,
  },

  colorMode: {
    classSuffix: '',
  },

  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:4000',
      awsRegion: process.env.AWS_REGION || 'eu-south-2',
      cognitoUserPoolId: process.env.COGNITO_USER_POOL_ID || '',
      cognitoClientId: process.env.COGNITO_CLIENT_ID || '',
    },
  },

  vite: {
    optimizeDeps: {
      include: ['@aws-sdk/client-cognito-identity-provider'],
    },
  },
})
