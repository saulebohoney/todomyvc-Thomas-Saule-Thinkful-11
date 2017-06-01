'use strict';

const express = require('express');
const { DATABASE, PORT } = require('./config');
let knex = require('knex')(DATABASE);
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();


const app = express();


// Add middleware and .get, .post, .put and .delete endpoints
// app.get('/', (req, res) => {
//   res.send('Hello!');
// });

const corsHeader = function(req,res, next){
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
    next();
};

app.use(bodyParser.json());

app.get('/api/items', corsHeader, (req, res) => {
    knex.select()
    .from('items')
    .then(results => res.json(results));
});

app.get('/api/items/:id', corsHeader, (req, res) => {
    knex.select('id')
    .from('items')
    .where('id', req.params.id)
    .then(results => res.json(results[0]));
});

app.post('/api/items', jsonParser, (req, res) => {
    const requiredFields = ['title'];
    for (let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
          const message = `Missing \`${field}\` in request body`;
          console.error(message);
          return res.status(400).send(message);
      }
    }
    knex.insert({'title':req.body.title}).into('items')
    .then(results => {
    res.status(201).location();
    res.json( {title: req.body.title} )
    }
});


//Server stuff
let server;
//let knex;
function runServer(database = DATABASE, port = PORT) {
    return new Promise((resolve, reject) => {
        try {
          knex = require('knex')(database);
          server = app.listen(port, () => {
            console.info(`App listening on port ${server.address().port}`);
            resolve();
        });
      }
        catch (err) {
          console.error(`Can't start server: ${err}`);
          reject(err);
      }
    });
}

function closeServer() {
    return knex.destroy().then(() => {
        return new Promise((resolve, reject) => {
          console.log('Closing servers');
          server.close(err => {
            if (err) {
              return reject(err);
          }
            resolve();
        });
      });
    });
}


if (require.main === module) {
    runServer().catch(err => {
        console.error(`Can't start server: ${err}`);
        throw err;
    });
}

module.exports = { app, runServer, closeServer };
