const express = require('express');
const router = express.Router();
const PROTO_PATH = __dirname + '/../proto/place.proto';
const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, { longs: String});

const placeDefinition = grpc.loadPackageDefinition(packageDefinition).com.drz;


const clientPlace = new placeDefinition.PlaceGeoLocationService(
  process.env.PLACE_GRPC,
  grpc.credentials.createInsecure()
);

/* GET home page. */
router.get('/', function(req, res, next) {
  const clientClient = new placeDefinition.ClientService(
    process.env.PLACE_GRPC,
    grpc.credentials.createInsecure()
  );
  clientClient.all({ "from": 0, "size": 50 }, (err, data) => {
    if (err) {
      console.error({err});
      res.render('error', { "error": {'status': 500, 'stack': ''}, "message": "Something went wrong" })
      return;
    }
    
    res.render('index', {clients: data.data, title: 'Geo Location Example'});

  });
  
});

router.post('/search', function(req, res, next) {
  let topLeft = req.body.topLeft;
  let bottomRight = req.body.bottomRight;  
  let clientId = parseInt(req.body.clientId);
  console.log(req.body);
  console.log(isNaN(topLeft.lat));
  console.log(isNaN(topLeft.lon));
  console.log(!bottomRight);
  console.log(isNaN(bottomRight.lat));
  console.log(isNaN(bottomRight.lon));

  if (!topLeft || isNaN(topLeft.lat) || isNaN(topLeft.lon) || !bottomRight || isNaN(bottomRight.lat) || isNaN(bottomRight.lon)) {
    res.json({"code": 400,  "message": "Error, the values 'topLeft' and 'bottomRight' are required and must contain the lat and lon"}, 400);
    return;
  }
  
  clientPlace.near(
    { from: 0, size: 50, topLeft: topLeft, bottomRight: bottomRight, clientId: clientId},
    function(err, data) {
      if (err) {
        console.error(err);
        res.json({ code: 500, message: "Something went wrong" }, 500);
        return;
      }
      if (!data.data) {
          data = {data: []};
      }

      res.json(data.data);
    }
  );
});

module.exports = router;
