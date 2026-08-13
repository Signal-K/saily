import { defineConfig } from "cypress";
import { clerkSetup } from "@clerk/testing/cypress";
import { createClerkClient } from "@clerk/backend";
import { config as loadEnv } from "dotenv";

// cypress.config.ts runs in a plain Node process -- Next.js's own .env.local
// loading doesn't apply here, so load it explicitly for
// NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY/CLERK_SECRET_KEY below. clerkSetup()
// below also does this internally, but the Backend API tasks need it too.
loadEnv({ path: ".env.local" });

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: "cypress/support/e2e.ts",
    video: false,
    screenshotOnRunFailure: true,
    async setupNodeEvents(on, config) {
      // Fetches a Clerk testing token once per run so cy.clerkSignIn (see
      // support/commands.ts, KES-190) can drive the real Star Sailors Clerk
      // test instance without hitting bot-detection, mirroring Atlas's
      // Playwright global.setup.ts (KES-189).
      config = await clerkSetup({ config });

      // Node-side tasks: creating/deleting real Clerk test users needs the
      // secret key, which can't be used from the browser-sandboxed test
      // context cy.* commands run in.
      const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
      on("task", {
        async createClerkTestUser({ email, password }: { email: string; password: string }) {
          const user = await clerkClient.users.createUser({
            emailAddress: [email],
            password,
            skipPasswordChecks: true,
          });
          return { id: user.id };
        },
        async deleteClerkTestUser({ id, email }: { id?: string; email?: string }) {
          let userId = id;
          if (!userId && email) {
            const { data } = await clerkClient.users.getUserList({ emailAddress: [email] });
            userId = data[0]?.id;
          }
          if (userId) await clerkClient.users.deleteUser(userId);
          return null;
        },
      });

      return config;
    },
  },
  retries: {
    runMode: 1,
    openMode: 0,
  },
  viewportWidth: 1440,
  viewportHeight: 900,
});
