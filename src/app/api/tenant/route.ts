import { NextResponse } from "next/server";
import { resolveCurrentTenant } from "@/lib/supabase/queries";

export async function GET() {
  const tenant = await resolveCurrentTenant();

  return NextResponse.json({
    userId: tenant.userId,
    email: tenant.email,
    tenantId: tenant.tenantId,
    tenantName: tenant.tenantName,
    isAuthenticated: tenant.isAuthenticated,
  });
}