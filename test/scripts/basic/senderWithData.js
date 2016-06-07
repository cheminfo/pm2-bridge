'use strict';
const pm2Bridge = require('../../..');

pm2Bridge.send({
    data: {test: 1},
    to: 'receiver'
}).then(function(data) {
    console.log('reply received')
    process.send({
        type: 'pm2-bridge:test',
        data
    });
});


setTimeout(function() {

}, 5000);
