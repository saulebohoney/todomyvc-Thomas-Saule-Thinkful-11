# Saule and Thomas ToDo MVC Backend API Project

## Description
This is a backend API build for a ToDo MVC style client build. It can be easily linked up to a local or remote Postgres database and can also be run locally or hosted (in our case, Heroku).

## How to run it
After downloading and installing dependencies the next step is to set up a Postgres database locally or remotely using the provided .sql file.

If setting up locally, make sure your server is started and run `psql <server name> -f <path to repo>/todomvc.sql`

If setting up remotely, use the same path to create the database.

Then you will need to create a local .env file in the root directory and set `DATABASE_URL=<path to local or remote db>`

Running `node db-check.js` from the root directory is a good way to make sure the database is set up correctly. You can then run `npm test` to be extra sure that everything is set up correctly.

If tests pass then you can run `npm start` to activate the back end locally and can access the endpoints with the front-end of your choosing!
