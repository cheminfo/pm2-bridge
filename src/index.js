'use strict';

var count = 0;
var pid = process.pid;
var pendingReply = new Map();
var callbacks = [];
const defaultOptions = {
    timeout: 2000
};

function getThisCb(packet) {
    return {
        reply: function (data) {
            var toReply = {
                type: 'pm2-bridge',
                data: {
                    data: data,
                    messageId: packet.messageId
                }
            };
            process.send(toReply);
        }
    }
}

process.on('message', function (packet) {
    var pending = pendingReply.get(packet.messageId);
    if (pending) {
        if(packet.error) { // pm2-bridge error
            pending.reject(new Error(packet.error));
        } else if(packet.data.data.error) { // user error
            pending.reject(new Error(packet.data.data.error));
        } else { // success
            pending.resolve(packet.data.data);
        }
    } else {
            for (let i = 0; i < callbacks.length; i++) {
                callbacks[i].call(getThisCb(packet), packet.data);
            }
    }
});

module.exports = {
    onMessage(cb) {
        callbacks.push(cb);
    },

    send(message) {
        message = Object.assign({}, defaultOptions, message);

        var id = pid + '_' + count++;
        message.messageId = id;
        return new Promise(function (resolve, reject) {
            if(!process.send) {
                return reject(new Error('No process.send, make sure to start this script with pm2'));
            }
            if(!message.to) {
                return reject(new Error('to is mandatory'));
            }
            if(!message.data) {
                return reject(new Error('data is mandatory'));
            }
            pendingReply.set(id, {resolve, reject});
            var toSend = {
                type: 'pm2-bridge',
                data: message
            };
            process.send(toSend);

            setTimeout(function () {
                reject(new Error('timeout exceeded'));
                pendingReply.delete(id);
            }, message.timeout);
        });

    }
};
