const express = require('express');
const multer = require('multer');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const User = require('./models/user');
const Record = require('./models/record');
const request = require('request');
app.use(bodyParser.json());
// translate
var http = require('http');
var clientId = "FREE_TRIAL_ACCOUNT";
var clientSecret = "PUBLIC_SECRET";

// public folder
app.use('/public', express.static('./public'));

var VisualRecognitionV3 = require('watson-developer-cloud/visual-recognition/v3');
var fs = require('fs');

var visualRecognition = new VisualRecognitionV3({
	url: 'https://gateway.watsonplatform.net/visual-recognition/api',
	version: '2018-03-19',
	iam_apikey: 'VSMAh_ShMWaDqpu-B0OpPJo2aaurO7yxCNa7p0Nd6Eta'
});


mongoose.connect("mongodb://localhost/tostake", function(error){
    if(error) console.log(error);
    console.log("connection successful");
});
mongoose.Promise = global.Promise;

// set the storage engine
const storage = multer.diskStorage({
  destination: function(req, file, next) {
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;
    var folder = './public/uploads/' + year;
    // if the folder not exist yet, then create
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder);
    }
    folder += '/' + month;
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder);
    }

    next(null, folder)
  },
  filename: function(req, file, next) {
    next(null, Date.now() + path.extname(file.originalname));
  }
});

// check file type
function checkFileType(file, next) {
  // allowed extension
  const filetypes = /jpeg|jpg|png|gif/;
  // check extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // check mime type
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return next(null, true);
  } else {
    next('Error: Alowed Images Only!');
  }
}

// Init Upload
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100000000
  },
  fileFilter: function(req, file, next) {
    checkFileType(file, next);
  }
}).single('image');

// error handling middleware
app.use(function(err, req, res, next){
  console.log(err);
  const error = app.get('env') === 'development' ? err : {};
  const status = err.status || 500;
  res.status(status).send({error: error.message});
});


app.post('/api', function(req, res, next){
	console.log("working...");
	// res.send("working....");

  // save image to public folder
    upload(req, res, function(err) {
      console.log(req.file);
      if (err) {
        	console.log("Photo API ERROR: " + err);

        	res.send("Error");
      } else {
        if (req.file == undefined) {
          	// the image not found
  			   res.send("Error: No file");
        } else {
          // uploaded successful
          //res.send(req.file);
  var images_file = fs.createReadStream(req.file.path);
  var classifier_ids = ["default"];
  var threshold = 0.6;

  var params = {
    images_file: images_file,
    classifier_ids: classifier_ids,
    threshold: threshold
  };  

  visualRecognition.classify(params, function(err, response) {
    if (err)
      console.log(err);
    else{
      console.log(JSON.stringify(response, null, 2))
      const images = response['images'];
      var classifiers = images[0].classifiers;
      var classes = classifiers[0].classes;
      var item = classes[0];
      // res.send({
      //     "nameEN": item.class,
      //     "nameKH": "translated",
      //     "score": item.score,
      //     "url": req.file.path
      // });  
      const url = "http://128.199.88.174:8090/api/translation?target=km&text="+item.class;
      request(url, { json: true }, (err, response, body) => {
        if (err) { 
          res.send("Translation Error");
          return console.log(err); 
        }
        
        res.send({
            "nameEN": item.class,
            "nameKH": body,
            "score": item.score,
            "url": req.file.path
        });  
        
      });      


    }     
  });           
        }
      }
    });
  
});

app.get('/api', function(req, res, next){
	
	// var images_file = fs.createReadStream('./carro-demo.jpg');
  var images_file = fs.createReadStream('./person.jpg');
  // var images_file = fs.createReadStream('./cup-of-coffee.jpg');
	var classifier_ids = ["default"];
	var threshold = 0.6;

	var params = {
		images_file: images_file,
		classifier_ids: classifier_ids,
		threshold: threshold
	};	

	visualRecognition.classify(params, function(err, response) {
		if (err)
			console.log(err);
		else{
			console.log(JSON.stringify(response, null, 2))
      const images = response['images'];
      var classifiers = images[0].classifiers;
      var classes = classifiers[0].classes;
      var item = classes[0];
      console.log(item);
      // res.send({
      //     "nameEN": item.class,
      //     "nameKH": "translated",
      //     "score": item.score,
      //     "url": "req.file.path"
      // });  
      const url = "http://128.199.88.174:8090/api/translation?target=km&text="+item.class;
      request(url, { json: true }, (err, response, body) => {
        if (err) { 
          res.send("Translation Error");
          return console.log(err); 
        }
        
        res.send({
            "nameEN": item.class,
            "nameKH": body,
            "score": item.score,
            "url": "req.file.path"
        });  
        
      });

		}			
	});		
});


// app.get('/api/test', function(req, res, next){

//   request(url, { json: true }, (err, res, body) => {
//     if (err) { return console.log(err); }
//     console.log(body);
//   });
// });

app.post('/api/user', async function(req, res, next){

  var user = User(req.body);
  user._id = mongoose.Types.ObjectId();
  var result = await user.save();
  res.send(result);

});  

app.post('/api/record', async function(req, res, next){

  var record = Record(req.body);
  console.log(record);
  var result = await record.save();
  res.send(result);
  
}); 

app.get('/api/record/:index/:limit', async function(req, res, next){

  // params validation
  if (isNaN(req.params.index) || isNaN(req.params.limit)) {
    res.status(500).json({
      message: "incorrect information.",
      success: false
    });
    return;
  }

  const limit = parseInt(req.params.limit, 0);
  const skip = req.params.index * limit;

  const records = await Record.find({
      topicId: req.params.topicId,
      status: req.params.status,
      active: true
    }).sort({createdAt: -1}).skip(skip).limit(limit);
  
  res.send(records);

});  

// listen for requests
app.listen(process.env.port || 5000, function(){
  console.log('now listening on port: localhost:5000');
});