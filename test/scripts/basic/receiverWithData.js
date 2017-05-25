'use strict';

const pm2Bridge = require('../../..');

pm2Bridge.onMessage(function (data) {
    process.send({
        type: 'pm2-bridge:test',
        data: data
    });
    this.reply(data.data);
});

setTimeout(function () {

}, 5000);
