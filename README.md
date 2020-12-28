# HackerDaily importer

The importer program checks every 25 seconds what happened on Hacker News. It fetches these changes and updates the HackerDaily database.

## Getting Started

It's possible to get a local version up and running within a few minutes.

### Prerequisites

Node.js, at least v10.13.

### Installing

Install all dependencies.

```
npm ci
```

Add a `.env` file with the environment variables.

```
HN_URL=https://hacker-news.firebaseio.com/v0
BACKEND_URL=...
HASURA_ADMIN_SECRET=...
```

Start the program

```
npm run start
```


## Deployment

The HackerDaily is currently deployed as a dyno on Heroku. It works exactly the same in production as locally, so it can be started by running `npm run start`.

## Contributing

Coming soon.

## Authors

* **Ruben van Eldik** - *Initial work* - [RubenVanEldik](https://github.com/RubenVanEldik)


## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
