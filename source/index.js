const Q = require('q');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

module.exports = function Factory(config, db) {
  const { port } = config;

  const app = express();
  app.use(bodyParser.json());
  app.use(cors());

  app.use((req, res, next) => {
    const { method, url } = req;
    console.log(method, url);
    next();
  });

  app.get('/:uid', (req, res) => {
    const { uid } = req.params;
    Q.ninvoke(db, 'get', `address:${uid}`)
      .then((out) => {
        if (out) {
          return res.json(JSON.parse(out));
        }

        return res.status(404).json({ msg: 'not found' });
      })
      .catch((err) => {
        res.status(500).json(err);
      });
  });

  app.post('/:uid', (req, res) => {
    const { uid } = req.params;
    Q.ninvoke(db, 'set', `address:${uid}`, JSON.stringify(req.body))
      .then(() => {
        res.json({ msg: 'set' });
      })
      .catch((err) => {
        res.status(500).json(err);
      });
  });

  app.use((req, res) => {
    res.status(404).json({ msg: 'not found' });
  });

  return Q.ninvoke(app, 'listen', port)
    .then(() => app);
};
