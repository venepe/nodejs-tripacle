import http from 'http';
import https from 'https';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import yelp from 'yelp-fusion';
import distance from 'google-distance-matrix';
import secrets from './secrets';
const client = yelp.client(secrets.YELP_API_KEY);
distance.key(secrets.GOOGLE_API_KEY);
distance.units('imperial');
distance.mode('driving');

const app = express();
const port = process.env.PORT || 8080;

if (process.env.NODE_ENV === 'production') {
  app.use(function(req, res, next) {
    // if(!req.secure) {
    //   return res.redirect(['https://', req.get('Host'), req.url].join(''));
    // }
    next();
  });
}

app.use(cors());

app.get('/api/yelp/search', (req, res) => {
  client.search({
      categories: req.query.categories,
      location: req.query.location,
      offset: req.query.offset,
      limit: req.query.limit,
    })
  .then((result) => {
    console.log(result.jsonBody);
    res.json(result.jsonBody);
  })
  .catch((error) => {
    console.log(error);
  });
});

app.get('/api/trip/duration', (req, res) => {
  let origin = req.query.origin;
  let destination = req.query.destination;
  distance.matrix([`${origin}`], [`${destination}`], (err, distances) => {
        if (err) {
          res.status(500).json({});
        } else if (distances.status === 'OK') {
          res.json({
            duration: distances.rows[0].elements[0].duration.text,
          });
        }
      });
});

app.use(express.static(__dirname + '/public'));

app.use(function(err, req, res, next) {
  // logic
  res.status(500).json({});
});

const httpServer = http.createServer(app);

// const key  = fs.readFileSync('./etc/letsencrypt/live/sumseti.com-0001/privkey.pem');
// const cert = fs.readFileSync('./etc/letsencrypt/live/sumseti.com-0001/fullchain.pem');
// const ca = fs.readFileSync('./etc/letsencrypt/live/sumseti.com-0001/chain.pem');
// const sslOptions = {key, cert, ca};
// const httpsServer = https.createServer(sslOptions, app);

httpServer.listen(port);
// httpsServer.listen(443);
