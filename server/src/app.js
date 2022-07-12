const express = require('express')
const app = express()
const cors = require('cors')
const path = require('path')
const morgan = require('morgan')
const api = require('./routes/api')


// const whiteList = [
// 	'http://localhost:3000',
// 	'http://localhost:8000',
// ]
// app.use(cors({
// 	origin: (origin, callback) => {
// 		if (whiteList.indexOf(origin) !== -1) {
// 			callback(null,true)
// 		} else {
// 			console.log(origin)
// 			callback(new Error('Not allowed by CORS'))
// 		}
// 	}
// }))

app.use(cors({
	origin: 'http://localhost:3000'
}))

app.use(morgan('combined'))


app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')))

app.use('/v1', api)

app.use('/*', (req, res) => {
	res.sendFile(path.join(__dirname,'..','public','index.html'))
})

module.exports = app