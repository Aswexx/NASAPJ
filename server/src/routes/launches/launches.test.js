const request = require('supertest')
const app = require('../../app')
const {
	mongoConnect,
	mongoDisconnect
} = require('../../services/mongo')

const {
	loadPlanetsData
} = require('../../models/planets.model')


describe('Launches API', () => {
	beforeAll(async () => {
		await mongoConnect()
		await loadPlanetsData()
	})

	afterAll(async () => {
		await mongoDisconnect()
	})


	describe('Test Get /launches', () => {
		test('It should respond with 200 success', async () => {
			const response = await request(app)
				.get('/v1/launches')
				.expect('Content-Type', /json/)
				.expect(200)
		})
	})

	describe('Test POST /launch', () => {
		const entireNewLaunchData = {
			mission: 'Fantasy XI',
			rocket: 'Explorer CFD-22',
			launchDate: 'May 5, 29',
			target: 'Kepler-62 f'
		}

		const newLaunchWithoutDate = {
			mission: 'Fantasy XI',
			rocket: 'Explorer CFD-22',
			target: 'Kepler-62 f'
		}

		const newLaunchWithInvalidDate = {
			mission: 'Fantasy XI',
			rocket: 'Explorer CFD-22',
			launchDate: 'helloooooooooo',
			target: 'Kepler-62 f'
		}

		test('It should respond with 201 created', async () => {
			const response = await request(app)
				.post('/v1/launches')
				.send(entireNewLaunchData)
				.expect('Content-Type', /json/)
				.expect(201)

			const newLaunchDate = new Date(entireNewLaunchData.launchDate).valueOf()
			const responseDate = new Date(response.body.launchDate).valueOf()
			
			expect(response.body).toMatchObject(newLaunchWithoutDate)
			expect(newLaunchDate).toBe(responseDate)
			
		})

		test('It should catch missing required properties', async () => {
			const response = await request(app)
				.post('/v1/launches')
				.send(newLaunchWithoutDate)
				.expect('Content-Type', /json/)
				.expect(400)
			
			expect(response.body).toStrictEqual({
				error: 'missing required property.'
			})
		})

		test('It should catch invalid dates', async () => {
			const response = await request(app)
				.post('/v1/launches')
				.send(newLaunchWithInvalidDate)
				.expect('Content-Type', /json/)
				.expect(400)
			
			expect(response.body).toStrictEqual({
				error: 'invalid date.'
			})
		})
})})

