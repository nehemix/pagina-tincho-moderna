# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project
npx sv create my-app
```

To recreate this project with the same configuration:

```sh
# recreate this project
bun x sv@0.15.1 create --template minimal --types ts --add prettier eslint tailwindcss="plugins:typography,forms" sveltekit-adapter="adapter:auto" --install bun .
```

## Developing

Before starting the development server, you need to set up the local database. Create a folder named `data` in the root of the project and an empty `db.json` file inside it:

```sh
mkdir data
echo "{}" > data/db.json
```

Once you've installed dependencies with `npm install` (or `pnpm install`, `yarn`, or `bun install`), start a development server:

```sh
bun run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
bun run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
