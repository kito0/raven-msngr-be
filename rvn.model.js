const mongoose = require('mongoose');

const ravenSchema = mongoose.Schema({
	body: String,
	sender: String,
	timestamp: String,
	received: Boolean,
});

module.exports = mongoose.model('messagecontents', ravenSchema);
