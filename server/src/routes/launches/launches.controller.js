const {
	getAllLaunches,
	scheduleNewLaunch,
	launchExist,
	abortLaunchById,
} = require('../../models/launches.model')

async function httpGetAllLaunches(req, res) {
	const { page, limit } = req.query
	return res.status(200).json(await getAllLaunches(page, limit))
}

async function httpAddNewLaunch(req, res) {
	const newLaunch = req.body
	
	if (!newLaunch.mission || !newLaunch.rocket || !newLaunch.launchDate || !newLaunch.target) {
		return res.status(400).json({
			error: 'missing required property.'
		})
	}

	newLaunch.launchDate = new Date(newLaunch.launchDate)

	if (isNaN(newLaunch.launchDate)) {
		return res.status(400).json({
			error: 'invalid date.'
		})
	}

	await scheduleNewLaunch(newLaunch)
	return res.status(201).json(newLaunch)
}

async function httpAbortLaunch(req, res) {
	const launchId = +req.params.id

	const isLaunchExist = await launchExist(launchId)
	if (!isLaunchExist) {
		return res.status(404).json({
			error: 'launch not exist'
		})
	}

	const aborted = await abortLaunchById(launchId)
	if (!aborted) {
		return res.status(400).json({
			error: 'fail to abort launch'
		})
	}
	return res.status(200).json({
		ok: true
	})
}


module.exports = {
	httpGetAllLaunches,
	httpAddNewLaunch,
	httpAbortLaunch
}