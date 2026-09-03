# Pull Heroku database

Using a config:

```yml
heroku:
  # heroku app name where the database is
  appName: heroku-app-name
  # heroku database name
  databaseUrl: databaseUrl

prisma:
  # local target database
  url:
```

```bash
yarn exec scripts/execute.mjs heroku/pull-db
```
