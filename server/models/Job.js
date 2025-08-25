const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Not Seen', 'Applied', 'Rejected', 'Selected'], 
    default: 'Not Seen' 
  },
  dateApplied: { type: Date, default: Date.now },
  emailSubject: String,
  emailSnippet: String,
  emailContent: String,
  senderEmail: String,
});

module.exports = mongoose.model('Job', JobSchema);