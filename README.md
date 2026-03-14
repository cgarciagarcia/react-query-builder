
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

## Support

Have a question or need help? [Open a discussion](https://github.com/cgarciagarcia/react-query-builder/discussions) on GitHub.

---

## Consider Supporting

If this package helps you, consider supporting its creator:

**PayPal:** [@carlosgarciadev](https://paypal.me/carlosgarciadev?country.x=AR&locale.x=es_XC)

---

## License

The MIT License (MIT). See [LICENSE](LICENSE) for more information.
