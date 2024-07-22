
<p>
    <b>JavaScript/TypeScript Query Builder</b>
    provides a way to build a query string compatible with
    <a href="https://github.com/spatie/laravel-query-builder">spatie/laravel-query-builder</a>.
</p>

# WARNING: This library is not establish yet, it will be soon

## Install

You can install package using yarn (or npm):

```bash
yarn add @cgarciagarcia/react-query-builder
```

## Usage

This package is designed to provide an easy way to interact with the backend integration
of `spatie/laravel-query-builder`
using your favorite frontend library, `React.js`. It includes a custom hook that you can use for seamless interaction.

### All Example

Here is a simple example:

```js
import { useQueryBuilder } from "@cgarciagarcia/react-query-builder";

const baseConfig = {
  aliases: {
    "frontend_name": "backend_name",
  }
}

const builder = useQueryBuilder(baseConfig)
  .clearFilters()
  .filter("age", 18)
  .sort("created_at") // by default sorting asc
  .sort("age", 'desc') // sorting desc
  .include("posts", "comments")

console.log(theQuery.build());
// /users?filter[age]=18&sort=created_at,-age&includes=posts,comments
```

## License

The MIT License (MIT). Please see [License File](LICENSE) for more information.
