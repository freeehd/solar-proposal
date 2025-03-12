import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PostgresAdapter } from "./lib/auth/postgres-adapter"
import { getUserByEmail, verifyPassword } from "./lib/auth/auth-service"
import { z } from "zod"

// Validation schemas
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }).trim(),
  password: z.string().min(1, { message: "Password is required" }).trim(),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PostgresAdapter(),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    // Add these if you have custom error or signout pages
    // error: '/auth/error',
    // signOut: '/auth/signout',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
      }
      return session
    },
    // Add a redirect callback to control where users go after sign in
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl + "/"
    },
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Validate input
        const validatedFields = loginSchema.safeParse(credentials)
        if (!validatedFields.success) return null

        const { email, password } = validatedFields.data

        // Find user
        const user = await getUserByEmail(email)

        // Check if user exists and password is correct
        if (!user || !user.password) return null
        
        const passwordMatch = await verifyPassword(password, user.password)
        if (!passwordMatch) return null

        return {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          image: user.image,
        }
      },
    }),
  ],
})