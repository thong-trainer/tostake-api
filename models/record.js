const mongoose = require('mongoose')
Schema = mongoose.Schema;

// create Record Schema & Model
const RecordSchema = new Schema({
  nameEN: {
    type: String,
    required: [true, 'nameEN field is required']
  },
  nameKH: {
    type: String,
    required: [true, 'nameKH field is required']
  },
  score: {
    type: Number,
    required: [true, 'score field is required']
  },
  url: {
    type: String,
    required: [true, 'url field is required']
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: [true, 'userId field is required']
  },
  active: {
    type: Boolean,
    default: true
  }
},{timestamps: true});

const Record = mongoose.model('record', RecordSchema);
module.exports = Record;
