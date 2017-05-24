const assert = require('assert');

const throws = assert.throws;
assert.throws = _throws;
module.exports = assert;

function _throws(block, /*optional*/error, /*optional*/message) {
	try {
		throws(block, error, message);
	} catch(e) {
		if (e.message === 'Missing expected exception. unexpected error') {
			throw new Error('Ислючение не выброшено');
		} else {
			throw new Error(`Поймана ошибка с сообщением '${e.message}', а ожидалось сообщение '${error}'`);
		}
	}
}
