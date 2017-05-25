'use strict';
const pm2Bridge = require('../../..');

pm2Bridge.send({
    to: 'receiver'
}).then(function () {
    process.send({
        type: 'pm2-bridge:test',
        data: 'success: sender received reply'
    });
}, function (err) {
    process.send({
        type: 'pm2-bridge:test',
        data: `error: ${err.message}`
    });
});


setTimeout(function () {

}, 5000);
