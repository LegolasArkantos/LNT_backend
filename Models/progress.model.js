const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  
  assignments: [{
    assignmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assignment',
    },
    
     
    title: {
      type: String,
      required: true
    },
    total: {
      type: Number,
      required: true
    },
    grades: [{
      type: Number,
      required: true
    }]
  }]
});

module.exports = mongoose.model('Progress', progressSchema);