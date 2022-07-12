const DEFALUT_REQ_PAGE = 1
const DEFALUT_REQ_LIMIT = 0

function getPagination(page, limit) {
	const reqPage = Math.abs(page) || DEFALUT_REQ_PAGE
	const reqLimit = Math.abs(limit) || DEFALUT_REQ_LIMIT

	return (reqPage - 1) * reqLimit
}

module.exports = {
	getPagination
}