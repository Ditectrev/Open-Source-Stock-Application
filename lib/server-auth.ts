import { NextRequest } from "next/server";
import { createServerSessionClient } from "@/lib/appwrite";

export interface AuthenticatedUser {
  id: string;
  email: string;
  name?: string;
}

export async function getAuthenticatedUser(
  request: NextRequest
): Promise<AuthenticatedUser | null> {
  const sessionSecret = request.cookies.get("appwrite_session")?.value;
  if (!sessionSecret) return null;

  try {
    const { account } = createServerSessionClient(sessionSecret);
    const user = await account.get();
    return {
      id: user.$id,
      email: user.email,
      name: user.name || undefined,
    };
  } catch {
    return null;
  }
}
