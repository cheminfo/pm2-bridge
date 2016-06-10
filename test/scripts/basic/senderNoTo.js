'use strict';
const pm2Bridge = require('../../..');

pm2Bridge.send({
    data: {test: 1}
}).then(function(data) {
    process.send({
        type: 'pm2-bridge:test',
        data: 'sender received reply'
    });
}, function(err) {
    process.send({
        type: 'pm2-bridge:test',
        data: err.message
    });
});


setTimeout(function() {

}, 5000);