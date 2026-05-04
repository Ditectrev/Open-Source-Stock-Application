/**
 * CI helper: reads BASE_SHA..HEAD_SHA diff, asks Mistral for a review, posts or updates one PR comment.
 * Skips cleanly when MISTRAL_API_KEY is unset.
 */
import { spawnSync } from "node:child_process";

const MARKER = "<!-- mistral-pr-review-bot -->";
const MAX_DIFF_CHARS = 120_000;

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

function gitDiff(base: string, head: string): string {
  const result = spawnSync("git", ["diff", `${base}...${head}`], {
    encoding: "utf-8",
    maxBuffer: 10 * 1024 * 1024,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(
      `git diff failed: ${(result.stderr ?? "").trim() || result.status}`
    );
  }
  const out = result.stdout ?? "";
  return out.length > MAX_DIFF_CHARS
    ? `${out.slice(0, MAX_DIFF_CHARS)}\n\n…(diff truncated after ${MAX_DIFF_CHARS} chars)`
    : out;
}

async function mistralReview(
  diff: string,
  apiKey: string,
  model: string
): Promise<string> {
  const system = `You are a senior engineer reviewing a pull request. Be concise and actionable.
Focus on: correctness, edge cases, security, performance, and maintainability.
Use markdown with short sections. Do not repeat the entire diff. If the change looks fine, say so briefly.`;

  const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      max_tokens: 4096,
      messages: [
        { role: "system", content: system },
        {
          role: "user",
          content: `Review this unified git diff (PR).\n\n${diff}`,
        },
      ],
    }),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Mistral API ${res.status}: ${t.slice(0, 500)}`);
  }
  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("Mistral returned empty content");
  return text;
}

async function githubJson(
  token: string,
  path: string,
  init?: RequestInit
): Promise<unknown> {
  const res = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      Authorization: `Bearer ${token}`,
      ...(init?.headers as Record<string, string>),
    },
  });
  const text = await res.text();
  if (!res.ok)
    throw new Error(`GitHub API ${res.status} ${path}: ${text.slice(0, 400)}`);
  return text ? JSON.parse(text) : null;
}

async function upsertComment(
  token: string,
  owner: string,
  repo: string,
  issueNumber: number,
  body: string
): Promise<void> {
  const comments = (await githubJson(
    token,
    `/repos/${owner}/${repo}/issues/${issueNumber}/comments?per_page=100`
  )) as Array<{ id: number; body?: string }>;

  const existing = comments.find((c) => c.body?.includes(MARKER));
  const fullBody = `${MARKER}\n## Mistral code review\n\n${body}`;

  if (existing) {
    await githubJson(
      token,
      `/repos/${owner}/${repo}/issues/comments/${existing.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: fullBody }),
      }
    );
    return;
  }

  await githubJson(
    token,
    `/repos/${owner}/${repo}/issues/${issueNumber}/comments`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: fullBody }),
    }
  );
}

async function main(): Promise<void> {
  const apiKey = process.env.MISTRAL_API_KEY?.trim();
  if (!apiKey) {
    console.log("MISTRAL_API_KEY not set; skipping Mistral PR review.");
    return;
  }

  const token = required("GITHUB_TOKEN");
  const repository = required("REPOSITORY");
  const prNumber = Number(required("PR_NUMBER"));
  const baseSha = required("BASE_SHA");
  const headSha = required("HEAD_SHA");
  const model = (process.env.MISTRAL_MODEL || "codestral-latest").trim();

  const [owner, repo] = repository.split("/");
  if (!owner || !repo) throw new Error(`Invalid REPOSITORY: ${repository}`);

  const diff = gitDiff(baseSha, headSha);
  if (!diff.trim()) {
    console.log("Empty diff; skipping.");
    return;
  }

  const review = await mistralReview(diff, apiKey, model);
  await upsertComment(token, owner, repo, prNumber, review);
  console.log("Mistral PR review comment posted.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
