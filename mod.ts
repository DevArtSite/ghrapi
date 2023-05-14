import type {
  OrgReposOptions,
  UserReposOptions,
  GhrapiOptions,
  Repo,
  RateLimit,
} from "./mod.d.ts";

export default class Ghrapi {
  ratelimitRemaining: number;
  rateLimitResetDate?: Date;
  entrypoint: string;
  #token?: string;
  orgs: string[];
  me: string;
  constructor({
    entrypoint = "https://api.github.com",
    token,
    orgs = [],
    me,
  }: GhrapiOptions) {
    this.ratelimitRemaining = 0;
    this.entrypoint = entrypoint;
    this.#token = token || Deno.env.get("GITHUB_TOKEN");
    this.orgs = orgs;
    this.me = me;

    if (!this.#token) throw new Error("No token provided");
  }

  url(path: string) {
    return new URL(`${this.entrypoint}${path}`);
  }

  // deno-lint-ignore no-explicit-any
  async get(url: URL | string, options = {}): Promise<any> {
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/vnd.github+json",
        Authorization: `token ${this.#token}`,
      },
      ...options,
    }); 
    if (!res.ok) throw new Error(`failed to fetch ${url}\n${res.status} ${res.statusText}`);
    this.ratelimitRemaining = Number(res.headers.get("x-ratelimit-remaining"));
    if (this.rateLimitResetDate === new Date(Number(res.headers.get("x-ratelimit-reset")) * 1000)) this.rateLimitResetDate = new Date(Number(res.headers.get("x-ratelimit-reset")) * 1000);
    if (this.ratelimitRemaining < 1) throw new Error(`rate limit exceeded`);
    return res.json();
  }

  urlSearchParams(options?: Record<string, number | string>): string {
    if (!options) return "";
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(options)) {
      params.set(key, String(value));
    }
    return `?${params.toString()}`;
  }

  // deno-lint-ignore no-explicit-any
  parseRepo(repo: Record<string, any>): Repo {
    for (const [key, value] of Object.entries(repo)) {
      if (key.search("_at") !== -1) repo[key] = new Date(value);
      else if (
        (key === "owner" && typeof value === "object") ||
        (key === "license" && typeof value === "object" && value !== null)
      ) repo[key] = this.parseRepo(value);
    }
    return (repo as Repo);
  }

  async rateLimit(): Promise<RateLimit> {
    const res = await this.get(this.url("/rate_limit"));
    return res;
  }

  async userRepos(options?: {
    username?: string,
    options?: UserReposOptions,
  }): Promise<Repo[]> {
    let _repos = [];
    const repos: Repo[] = [];
    const params = this.urlSearchParams(options?.options);
    if (!options?.username) _repos = await this.get(this.url(`/user/repos${params}`));
    else _repos = await this.get(this.url(`/users/${options.username}/repos${params}`));
    for (const repo of _repos) repos.push(this.parseRepo(repo));
    return repos;
  }

  async orgRepos({
    org,
    options = {},
  }: {
    org?: string,
    options?: OrgReposOptions,
  }): Promise<Repo[]> {
    let _repos = [];
    const repos: Repo[] = [];
    const params = this.urlSearchParams(options);
    if (!org) _repos = await this.get(this.url(`/user/repos${params}`));
    else _repos = await this.get(this.url(`/orgs/${org}/repos${params}`));
    for (const repo of _repos) repos.push(this.parseRepo(repo));
    return repos;
  }

  // deno-lint-ignore no-explicit-any
  async hooks({ username = this.me, repo }: { username?: string, repo: string }): Promise<any> {
    const hooks: Record<string, string> = {};
    const _hooks = await this.get(this.url(`/repos/${username}/${repo}/hooks`));
    console.log(_hooks);
    return hooks;
  }
}