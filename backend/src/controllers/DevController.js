const axios = require('axios')

const Dev = require('../models/Dev')
const parseStringAsArray = require('../utils/parseStringAsArray');
const { findConnections } = require('../websocket');
const { sendMessage } = require('../websocket');

module.exports = {

  async index(req, res) {
    const devs = await Dev.find();

    return res.json(devs);
  },


  async store(req, res) {
    const { github_username, techs, latitude, longitude } = req.body;


    let dev = await Dev.findOne({github_username});

    if (!dev) {
      const response = await axios.get(`https://api.github.com/users/${github_username}`)
  
    const {name = login, avatar_url, bio} = response.data;
  
    const techsArray = parseStringAsArray(techs);
  
    const location = {
      type: 'Point',
      coordinates: [longitude, latitude]// mongo way of location
    }
  
    dev = await Dev.create({
      github_username,
      name,
      avatar_url,
      bio,
      techs: techsArray,
      location,
    })
    // filter the connections of websocket that 
    // are in 10km radius and the new dev has at least one tech
    //on the search

    const sendSocketMessageTo = findConnections(
      { latitude, longitude },
      techsArray,
      )
      sendMessage(sendSocketMessageTo, 'newDev', dev);
      
    }
  
    return res.json(dev)
  },

  async update(req, res) {

    const {  techs, latitude, longitude, avatar_url, bio  } = req.body;

    const {_id} = req.params.id

    const newDev = await Dev.findOneAndUpdate(_id, {$set :{
      techs,
      latitude,
      longitude,
      avatar_url,
      bio

    }}, {new: true},(error, update) => {
      if(error) {
        return res.json({error})
      }
    })   

    return res.json(newDev)
    
  },
  async delete(req, res) {
    const { github_username } = req.params;
    let dev = await Dev.findOne({github_username});
    if (dev){
        await dev.remove();
    }
    return res.json(dev); 
},


  
  
  

}

