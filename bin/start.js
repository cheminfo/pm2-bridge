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
            let isReply;
            const data = packet.data;

            if (from[data.messageId]) {
                // This message is a pm2-bridge reply since the messageId exists
                isReply = true;
                data.to = from[data.messageId];
                delete from[data.messageId];
            } else if (data.to) {
                // This message is a pm2-bridge message
                from[data.messageId] = packet.process.name;
                isReply = false;
            } else {
                // Do nothing, this message is not destined for pm2-bridge
                return;
            }

            const to = data.to;
            let prom = Promise.resolve();

            if(!isReply) { // No need to refresh the process list if it is a reply
                prom = updateProcessList();
            }
            prom.then(() => {
                let receiver = processList.find(p => to === p.name);
                if(!receiver && !isReply) {
                    sendError(data, 'Receiver process not found');
                }
                    pm2.sendDataToProcessId(receiver.pm2_env.pm_id, {
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
