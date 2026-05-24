import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { handleBackendError } from "@/lib/backend-error";

function normalizeSkillsArray(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    if (Array.isArray(obj.skills)) return obj.skills;
    if (Array.isArray(obj.data)) return obj.data;
  }
  if (typeof raw === "string") {
    try {
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  }
  return [];
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const headers = { Authorization: `Bearer ${token}` };
  const base = `${process.env.BACKEND_URL}/api/v1`;

  const [profileRes, skillsRes, questionnaireRes] = await Promise.allSettled([
    axios.get(`${base}/profile/`, { headers, timeout: 30_000 }),
    axios.get(`${base}/profile/skills`, { headers, timeout: 30_000 }),
    axios.get(`${base}/profile/questionnaire`, { headers, timeout: 30_000 }),
  ]);

  if (profileRes.status === "rejected") {
    const { message, status } = handleBackendError(profileRes.reason, "Failed to load profile");
    return NextResponse.json({ error: message }, { status });
  }

  const profile = profileRes.value.data as Record<string, unknown>;
  const skillsRaw = skillsRes.status === "fulfilled" ? skillsRes.value.data : [];
  const questionnaire = questionnaireRes.status === "fulfilled" ? questionnaireRes.value.data : null;

  // Normalize skills: backend may return array, wrapped object, or JSON string
  const embeddedSkills = normalizeSkillsArray(profile.skills_json);
  const endpointSkills = normalizeSkillsArray(skillsRaw);
  const skills_json = embeddedSkills.length > 0 ? embeddedSkills : endpointSkills;

  return NextResponse.json({
    ...profile,
    skills_json,
    questionnaire_json: profile.questionnaire_json ?? questionnaire,
  });
}
