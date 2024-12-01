
**TypeScript React hook query Builder** provides a way to build a query string compatible with
[spatie/laravel-query-builder](https://github.com/spatie/laravel-query-builder).

[![Coverage Status](https://coveralls.io/repos/github/cgarciagarcia/react-query-builder/badge.svg?branch=main&service=github&kill_cache=1)](https://coveralls.io/github/cgarciagarcia/react-query-builder?branch=main)
[![Test CI](https://github.com/cgarciagarcia/react-query-builder/actions/workflows/test.yml/badge.svg)](https://github.com/cgarciagarcia/react-query-builder/actions/workflows/test.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-brightgreen.svg)](https://opensource.org/licenses/MIT)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/1f3f48abc84f4e3cba76e39e804786d6)](https://app.codacy.com/gh/cgarciagarcia/react-query-builder/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)
[![Downloads](https://img.shields.io/npm/d18m/@cgarciagarcia/react-query-builder?style=flat-square)](https://www.npmjs.com/package/@cgarciagarcia/react-query-builder)

## Installation

You can install package using yarn (or npm):

```bash
yarn add @cgarciagarcia/react-query-builder
```

## Usage

This package is designed to provide an easy way to interact with the backend integration
of `spatie/laravel-query-builder`
using your favorite frontend library, `React.js`. It includes a custom hook that you can use for seamless interaction.

<h3 style="color:#cb3837">Some Examples</h3>

Here is a simple example:

```js
import { useQueryBuilder } from "@cgarciagarcia/react-query-builder";

const baseConfig = {
  aliases: {
    "frontend_name": "backend_name",
  },
 
}

const builder = useQueryBuilder(baseConfig)

builder
  .fields('user.name', 'user.last_name', 'other')
  .filter('salary', ">", 1000)
  .filter("age", 18)
  .sort("created_at") // by default sorting asc
  .sort("age", 'desc') // sorting desc
  .setParam("external_param", 123) // you can define it in the baseConfig
  .include("posts", "comments")

function apiCall() {
  console.log(builder.build());
  // ?fields[user]=name,fields=other,last_name&filter[age]=18&sort=created_at,-age&includes=posts,comments
  return fetch("https://myapi.com/api/users" + builder.build()).then(response => response.json())
}
```

<h3 style="color:#cb3837;">Configurations</h3>

You can set the initial state for your query builder, also it's possible to modify
the delimiter for each action (fields, filters, includes, sorts), the global delimiter
will be overwritten  with the specific delimiter

```javascript

// Default configuration 
const baseConfig = {
  aliases: {},
  filters: [],
  includes: [],
  sorts: [],
  fields: [],
  pruneConflictingFilters: {},
  delimiters: {
    global: ',',
    fields: null,
    filters: null,
    sorts: null,
    includes: null,
    params: null,
  },
  useQuestionMark: false,
  params: {}
}
```

<h3 style="color:#cb3837;">Remove Methods</h3>
You can use the remove method in sort, includes, filter like this:

```js
const builder = useQueryBuilder(baseConfig)

  builder
    .removeField('field_1', 'field_2')
    .removeFilter('name', 'last_name')
    .removeSort('name', 'id')
    .removeInclude('address', 'documents')
    .removeParam('param1', 'param2')
```

<h3 style="color:#cb3837;">Clear Methods</h3>

You can use the clear methods for delete the entire data group

```js
const builder = useQueryBuilder(baseConfig)

  builder
    .clearFields()
    .clearFilters()
    .clearIncludes()
    .clearSorts()
    .clearParams()
```

<h3 style="color:#cb3837;">Filters that don't work together</h3>

Maybe your business logic has filters that won't work together, for example you could
have filters like `date` filter and `between_dates` filter in your backend, but you can not filter
by both at the same time, so you have to be sure to clear incompatibles filters
before to adding a new one. With this purpose the property `pruneConflictingFilters`
was created, you can define these incompatibilities in the base configuration and delegate
the humdrum action to the library.

Example:

```js
const builder = useQueryBuilder({
  pruneConflictingFilters: {
    date: ['between_dates']
  },
})

builder.filter('date', today)
    .build() // the result is ?filter[date]=2024-08-13
    .filter('between_dates', [lastWeek, today])
    .build() // the result in this line is ?filter[between_dates]=2024-08-06,2024-08-13
```

#### How does it work?

When you define that `date` filter is not compatible with `between_dates`, internally
the library define the bidirectional incompatibility for you. Too much magic? Don't
worry, you still could define manually the inverse incompatibility to have explicit
declaration from your side.

<h3 style="color:#cb3837;">Utilities</h3>

You could use the builder with your [Tank Stack React query](https://tanstack.com/query/latest)
implementation for example:

#### toArray()

```typescript

import { getApiUsers } from "@/Api/users"
import { useQueryBuilder } from "@cgarciagarcia/react-query-builder";

const MyComponent = () => {

  const builder = useQueryBuilder()

  const useUserQuery = useQuery({
    fnQuery: () => getApiUsers(builder),
    queryKey: ['userQuery', ...builder.toArray()]
  })

  /* Rest of code */
}

```

#### when()

```typescript

import { getApiUsers } from "@/Api/users"
import { useQueryBuilder } from "@cgarciagarcia/react-query-builder";

const MyComponent = () => {
  
  const builder = useQueryBuilder()

  const useUserQuery = useQuery({
    fnQuery: () => getApiUsers(builder),
    queryKey: ['userQuery', ...builder.toArray()]
  })
  
  const onClickButton = (id: number|null) => {
    
    builder.when(id !== null, (state) => {
      console.log(state) // reveal internal state
    })
  }
  
  /* Rest of code */
}

```

### hasMethods()


```js
const builder = useQueryBuilder()

builder.hasFilter('filter', 'filter2', ...)
  .hasInclude('include', 'include2', ...)
  .hasParam('param1', 'param2', ...)
  .hasField('field', ...)
  .hasSort('sort', ...)

```
## Do you have question how to implement it?

Feel free to generate a discussion in the github repository I will help you


## Consider supporting me

I invite you to support its creator. Your contribution will
not only help maintain and improve this package but also promote the continuous
development of quality tools and resources. You can also email me and let me know.

Paypal: [@carlosgarciadev](https://paypal.me/carlosgarciadev?country.x=AR&locale.x=es_XC)


## License

The MIT License (MIT). Please see [License File](LICENSE) for more information.
