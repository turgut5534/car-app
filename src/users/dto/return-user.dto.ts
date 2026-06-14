export type AuthResponse = {
  user: {
    id: string;
    email: string;
    name: string | null;
    currency: string;
    distanceUnit: string;
    theme: string;
    language: string;
    isVerified: boolean;
  };
  accessToken: string;
};