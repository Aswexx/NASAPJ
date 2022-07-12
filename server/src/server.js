const http = require('http')

require('dotenv').config()

const PORT = process.env.PORT || 8000;
const app = require('./app')
const { loadPlanetsData } = require('./models/planets.model')
const { loadSpaceXData } = require('./models/launches.model')
const { mongoConnect } = require('./services/mongo')

const server = http.createServer(app);


(async function () {
	await mongoConnect()
	await loadPlanetsData()
	await loadSpaceXData()

	server.listen(PORT, () => {
		console.log(`Listening on ${PORT}...`)
	})
})()

