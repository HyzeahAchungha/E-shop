// Only the public application key belongs in the mobile bundle.
export const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim();
export const hasClerkConfiguration = Boolean(clerkPublishableKey);
