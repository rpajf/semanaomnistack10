const { Router } = require('express');
const DevController = require('./controllers/DevController')
const SearchController = require('./controllers/SearchController')

const routes = Router();


routes.get('/devs', DevController.index)
routes.post('/devs', DevController.store)
routes.put('/dev/:id', DevController.update)

routes.get('/search', SearchController.index)
routes.delete('/devs/:github_username', DevController.delete)

module.exports = routes;
