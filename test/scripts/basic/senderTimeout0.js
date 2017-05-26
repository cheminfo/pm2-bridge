'use strict';
const pm2Bridge = require('../../..');

pm2Bridge.send({
    data: {test: 1},
    timeout: 0,
    to: 'receiver'
}).then(function (data) {
    process.send({
        type: 'pm2-bridge:test',
        data: data
    });
}, function (err) {
    process.send({
        type: 'pm2-bridge:test',
        data: `error: ${err.message}`
    });
});
