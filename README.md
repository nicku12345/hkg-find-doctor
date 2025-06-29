# Nicku UI Template

Created as of 2025 Jun

## Initialize

```
$ deno upgrade
$ deno run --allow-read --allow-write --allow-env npm:create-vite-extra@latest .
```

### Install tailwind
```
$ deno add npm:tailwindcss npm:postcss npm:autoprefixer
```

### Install redux
```
$ deno add npm:react-redux npm:@reduxjs/toolkit
```

## Running

You need to have Deno v2.0.0 or later installed to run this repo.

Start a dev server:

```
$ deno run dev
$ deno task dev
```

## Deploy

Build production assets:

```
$ deno task build
```