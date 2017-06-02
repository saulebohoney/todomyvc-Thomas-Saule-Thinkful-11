'use strict';

const express = require('express');
const { DATABASE, PORT } = require('./config');
let knex = require('knex')(DATABASE);
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const app = express();


// Add middleware and .get, .post, .put and .delete endpoints

//Generates a response URL to be sent back to the client
const responseURL = (req, res, id) => {
  const protocol = req.protocol;
  const host = req.hostname;
  return `${protocol}://${host}:${PORT}/api/items/${id}`;
};
const corsHeader = function(req,res, next){
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
  next();
};

app.use(bodyParser.json());
app.use(corsHeader);

//In which there are endpoints

app.get('/api/items', (req, res) => {
  knex('items')
    .select()
    .then(results => res.json(results.map(response => {
      const rObj = {
        id: response.id,
        title: response.title,
        completed: response.completed,
        url: responseURL(req, res, response.id)
      };
      return rObj;
    })));
});

app.get('/api/items/:id', (req, res) => {
  knex('items')
    .select('id','title')
    .where('id', req.params.id)
    .then(results => res.json(results[0]));
});

app.post('/api/items', jsonParser, (req, res) => {
  const requiredFields = ['title'];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      return res.status(400).send(message);
    }
  }
  knex('items')
    .insert({title:req.body.title})
    .returning(['id', 'title', 'completed'])
    .then(results => {
      const newId = results[0].id;
      const newTitle = results[0].title;
      const completed = results[0].completed;
      res.status(201).location(responseURL(req, res, newId)).json(
        {
          id: newId,
          title: newTitle,
          url: responseURL(req, res, newId),
          completed: completed
        }
    );
    });
});

app.put('/api/items/:id',(req, res)=> {
  knex('items')
    .where('id',req.params.id)
    .update(
    {
      title: req.body.title,
      completed: req.body.completed
    },
    ['id', 'title', 'completed'])
    .then(results => res.json(results[0]));
});


app.delete('/api/items/:id', (req,res) => {
  knex('items')
  .where('id',req.params.id)
  .del()
  .then (results => res.json(results[0]));
});

//Server stuff
let server;
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
