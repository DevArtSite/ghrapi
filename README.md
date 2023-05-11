# ghrapi

Github rest api Deno module
I make it for my personel use, at this time it is not complete, but you can use it if you want.

## Usage

```ts
import { Ghrapi } from "https://deno.land/x/ghrapi/mod.ts";
const gh = new Ghrapi({
  entrypoint?: "your github api entrypoint", // by default is https://api.github.com
  token?: "your github token", // if you want to use private repo (you don't need to pass it if is a env var)
  orgs?: ["your orgs"], // if you want to use organisations repos
  me: "your github username"
});
```

## Methods

```ts
// Get all own repos
const repos = await gh.userRepos({}?: UserReposOptions);
// Get all own repos from an user
const repos = await gh.userRepos({
  username?: "username"
}?: UserReposOptions);
// Get all own repos from an organisation
const repos = await gh.orgRepos({
  org?: "org name"
}?: OrgReposOptions);
```

## Types Definitions

```ts
export type GithubApiOptions = {
  entrypoint?: string;
  token?: string;
  orgs?: string[];
  me: string;
}

export type OrgReposOptions = {
    type?: "all" | "public" | "private" | "forks" | "sources" | "member" | "internal";
    sort?: "created" | "updated" | "pushed" | "full_name";
    direction?: "asc" | "desc";
    per_page?: number;
    page?: number;
}

export type UserReposOptions = OrgReposOptions & {
    visibility?: "all" | "public" | "private",
    affiliation?: string,
    type?: "all" | "owner" | "public" | "private" | "member",
    since?: string,
    before?: string,
}
```

## Example

```ts
import { Ghrapi } from "https://deno.land/x/ghrapi/mod.ts";
const gh = new Ghrapi({
  token: "your github token", // if you want to use private repo (you don't need to pass it if is a env var)
  me: "your github username"
});

const repos = await gh.userRepos({
  options: {
    type: "all",
    sort: "created",
    direction: "asc",
    per_page: 1,
    page: 1
  }
});

console.log(repos);
```

## TODO

- [ ] Add more stuff

## License

```text
Apache License
```

## Support

```text
If you like my work, you can support me with a coffee
```

[![Buy Me A Coffee](https://media.giphy.com/media/o7RZbs4KAA6tvM4H6j/giphy.gif)](https://www.buymeacoffee.com/mnlaugh)
