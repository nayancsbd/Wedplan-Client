import { createAuthClient } from "better-auth/react"
import { jwtClient, inferAdditionalFields } from "better-auth/client/plugins"

export const authClient = createAuthClient({
  baseURL:
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  plugins: [
    jwtClient(),
    inferAdditionalFields({
      user: {
        role: {
          type: "string",
          required: false,
        },
        isBlocked: {
          type: "boolean",
          required: false,
        },
        businessName: {
          type: "string",
          required: false,
        },
        subscriptionPlan: {
          type: "string",
          required: false,
        },
      },
    }),
  ],
})

export const { signIn, signUp, signOut, useSession } = authClient
