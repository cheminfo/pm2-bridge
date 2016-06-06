'use strict';
const pm2Bridge = require('../../..');

pm2Bridge.send({
    to: 'receiver',
    data: {test: 1}
}, {
    timeout: 0
}).then(function(data) {
    process.send({
        type: 'pm2-bridge:test',
        data: data
    });
}, function(err) {
    process.send({
        type: 'pm2-bridge:test',
        data: err.message
    });
});


setTimeout(function() {

}, 5000);
