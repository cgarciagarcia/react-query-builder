<p><b>JavaScript/TypeScript Query Builder</b> provides a way to build a query string compatible with <a href="https://github.com/spatie/laravel-query-builder">spatie/laravel-query-builder</a>.</p>

## Install

You can install package using yarn (or npm):

```bash
yarn add @cgarciagarcia/react-qiery-builder
```

## Usage

This package was thought offer an easy way to interact with backend integration `spatie/laravel-query-builder`
using your favorite library for frontend `React.js` using a customize hook which you could interact.

### All Example

Here is a simple example:

```js
import {useQueryBuilder} from "@cgarciagarcia/react-qiery-builder";

const baseConfigIfYouWant = {
    aliases: {
        "frontend_name": "backend_name",
    }
}

const builder = useQueryBuilder(baseConfigIfYouWant)
    .filters("age", 18)
    .sorts("created_at")// by default sorting asc
    .sorts("age", 'desc') // sorting desc
    .includes("posts", "comments")


console.log(theQuery.build());
// /users?filter[age]=18,


## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
