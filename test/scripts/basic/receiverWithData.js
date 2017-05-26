'use strict';

const pm2Bridge = require('../../..');

pm2Bridge.onMessage((data, context) => {
    process.send({
        type: 'pm2-bridge:test',
        data: data
    });
    context.reply({test: 2});
});
