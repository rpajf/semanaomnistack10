const socketio = require('socket.io');
const parseStringAsArray = require('./utils/parseStringAsArray');
const calculateDistance = require('./utils/calculateDistance');

let io;// acess on the external scope
/* change to a collection in mongo or a table */
const connections = [];

exports.setupWebsocket = (server) => {
  io = socketio(server);

  io.on('connection', socket => {
    const { latitude, longitude, techs } = socket.handshake.query;
    


    connections.push({
      id: socket.id,
      coordinates: {
        latitude: Number(latitude), //the default is string
        longitude: Number(longitude),
      },
      techs: parseStringAsArray(techs),

    })

    



    
  })
};

exports.findConnections = (coordinates, techs) => {
  return connections.filter(connection => {
    //comparing the coordinates of the new dev and the coordinates
    // stored in the new websocket connections
    return calculateDistance(coordinates, connection.coordinates) < 10
        // se if at least one tech is on the devArray techs, and include it
      && connection.techs.some(item => techs.includes(item))
  })
}

exports.sendMessage = (to, message, data) => {
  to.forEach(connection => {
    io.to(connection.id).emit(message, data);

  })
}