const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({

    profileID: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'role'
    },

    notifications: [{
            title: String,
            time:Date,

    }]
});

module.exports = mongoose.model('Notification', notificationSchema);