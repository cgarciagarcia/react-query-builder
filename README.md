<p><b>JavaScript/TypeScript Query Builder</b> provides a way to build a query string compatible with <a href="https://github.com/spatie/laravel-query-builder">spatie/laravel-query-builder</a>.</p>

## Install

You can install package using yarn (or npm):

```bash
yarn add @cgarciagarcia/react-query-builder
```

## Usage


This package is designed to provide an easy way to interact with the backend integration of `spatie/laravel-query-builder` 
using your favorite frontend library, `React.js`. It includes a custom hook that you can use for seamless interaction.

### All Example

Here is a simple example:

```js
import {useQueryBuilder} from "@cgarciagarcia/react-query-builder";

const baseConfig = {
    aliases: {
        "frontend_name": "backend_name",
    }
}

const builder = useQueryBuilder(baseConfig)
    .clearFilters()
    .filters("age", 18)
    .sorts("created_at")// by default sorting asc
    .sorts("age", 'desc') // sorting desc
    .includes("posts", "comments")


console.log(theQuery.build());
// /users?filter[age]=18,


## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
