# Martin's Habit Tracker
An app to to track all your habits! Built with Next.js and [Deployed on Deno](https://habit-tracker.martinallsbrook.deno.net/)

I'm forcing a lot of things dynamic right now because of an error with static pages on Deno Deploy. This hasent fully fixed the issue any many of my prod builds are failing, but the app does run locally. Hopefully this can be resolved or I'll move the project off of the Deno runtime or something.

## Tooling:

- **Deno** - Runtime
- **Next.js** - Framework
- **React** - UI Rendering (from Next)
- **Prisma** - Postgres ORM
- **Auth.js** - Authentication
- **Neon** - Database

## Getting Started

First, setup the .env file with:

```
GITHUB_ID=[get from your github]
GITHUB_SECRET=[get from your github app]
NEXTAUTH_SECRET=[random 32 char string]
DATABASE_URL=[get from your database, i.e. neon]
```

Then, run the development server with `deno run dev`, this should also install all the dependencies.

You may also have to run `deno run -A npm:prisma migrate dev --name [migration name]` to push prisma's schema to your database.

Finally, open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

<!-- ## Deploy on Deno

You can deploy this project on Deno Deploy! To get started, follow these steps:

1. Go to the [Deno Deploy dashboard](https://app.deno.com/).
2. Click on "New Project".
3. Select your GitHub repository.
4. Follow the prompts to deploy your Next.js application.
5. Once deployed, you will receive a URL where your application is live. -->
