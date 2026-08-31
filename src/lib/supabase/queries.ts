import { createServerSupabaseClient } from "@/lib/supabase/server";

export type ResolvedTenant = {
  userId: string | null;
  email: string | null;
  tenantId: string | null;
  tenantName: string | null;
  isAuthenticated: boolean;
};

export type TenantInsight = {
  insightId: string;
  headline: string;
  executiveSummary: string;
};

export async function resolveCurrentTenant(): Promise<ResolvedTenant> {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      userId: null,
      email: null,
      tenantId: null,
      tenantName: null,
      isAuthenticated: false,
    };
  }

  const { data: appUser, error: appUserError } = await supabase
    .from("app_users")
    .select("app_user_id, email, primary_tenant_id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (appUserError) {
    throw new Error(appUserError.message);
  }

  const tenantId = appUser?.primary_tenant_id ?? null;
  const { data: tenant, error: tenantError } = tenantId
    ? await supabase.from("tenants").select("tenant_id, display_name").eq("tenant_id", tenantId).maybeSingle()
    : { data: null, error: null };

  if (tenantError) {
    throw new Error(tenantError.message);
  }

  return {
    userId: appUser?.app_user_id ?? user.id ?? null,
    email: appUser?.email ?? user.email ?? null,
    tenantId,
    tenantName: tenant?.display_name ?? null,
    isAuthenticated: true,
  };
}

export async function getTenantOverviewSnapshot() {
  const tenant = await resolveCurrentTenant();

  if (!tenant.isAuthenticated || !tenant.tenantId) {
    return {
      tenantId: null,
      tenantName: null,
      employeeCount: 0,
      totalCompensation: 0,
      averageCompaRatio: null,
      insights: [],
      isAuthenticated: false,
    };
  }

  const supabase = await createServerSupabaseClient();

  const [
    { count: employeeCount, error: employeeError },
    { data: compRows, error: compensationError },
    { data: employeeRows, error: employeesError },
    { data: roleRows, error: rolesError },
    { data: benchmarkRows, error: benchmarksError },
    { data: insights, error: insightsError },
  ] = await Promise.all([
    supabase
      .from("employees")
      .select("employee_id, title", { count: "exact" })
      .eq("tenant_id", tenant.tenantId),
    supabase
      .from("compensation_records")
      .select("employee_id, base_salary_cents, effective_date")
      .eq("tenant_id", tenant.tenantId),
    supabase
      .from("employees")
      .select("employee_id, title")
      .eq("tenant_id", tenant.tenantId),
    supabase
      .from("role_taxonomy")
      .select("role_id, compifi_role_name"),
    supabase
      .from("market_benchmarks")
      .select("role_id, p50_cents")
      .eq("tenant_id", tenant.tenantId)
      .eq("is_current", true),
    supabase
      .from("quarterly_insights")
      .select("insight_id, headline, executive_summary")
      .eq("tenant_id", tenant.tenantId)
      .eq("quarter", "Q3 2026")
      .eq("status", "published")
      .order("insight_id"),
  ]);

  if (employeeError) {
    throw new Error(employeeError.message);
  }

  if (compensationError) {
    throw new Error(compensationError.message);
  }

  if (employeesError) {
    throw new Error(employeesError.message);
  }

  if (rolesError) {
    throw new Error(rolesError.message);
  }

  if (benchmarksError) {
    throw new Error(benchmarksError.message);
  }

  if (insightsError) {
    throw new Error(insightsError.message);
  }

  const totalCompensation = (compRows ?? []).reduce((sum, row) => {
    const value = Number(row.base_salary_cents ?? 0) / 100;
    return Number.isFinite(value) ? sum + value : sum;
  }, 0);

  const employeeTitleById = new Map(
    (employeeRows ?? []).map((row) => [row.employee_id, row.title]),
  );
  const roleIdByTitle = new Map(
    (roleRows ?? []).map((row) => [row.compifi_role_name, row.role_id]),
  );
  const p50ByRoleId = new Map(
    (benchmarkRows ?? []).map((row) => [row.role_id, Number(row.p50_cents)]),
  );

  const compaRatios = (compRows ?? []).flatMap((compensation) => {
    const roleId = roleIdByTitle.get(employeeTitleById.get(compensation.employee_id));
    const p50Cents = p50ByRoleId.get(roleId);
    if (!p50Cents || !Number.isFinite(p50Cents) || p50Cents <= 0) {
      return [];
    }

    return [(Number(compensation.base_salary_cents ?? 0) / p50Cents) * 100];
  });

  const averageCompaRatio = compaRatios.length
    ? compaRatios.reduce((sum, ratio) => sum + ratio, 0) / compaRatios.length
    : null;

  return {
    tenantId: tenant.tenantId,
    tenantName: tenant.tenantName,
    employeeCount: employeeCount ?? 0,
    totalCompensation,
    averageCompaRatio,
    insights: (insights ?? []).map((insight) => ({
      insightId: insight.insight_id,
      headline: insight.headline,
      executiveSummary: insight.executive_summary,
    })),
    isAuthenticated: true,
  };
}

export function formatCurrencyCompact(value: number) {
  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    return `$${millions.toFixed(1).replace(/\.0$/, "")}M`;
  }

  if (value >= 1_000) {
    const thousands = value / 1_000;
    return `$${thousands.toFixed(1).replace(/\.0$/, "")}K`;
  }

  return `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}
