/**
 * Apple OAuth is temporarily disabled until production launch.
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  return NextResponse.redirect(
    new URL("/?auth_error=sso_temporarily_disabled", request.url)
  );
}
