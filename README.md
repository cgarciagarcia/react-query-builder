
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

The builder bridges to external state sources through an `adapter`. An adapter is any object that implements `QueryBuilderAdapter`:

```ts
interface QueryBuilderAdapter<Aliases> {
  read: () => Partial<GlobalState<Aliases>>;
  write?: (state: GlobalState<Aliases>) => void;
}
```

- `read()` is called **exactly once** when the builder is created — like the lazy form of `useState(() => ...)`. Its return value seeds the initial state.
- `write(state)` is optional. When defined, it runs on every state change so the external source can stay in sync (two-way binding).

### Reading the current URL

For the most common case — reading the page's query string — use the built-in `createSearchParamsAdapter`:

```ts
import {
  useQueryBuilder,
  createSearchParamsAdapter,
} from "@cgarciagarcia/react-query-builder";

const urlAdapter = createSearchParamsAdapter({
  // Optionally remap the keys the parser looks for in the URL.
  // Anything you omit keeps its default ("filter", "sort", "include", "fields").
  keys: {
    filter: "filt",
    sort:   "srt",
    include:"inc",
    fields: "fld",
  },
  // Query params that are not filter/sort/include/fields are ignored unless
  // you list them here. They land in `state.params`.
  allowedParams: ["locale", "tenant"],
});

const builder = useQueryBuilder({ adapter: urlAdapter });
```

Visiting `?filt[status]=active&srt=-name&inc=user&fld[user]=id,email&locale=es` produces a builder whose `build()` returns

```
?filter[status]=active&fields[user]=id,email&sort=-name&include=user&locale=es
```

(The output always uses the library's default keys — the renamed keys are only for **reading** from the URL.)

### Notes

- **One-shot read.** `read()` runs only at builder creation; later URL changes do **not** re-hydrate. Use `sync` (see below) if you want the URL to follow builder mutations.
- **Precedence.** Explicit config wins over `adapter.read()`. Passing `filters: [...]` alongside an adapter overrides the seeded filters entirely.
- **SSR friendly.** The default `source` of `createSearchParamsAdapter` is `() => window.location.search`, evaluated inside `read()`. The default returns `""` when `window` is not available, so it never throws in Node.
- **`page` / `limit` are not auto-hydrated** out of the box — add them to `allowedParams` if you need them preserved as raw params.

### Aliases (round-trip with `.build()`)

When you pass `aliases` to the builder, the adapter automatically picks them up (via the `read({ aliases })` context) so the URL ends up in **wire / backend space** — exactly what `.build()` produces — while your state stays in **frontend space**. The reader applies the reverse map (URL `name` → state `userName`), the writer applies the forward map (state `userName` → URL `name`).

```ts
const aliases = { userName: "name" } as const;

useQueryBuilder({
  aliases,
  adapter: createSearchParamsAdapter({ sync: true }),
});

// Navigating to ?filter[name]=John hydrates filters: [{ attribute: "userName", … }].
// builder.filter("userName", "Jane") writes ?filter[name]=Jane to the URL.
```

You can also pass `aliases` directly to `createSearchParamsAdapter` if you don't want the adapter to depend on builder config.

### Defense-in-depth: `excludeKeys`

URL params are user-controlled. A crafted link like `?filter[is_admin]=true` would otherwise flow straight into your state and out to the backend. `excludeKeys` is an explicit denylist of attribute names that get silently dropped on read (and overrides `allowedParams`):

```ts
createSearchParamsAdapter({
  allowedParams: ["locale"],
  excludeKeys: ["is_admin", "password", "tenant_id", "secret_relation"],
});
```

Applies to filter / sort / include / fields / params. Matched on the raw URL name (backend) before any reverse alias.

### Two-way binding with `sync`

The built-in writer is opt-in via `sync`:

```ts
// Replace the URL on every mutation (no extra history entries)
createSearchParamsAdapter({ sync: true });          // or: sync: "replace"

// Add a history entry per mutation
createSearchParamsAdapter({ sync: "push" });

// Full custom: hand the serialised search string to a router or debouncer
createSearchParamsAdapter({
  sync: (search) => router.replace({ search }),
});
```

The default writer **preserves any query params not managed by this adapter** (anything that does not match the configured `keys` or `allowedParams`). Third-party params like `utm_source`, `gclid`, `theme`, etc. stay intact — only your managed keys are added, updated, or cleared.

### Custom adapters

`QueryBuilderAdapter` is just `{ read, write? }`. Any source — `react-router`'s search params, a hash fragment, an in-memory store, `localStorage` — can be wrapped as an adapter:

```ts
const memoryAdapter: QueryBuilderAdapter = {
  read:  () => store.get(),
  write: (state) => store.set(state),
};

useQueryBuilder({ adapter: memoryAdapter });
```

### Lower level: `parseSearchParams`

If you only need the parser without the adapter wrapper, it is exported as a pure function:

```ts
import { parseSearchParams } from "@cgarciagarcia/react-query-builder";

parseSearchParams("?filt[status]=active", {
  keys: { filter: "filt" },
  allowedParams: ["locale"],
});
// → { filters: [{ attribute: "status", value: ["active"] }] }
```

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
