let {HuskyServer} = require('./../models/HuskyBroker')


/**
 * @typedef {Object} GlobalStorage
 * @property {HuskyServer} huskyServer
*/

/**
 * @type {GlobalStorage}
 */
let storage = {huskyServer : null}


module.exports = storage