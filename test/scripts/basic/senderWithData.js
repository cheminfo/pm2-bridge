'use strict';
const pm2Bridge = require('../../..');

pm2Bridge.send({
    to: 'receiver',
    data: {test: 1}
}).then(function(data) {
    process.send({
        type: 'pm2-bridge:test',
        data
    });
});


setTimeout(function() {

}, 5000);
