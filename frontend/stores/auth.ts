import { defineStore } from 'pinia'

interface User {
    id: string
    username: string
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
        user: null as User | null,
        token: null as string | null,
        loading: false,
  }),  
  getters: {
        isAuthenticated: (state) => !!state.user,
  },
  actions: {
    init() {
        if (process.client) {
            const user = localStorage.getItem('auth_user')
            const token = localStorage.getItem('auth_token')

            if (user && token) {
                this.user = JSON.parse(user)
                this.token = token
            }
        }
    },
    
    async register(username: string, password: string) {
        this.loading = true

        try {
            const { $api } = useNuxtApp()
            const response = await $api<{ message: string; userId: string }>('/register', {
                method: 'POST',
                body: { username, password }
            })
            
            return response
        } catch (error) {
            console.error('Register error:', error)
            throw error
        } finally {
            this.loading = false
        }
    },    
    async login(username: string, password: string) {
      this.loading = true

        try {
            const { $api } = useNuxtApp()

            const response = await $api<{ user: User; token: string }>('/login', {
                method: 'POST',
                body: { username, password }
            })

            this.user = response.user
            this.token = response.token

            if (process.client) {
                localStorage.setItem('auth_user', JSON.stringify(response.user))
                localStorage.setItem('auth_token', response.token)
            }

            return response
        } catch (error) {
            console.error('Login API error:', error)
            throw error
        } finally {
            this.loading = false
        }
    },    
    logout() {
        this.user = null
        this.token = null
      
        if (process.client) {
            localStorage.removeItem('auth_user')
            localStorage.removeItem('auth_token')
        }
    }
  }
})
