import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "67d937e2f0883888391209f0", 
  requiresAuth: true // Ensure authentication is required for all operations
});
