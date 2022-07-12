const fs = require('fs');
const path = require('path')
const { parse } = require('csv-parse');
const planets = require('./planets.mongo')


function isHabitable(planet) {
	return planet['koi_disposition'] === 'CONFIRMED'
    && planet['koi_insol'] > 0.36 && planet['koi_insol'] < 1.11
    && planet['koi_prad'] < 1.6;
}

function loadPlanetsData() {
	return new Promise((resolve, reject) => {

		fs.createReadStream(path.join(__dirname,'..','..','data','kepler_data.csv'))
		.pipe(parse({
			comment: '#',
			columns: true,
		}))
		.on('data', async(data) => {
			if (isHabitable(data)) {
				// results.push(data)
				await savePlanet(data)
			}
		})
		.on('error', (err) => {
			reject(err)
		})
			.on('end', async() => {
			const amountOfPlanets = (await getAllPlanets()).length
			console.log(`${amountOfPlanets} habitable planets found`)
			resolve()
		})
	})
}

async function getAllPlanets() {
	try {
		return await planets.find({}, {
			'_id': 0, '__v':0
		})
	} catch (err) {
		console.error(err)
	}
}

async function savePlanet(planet) {
	try {
			await planets.updateOne({
			keplerName: planet.kepler_name
		}, {
			keplerName: planet.kepler_name
		}, {
			upsert: true
		})
	} catch (err) {
		console.error('fail to create or update', err)
	}
}

module.exports = {
	loadPlanetsData,
	getAllPlanets
}