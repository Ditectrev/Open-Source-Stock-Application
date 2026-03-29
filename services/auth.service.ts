/**
 * Authentication Service
 * Handles user authentication via Apple SSO, Google SSO, and Email OTP
 */

import { Account, OAuthProvider } from "node-appwrite";
import { createServerClient } from "@/lib/appwrite";

export interface AuthResult {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name?: string;
  };
  error?: string;
}

export class AuthenticationService {
  private account: Account;

  constructor() {
    const { account } = createServerClient();
    this.account = account;
  }

  /**
   * Initiate Apple SSO authentication
   */
  async signInWithApple(
    successUrl: string,
    failureUrl: string
  ): Promise<string> {
    try {
      const redirectUrl = await this.account.createOAuth2Token(
        OAuthProvider.Apple,
        successUrl,
        failureUrl
      );
      return redirectUrl;
    } catch (error) {
      throw new Error(
        `Apple SSO failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Initiate Google SSO authentication
   */
  async signInWithGoogle(
    successUrl: string,
    failureUrl: string
  ): Promise<string> {
    try {
      const redirectUrl = await this.account.createOAuth2Token(
        OAuthProvider.Google,
        successUrl,
        failureUrl
      );
      return redirectUrl;
    } catch (error) {
      throw new Error(
        `Google SSO failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Send email OTP for passwordless authentication
   */
  async signInWithEmail(email: string): Promise<void> {
    try {
      await this.account.createEmailToken("unique()", email);
    } catch (error) {
      throw new Error(
        `Email OTP failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Verify email OTP token
   */
  async verifyEmailOTP(userId: string, secret: string): Promise<AuthResult> {
    try {
      const session = await this.account.createSession(userId, secret);
      const user = await this.account.get();

      return {
        success: true,
        user: {
          id: user.$id,
          email: user.email,
          name: user.name,
        },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "OTP verification failed",
      };
    }
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<void> {
    try {
      await this.account.deleteSession("current");
    } catch (error) {
      throw new Error(
        `Sign out failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<AuthResult> {
    try {
      const user = await this.account.get();
      return {
        success: true,
        user: {
          id: user.$id,
          email: user.email,
          name: user.name,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: "No authenticated user",
      };
    }
  }
}
