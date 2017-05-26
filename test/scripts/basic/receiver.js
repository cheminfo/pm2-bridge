'use strict';

const pm2Bridge = require('../../..');

pm2Bridge.onMessage((data, context) => {
    process.send({
        type: 'pm2-bridge:test',
        data: 'success: receiver received'
    });
    context.reply(0);
});
