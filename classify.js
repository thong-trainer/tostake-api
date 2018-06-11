var VisualRecognitionV3 = require('watson-developer-cloud/visual-recognition/v3');
var fs = require('fs');

var visualRecognition = new VisualRecognitionV3({
	url: 'https://gateway.watsonplatform.net/visual-recognition/api',
	version: '2018-03-19',
	iam_apikey: 'VSMAh_ShMWaDqpu-B0OpPJo2aaurO7yxCNa7p0Nd6Eta'
});

var images_file= fs.createReadStream('./carro-demo.jpg');
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
	else
	console.log(JSON.stringify(response, null, 2))
});