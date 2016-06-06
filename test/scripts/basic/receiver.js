'use strict';

const pm2Bridge = require('../../..');

pm2Bridge.onMessage(function(data) {
    process.send({
        type: 'pm2-bridge:test',
        data: 'receiver received'
    });
    this.reply({});
});

setTimeout(function() {
    
}, 5000);