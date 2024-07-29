[![Codacy Badge](https://api.codacy.com/project/badge/Grade/c3e6dbe3816d4cd7b496e0142c730972)](https://app.codacy.com/gh/cgarciagarcia/react-query-builder?utm_source=github.com&utm_medium=referral&utm_content=cgarciagarcia/react-query-builder&utm_campaign=Badge_Grade)
[![Coverage Status](https://coveralls.io/repos/github/cgarciagarcia/react-query-builder/badge.svg?branch=main&kill_cache=1)](https://coveralls.io/github/cgarciagarcia/react-query-builder)
[![Test CI](https://github.com/cgarciagarcia/react-query-builder/actions/workflows/test.yml/badge.svg)](https://github.com/cgarciagarcia/react-query-builder/actions/workflows/test.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-brightgreen.svg)](https://opensource.org/licenses/MIT)

**TypeScript Query Builder** provides a way to build a query string compatible with
[spatie/laravel-query-builder](https://github.com/spatie/laravel-query-builder).


# WARNING: This library is not establish yet, it will be soon

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
  }
}

const builder = useQueryBuilder(baseConfig)

builder
  .filter("age", 18)
  .sort("created_at") // by default sorting asc
  .sort("age", 'desc') // sorting desc
  .include("posts", "comments")

console.log(theQuery.build());
// /users?filter[age]=18&sort=created_at,-age&includes=posts,comments
```

<h3 style="color:#cb3837;">Remove Methods</h3>
You can use the remove method in sort, includes, filter like this:

```js
const builder = useQueryBuilder(baseConfig)

  builder
    .removeFilter('name', 'last_name')
    .removeSort('name', 'id')
    .removeInclude('address', 'documents')
```

<h3 style="color:#cb3837;">Clear Methods</h3>

You can use the clear methods for delete the entire data group  

```js
const builder = useQueryBuilder(baseConfig)

  builder
    .clearFilters()
    .clearIncludes()
    .clearSorts()
```

## Next features
* Interaction with url query string


## License

The MIT License (MIT). Please see [License File](LICENSE) for more information.
