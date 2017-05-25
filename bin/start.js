'use strict';

var pm2 = require('pm2');
var processList = [];

var from = {};

function updateProcessList() {
    return new Promise(function (resolve, reject) {
        pm2.list(function (err, list) {
            if (err) return reject();
            processList = list;
            return resolve(processList);
        });
    });
}

pm2.connect(function () {
    pm2.launchBus(function (err, bus) {
        bus.on('pm2-bridge', function (packet) {

            var data = packet.data;

            if (from[data.messageId]) {
                data.to = from[data.messageId];
                delete from[data.messageId];
            } else if (data.to) {
                from[data.messageId] = packet.process.name;
            } else {
                return;
            }

            var to = data.to;
            var receivers = processList.filter(p => to === p.name);
            var prom = Promise.resolve();
            if (receivers.length !== to.length) {
                prom = prom.then(updateProcessList);
            }

            prom.then(() => {
                var receivers = processList.filter(p => to === p.name);
                if (receivers.length === 0) {
                    if (from[data.messageId]) {
                        sendError(data, 'Receiver process not found');
                    }
                }
                for (let i = 0; i < receivers.length; i++) {
                    pm2.sendDataToProcessId(receivers[i].pm2_env.pm_id, {
                        data: {
                            data: data.data,
                            from: packet.process.name
                        },
                        topic: 'none',
                        messageId: data.messageId
                    }, function () {
                        // Not adding this callback makes this script exit...
                        // Send error message to sender
                    });
                }
            }).catch(() => {
                // if error send message to sender
            });
        });
        process.send({
            type: 'pm2-bridge:ready',
            topic: 'ready',
            data: {}
        });
    });
});

function sendError(data, message) {
    var to = from[data.messageId];
    delete from[data.messageId];
    var receiver = processList.find(p => to === p.name);
    if (!receiver) {
        return;
    }
    pm2.sendDataToProcessId(receiver.pm2_env.pm_id, {
        error: message,
        data: {},
        topic: 'none',
        messageId: data.messageId
    });
}
