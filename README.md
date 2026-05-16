
# @cgarciagarcia/react-query-builder

A TypeScript React hook that builds query strings compatible with [spatie/laravel-query-builder](https://github.com/spatie/laravel-query-builder).

[![Coverage Status](https://coveralls.io/repos/github/cgarciagarcia/react-query-builder/badge.svg?branch=main&service=github&kill_cache=1)](https://coveralls.io/github/cgarciagarcia/react-query-builder?branch=main)
[![Test CI](https://github.com/cgarciagarcia/react-query-builder/actions/workflows/test.yml/badge.svg)](https://github.com/cgarciagarcia/react-query-builder/actions/workflows/test.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-brightgreen.svg)](https://opensource.org/licenses/MIT)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/1f3f48abc84f4e3cba76e39e804786d6)](https://app.codacy.com/gh/cgarciagarcia/react-query-builder/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)
[![Downloads](https://img.shields.io/npm/d18m/@cgarciagarcia/react-query-builder?style=flat-square)](https://www.npmjs.com/package/@cgarciagarcia/react-query-builder)

---

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [API Reference](#api-reference)
  - [Filters](#filters)
  - [Fields](#fields)
  - [Sorts](#sorts)
  - [Includes](#includes)
  - [Params](#params)
  - [Pagination](#pagination)
  - [Utilities](#utilities)
- [Advanced: Conflicting Filters](#advanced-conflicting-filters)
- [Hydrating from URL](#hydrating-from-url)
- [Support](#support)
- [License](#license)

---

## Installation

```bash
# npm
npm install @cgarciagarcia/react-query-builder

# yarn
yarn add @cgarciagarcia/react-query-builder

# pnpm
pnpm add @cgarciagarcia/react-query-builder
```

**Peer dependencies:** React 17, 18, or 19.

---

## Quick Start

```ts
import { useQueryBuilder } from "@cgarciagarcia/react-query-builder";

const builder = useQueryBuilder()

builder
  .fields('user.name', 'user.last_name')
  .filter('age', 18)
  .filter('salary', '>', 1000)
  .sort('created_at')
  .sort('age', 'desc')
  .include('posts', 'comments')
  .setParam('external_param', 123)
  .page(1)
  .limit(10)

// Use in fetch
fetch("https://myapi.com/api/users" + builder.build())

// builder.build() returns:
// ?fields[user]=name,last_name&filter[age]=18&filter[salary][gt]=1000&sort=created_at,-age&includes=posts,comments&external_param=123&page=1&limit=10
```

---

## Configuration

Pass an optional config object to `useQueryBuilder` to set initial state and customize behavior.

```ts
const builder = useQueryBuilder({
  // Map frontend field names to backend names
  aliases: {
    "frontend_name": "backend_name",
  },

  // Pre-set initial state
  filters: [],
  includes: [],
  sorts: [],
  fields: [],
  params: {},

  // Define mutually exclusive filters (see Advanced section)
  pruneConflictingFilters: {},

  // Custom delimiters (default: ',')
  delimiters: {
    global: ',',    // applies to all unless overridden
    fields: null,
    filters: null,
    sorts: null,
    includes: null,
    params: null,
  },

  // Prepend '?' to the output of build()
  useQuestionMark: false,

  // Initial pagination state
  pagination: {
    page: 1,
    limit: 10,
  },
})
```

---

## API Reference

All methods return the builder instance, so they are **chainable**.

### Filters

```ts
// Add a filter (appends values by default)
builder.filter('status', 'active')

// Add a filter with an operator
builder.filter('salary', '>', 1000)
builder.filter('age', '>=', 18)

// Override existing filter values instead of appending
builder.filter('status', 'inactive', true)

// Remove specific filters
builder.removeFilter('status', 'age')

// Remove all filters
builder.clearFilters()

// Check if filters exist
builder.hasFilter('status')           // → boolean
builder.hasFilter('status', 'age')    // → true only if ALL exist
```

Available operators: `=`, `<`, `>`, `<=`, `>=`, `<>`

You can also import `FilterOperator` for type-safe operators:

```ts
import { FilterOperator } from "@cgarciagarcia/react-query-builder"

builder.filter('salary', FilterOperator.GreaterThan, 1000)
```

---

### Fields

```ts
builder.fields('name', 'email', 'user.avatar')
builder.removeField('email')
builder.clearFields()
builder.hasField('name')   // → boolean
```

---

### Sorts

```ts
builder.sort('created_at')           // default: asc
builder.sort('age', 'desc')
builder.removeSort('created_at', 'age')
builder.clearSorts()
builder.hasSort('created_at')        // → boolean
```

---

### Includes

```ts
builder.include('posts', 'comments')
builder.removeInclude('posts')
builder.clearIncludes()
builder.hasInclude('posts')          // → boolean
```

---

### Params

```ts
builder.setParam('custom_key', 'value')
builder.setParam('ids', [1, 2, 3])
builder.removeParam('custom_key')
builder.clearParams()
builder.hasParam('custom_key')       // → boolean
```

---

### Pagination

```ts
const builder = useQueryBuilder({
  pagination: { page: 1, limit: 10 }
})

builder.page(3)           // go to page 3
builder.nextPage()        // page + 1
builder.previousPage()    // page - 1 (stops at 1)
builder.limit(25)         // change page size

builder.getCurrentPage()  // → number | undefined
builder.getLimit()        // → number | undefined
```

> **Note:** Changing filters, removing filters, or changing the limit automatically resets to page 1.

---

### Utilities

#### `build()`

Returns the final query string.

```ts
builder.build() // → "?filter[age]=18&sort=created_at"
```

#### `toArray()`

Returns the query state as a flat string array. Useful as a React Query `queryKey`.

```ts
import { useQuery } from "@tanstack/react-query"

const builder = useQueryBuilder()

const { data } = useQuery({
  queryFn: () => getUsers(builder.build()),
  queryKey: ['users', ...builder.toArray()],
})
```

#### `tap(callback)`

Inspect the internal state without interrupting the chain.

```ts
builder
  .filter('age', 18)
  .tap((state) => console.log(state))
  .sort('name')
```

#### `when(condition, callback)`

Conditionally execute a callback based on a boolean. The builder is returned regardless.

```ts
builder.when(isAdmin, (state) => {
  console.log('Admin state:', state)
})
```

---

## Advanced: Conflicting Filters

Some filters are mutually exclusive in your backend (e.g. `date` vs `between_dates`). Use `pruneConflictingFilters` to let the library handle this automatically.

```ts
const builder = useQueryBuilder({
  pruneConflictingFilters: {
    date: ['between_dates'],
    // 'between_dates': ['date'] is added automatically (bidirectional)
  },
})

builder.filter('date', '2024-08-13')
// → ?filter[date]=2024-08-13

builder.filter('between_dates', ['2024-08-06', '2024-08-13'])
// → ?filter[between_dates]=2024-08-06,2024-08-13
// (date filter was automatically removed)
```

The conflict is **bidirectional by default** — you only need to declare it once. You can also declare both directions explicitly if you prefer.

---

## Hydrating from URL

Say you have a list view with filters, sorts and pagination. A user picks "status = active", sorts by date, opens page 3 — and shares the link with a teammate. You want that link to open with the exact same filters already applied.

That's what an **adapter** does: it bridges the builder to an external source (URL, `localStorage`, anything you want). The built-in `createSearchParamsAdapter` handles the URL case.

### The 30-second example

```ts
import {
  useQueryBuilder,
  createSearchParamsAdapter,
} from "@cgarciagarcia/react-query-builder";

const builder = useQueryBuilder({
  adapter: createSearchParamsAdapter({ sync: true }),
});

builder.filter("status", "active").sort("created_at", "desc");
// URL bar is now: /?filter[status]=active&sort=-created_at
```

Refresh the page, share the link — the filters come back. That's it.

What just happened:
- On mount, the adapter **reads** the current URL and seeds the builder.
- `sync: true` makes the adapter **write** back on every change (`history.replaceState`).
- The URL output mirrors what `.build()` produces, so your backend and your URL bar agree.

### Read-only hydration (no URL writes)

If you only want to hydrate at mount and never touch the URL after, just leave `sync` out:

```ts
useQueryBuilder({
  adapter: createSearchParamsAdapter(),
});
```

Now `read()` runs once when the hook mounts — same semantics as `useState(() => …)` — and that's the end of it. URL changes after mount don't re-hydrate.

### Customising the writer

`sync` accepts three forms depending on how aggressive you want the URL updates to be:

```ts
// 1) Default behavior: replaceState (no extra browser history entries)
createSearchParamsAdapter({ sync: true });           // alias for "replace"

// 2) pushState (every change is a back-button step)
createSearchParamsAdapter({ sync: "push" });

// 3) Bring your own — useful for Next.js / React Router / debouncing
createSearchParamsAdapter({
  sync: (search) => router.replace({ search }),
});
```

Don't worry about other apps' query params — the writer **preserves anything it doesn't recognise**. So `?utm_source=newsletter` or `?theme=dark` stays untouched while your filters get added, updated, or cleared.

### Aliases: keep your frontend names, ship backend names

You probably name things one way in the UI (`userName`, `createdAt`) and another in the API (`name`, `created_at`). Pass `aliases` to the builder and the adapter handles the translation in **both directions** automatically:

```ts
useQueryBuilder({
  aliases: { userName: "name", createdAt: "created_at" },
  adapter: createSearchParamsAdapter({ sync: true }),
});

// Your code keeps using frontend names:
builder.filter("userName", "Jane").sort("createdAt", "desc");

// The URL bar shows backend names (same as .build() would emit):
// /?filter[name]=Jane&sort=-created_at

// On refresh, ?filter[name]=Jane hydrates back as { userName: "Jane" }.
```

The adapter automatically reads aliases from the builder config, so you only declare them once.

### Renaming the URL keys

Sometimes the default URL is verbose:

```
?filter[status]=active&filter[role]=admin&sort=-created_at&include=author,tags&fields[user]=id,name
```

That's a mouthful — long enough to overflow in chat previews, ugly to share, and harder to scan. Remap the keys to shorten it:

```ts
createSearchParamsAdapter({
  keys: { filter: "filt", sort: "srt", include: "inc", fields: "fld" },
  sync: true,
});
```

Now the same state produces:

```
?filt[status]=active&filt[role]=admin&srt=-created_at&inc=author,tags&fld[user]=id,name
```

Why you might want this:

- **Shorter, more shareable links** — saves bytes per param, big difference when you have many filters.
- **Cleaner URL bar** — easier on the eye for users and for screenshots in support tickets.
- **Brand or domain language** — your app says "query", not "filter"? Match the vocabulary your users already know.
- **Avoiding collisions** — if the surrounding app already uses `?filter=...` or `?sort=...` for something else, rename to coexist.

Both reader and writer use the new keys, so round-trips still work. This **only** affects the URL bar — `.build()` (what you pass to `fetch`) keeps using the canonical `filter`/`sort`/… names your backend expects.

### Locking down which keys can come from the URL

The URL is user input. Without limits, a crafted link like `?filter[is_admin]=true` would flow straight into your `.build()` call and out to your backend. You have two primitives, **per bucket**, and you pick the one that matches your situation:

#### `allowed` — strict allowlist ("only these")

Use it when you have a short, explicit list of what's legitimate:

```ts
createSearchParamsAdapter({
  allowed: {
    filters: ["status", "role", "created_at"],
    sorts:   ["created_at", "name"],
    params:  ["locale", "tenant"],   // anything not here is dropped
  },
});
```

Defaults when you omit a bucket:
- `filters` / `sorts` / `includes` / `fields` → allow everything (so the URL can drive filtering freely)
- `params` → allow nothing (the catch-all is deny-by-default — params are arbitrary, so you must opt-in by listing them)

#### `excludeKeys` — targeted denylist ("everything except these")

Use it when you trust the bucket in general but want to block a handful of dangerous names — without enumerating everything legitimate:

```ts
createSearchParamsAdapter({
  // No allowed.filters → I accept any filter from the URL.
  // I have 47 legitimate filter attributes and I add more every month;
  // maintaining a full whitelist is brittle. But is_admin and password
  // must NEVER come through the URL.
  excludeKeys: {
    filters: ["is_admin", "password"],
  },
});
```

#### Which one should I use?

| Situation | Use |
|---|---|
| "Short, explicit list of what's allowed" | `allowed` |
| "Accept everything, except these few" | `excludeKeys` |
| "Whitelist plus a moving denylist on top" | both (defense in depth) |

If you set `allowed.filters: ["status", "role"]`, listing `is_admin` in `excludeKeys.filters` is **redundant** — it's already dropped because it's not allowed. It doesn't break anything (and reads as documentation of intent), but it's not pulling weight in runtime. The combination is useful when you keep a stable allowlist and want a separate, fast-changing denylist on top.

#### Details that apply to both

- Both apply to the **reader and the writer** symmetrically — the URL bar is always inside your policy.
- `excludeKeys` always wins over `allowed` (deny beats allow).
- Matching happens on the **raw URL name (backend)** before reverse-aliasing — that's the threat surface.
- For `fields`, you can match by short prop (`password`) or by `entity.prop` (`user.password`). Pick the precision you need.
- `page` and `limit` are **not** auto-hydrated. If you want them on the URL, add them to `allowed.params` and treat them as raw params.
- **Why per bucket?** `password` is dangerous as a filter but fine as a `fields` selection (it's just picking which column the API returns). One flat list would force you into all-or-nothing.

### Want a different source? Write your own adapter

`QueryBuilderAdapter` is just `{ read, write? }`. Wrap anything:

```ts
// Persist to localStorage instead of the URL
const localStorageAdapter: QueryBuilderAdapter = {
  read:  () => JSON.parse(localStorage.getItem("filters") ?? "{}"),
  write: (state) => localStorage.setItem("filters", JSON.stringify(state)),
};

useQueryBuilder({ adapter: localStorageAdapter });
```

Same pattern works for `react-router` search params, hash routers, in-memory stores, IndexedDB — anything you can read from and write to.

### Going lower-level

If you only want the URL parser without the hook integration, both pieces are exported as pure functions:

```ts
import {
  parseSearchParams,
  serializeSearchParams,
} from "@cgarciagarcia/react-query-builder";

// URL → state
parseSearchParams("?filter[status]=active&sort=-name");
// → { filters: [...], sorts: [{ attribute: "name", direction: "desc" }] }

// state → URL
serializeSearchParams({
  filters: [{ attribute: "status", value: ["active"] }],
});
// → "filter[status]=active"
```

Both accept the same `keys` / `aliases` / `allowed` / `excludeKeys` options as the adapter.

---

## Support

Have a question or need help? [Open a discussion](https://github.com/cgarciagarcia/react-query-builder/discussions) on GitHub.

---

## Consider Supporting

If this package helps you, consider supporting its creator:

**PayPal:** [@carlosgarciadev](https://paypal.me/carlosgarciadev?country.x=AR&locale.x=es_XC)

---

## License

The MIT License (MIT). See [LICENSE](LICENSE) for more information.
