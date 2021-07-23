# Vite + React + Tailwind CSS starter

Inspired by [posva's](https://github.com/posva) [vite-tailwind-starter](https://github.com/posva/vite-tailwind-starter)

Note if you have access to [Tailwind UI](https://tailwindui.com), you can follow the following steps to add it:

1. Install `@tailwindcss/ui`:

```sh
yarn add @tailwindcss/ui
```

2. Add the plugin in `tailwind.config.js` without changing anything else:

```js
// tailwind.config.js
module.exports = {
  // ...
  // rest of the config
  plugins: [require('@tailwindcss/ui')],
}
```

## Installation

```sh
yarn
```

## Development

```sh
yarn dev
```

## Build

```sh
yarn build
```