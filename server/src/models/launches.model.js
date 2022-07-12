const launchesDatabase = require('../models/launches.mongo')
const planets = require('../models/planets.mongo')
const launches = new Map();
const axios = require('axios');
const { getPagination } = require('../services/query')

const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query'
const DEFAULT_FLIGHT_NUMBER = 100

// const launch = {
// 	flightNumber: 100,
// 	mission: 'Kepler Exploration X',
// 	rocket: 'Explorer IS1',
// 	launchDate: new Date('December 27, 2030'),
// 	target: 'Kepler-442 b',
// 	customers: ['ZTM', 'NASA'],
// 	upcoming: true,
// 	success: true,
// };

// saveLaunch(launch)

async function findLaunch(filter) {
	return await launchesDatabase.findOne(filter)
}

async function launchExist(launchId) {
	return await findLaunch({
		flightNumber: launchId
	})
}

async function populateLaunches() {
	console.log('downloading SpaceX data...')
	const spaceXData = await axios.post(SPACEX_API_URL, 
		{
			query: {},
			options: {
					pagination: false,
					populate: [
							{
									path : 'rocket',
									select: {
											name: 1
									}
							},
							{
									path : 'payloads',
									select: {
											customers: 1
									}
							}
					]
			}
		}
	)
	if (spaceXData.status !== 200) {
		console.log('download fail.')
		throw new Error('fail to download data from SpaceX')
	}

	const spaceXDocs = spaceXData.data.docs
	console.log('start saving launch to DB')
	for (const launch of spaceXDocs) {
		const customers = launch['payloads'].flatMap((payload) => {
			return payload['customers']
		})
		const handledData = {
			flightNumber: launch['flight_number'],
			mission: launch['name'],
			rocket: launch['rocket']['name'],
			launchDate: launch['date_local'],
			upcoming: launch['upcoming'],
			success: launch['success'],
			customers: [...new Set(customers)]
		}
		await saveLaunch(handledData)
	}
	console.log(`${spaceXDocs.length} spaceXDocs loaded`)
}

async function loadSpaceXData() {
	const launch = await findLaunch({
		flightNumber: 1,
		rocket: 'Falcon 1',
		mission: 'FalconSat'
	})

	if (launch) {
		console.log('spaceXData loaded before.');
	} else {
		await populateLaunches();
	}
}

async function getLatestFlightNumber() {
	const latestLaunch = await launchesDatabase.findOne().sort('-flightNumber')

	if (!latestLaunch) {
		return DEFAULT_FLIGHT_NUMBER
	}

	return latestLaunch.flightNumber
}

async function getAllLaunches(page, limit) {
	const skip = getPagination(page, limit)
	return await launchesDatabase.find({}, {
		'_id': 0, '__v': 0
	})
		.sort({ flightNumber: 1 })
		.skip(skip)
		.limit(limit)
}

async function saveLaunch(launch) {
	await launchesDatabase.findOneAndUpdate({
		flightNumber: launch.flightNumber
	}, launch, {
		upsert: true
	})
}

async function scheduleNewLaunch(launch) {
	const planet = await planets.findOne({
		keplerName: launch.target
	})

	if (!planet) throw new Error('no matching planet found.')

	const latestFlightNumber = await getLatestFlightNumber()

	const newLaunch = Object.assign(launch, {
		customers: ['ZTM', 'NASA'],
		upcoming: true,
		success: true,
		flightNumber: latestFlightNumber + 1
	})

	await saveLaunch(newLaunch)
}

// function addNewLaunch(newLaunch) {
// 	latestFlightName++
// 	launches.set(latestFlightName, Object.assign(newLaunch, {
// 		flightName: latestFlightName,
// 		launchDate: newLaunch.launchDate,
// 		customer: ['ZTM', 'NASA'],
// 		upcoming: true,
// 		success: true,
// 	}))
// }

async function abortLaunchById(launchId) {
	const updateInfo = await launchesDatabase.updateOne({
		flightNumber: launchId
	}, {
		upcoming: false,
		success: false
	})

	return updateInfo.modifiedCount === 1
}

module.exports = {
	launches,
	loadSpaceXData,
	launchExist,
	getAllLaunches,
	scheduleNewLaunch,
	abortLaunchById
};
