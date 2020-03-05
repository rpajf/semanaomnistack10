const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors')
const http = require('http')
const routes = require('./routes')
const { setupWebsocket } = require('./websocket')

const app = express();
//extract the http req from the express, in order to listen to both:
//http and websocket
const server = http.Server(app);


setupWebsocket(server);

mongoose.connect('mongodb+srv://ralph:omnistack@cluster0-hv8as.mongodb.net/week10?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useFindAndModify: true,
  useUnifiedTopology: true
})

app.use(cors())

app.use(express.json());
app.use(routes);

server.listen(3333)