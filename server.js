const express = require('express');
const mongoose = require('mongoose');
const Messages = require('./rvn.model.js');
const Pusher = require('pusher');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 9000;
const connection_url = `mongodb+srv://Drew:combusken09@raven.zzx9x.mongodb.net/<raven-db>?retryWrites=true&w=majority`;
const db = mongoose.connection;

const pusher = new Pusher({
	appId: '1133748',
	key: '9a411b2a0ee16e4825af',
	secret: 'a08ab5b001a9a142e0cc',
	cluster: 'us3',
	useTLS: true,
});

app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
	res.setHeader('Acces-Control-Allow-Origin', '*');
	res.setHeader('Acces-Control-Allow-Headers', '*');
	next();
});

mongoose.connect(connection_url, {
	useNewUrlParser: true,
	useCreateIndex: true,
	useUnifiedTopology: true,
});

db.once('open', () => {
	console.log('db connected');

	const msgCollection = db.collection('messagecontents');
	const changeStream = msgCollection.watch();

	changeStream.on('change', (change) => {
		console.log('a change occured', change);

		if (change.operationType === 'insert') {
			const messageDetails = change.fullDocument;
			pusher.trigger('messages', 'inserted', {
				sender: messageDetails.sender,
				body: messageDetails.body,
				timestamp: messageDetails.timestamp,
				received: messageDetails.received,
			});
		} else {
			console.log('error trigerring pusher');
		}
	});
});

app.get('/', (req, res) => res.status(200).send('helo'));

app.get('/messages/sync', (req, res) => {
	Messages.find((err, data) => {
		if (err) {
			res.status(500).send(err);
		} else {
			res.status(200).send(data);
		}
	});
});

app.post('/messages/new', (req, res) => {
	const message = req.body;

	Messages.create(message, (err, data) => {
		if (err) {
			res.status(500).send(err);
		} else {
			res.status(201).send(`new message created: \n ${data}`);
		}
	});
});

app.listen(port, () => {
	console.log(`Server is running on port: ${port}`);
});
