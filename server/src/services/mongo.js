const mongoose = require('mongoose')

require('dotenv').config()

const MONGO_URL = process.env.MONGO_URL
	
async function mongoConnect() {
	await mongoose.connect(MONGO_URL)
}

async function mongoDisconnect() {
	await mongoose.disconnect()
}


mongoose.connection.once('open', () => {
	console.log('DB connected')
})

mongoose.connection.on('error', (err) => {
	console.error('DB connection err occurs:',err)
})

module.exports = {
	mongoConnect,
	mongoDisconnect
}