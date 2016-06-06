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
        if(packet.error) {
            pending.reject(new Error(packet.error));
        } else {
            pending.resolve(packet.data);
        }
    } else {
            for (let i = 0; i < callbacks.length; i++) {
                callbacks[i].call(getThisCb(packet), packet);
            }
    }
});

module.exports = {
    onMessage(cb) {
        callbacks.push(cb);
    },

    send(data, options) {
        options = Object.assign({}, defaultOptions, options);
        var message = {
            to: data.to,
            data: data.data
        };
        var id = pid + '_' + count++;
        message.messageId = id;
        return new Promise(function (resolve, reject) {
            pendingReply.set(id, {resolve, reject});
            var toSend = {
                type: 'pm2-bridge',
                data: message
            };
            process.send(toSend);

            setTimeout(function () {
                reject(new Error('No response after timeout'));
                pendingReply.delete(id);
            }, options.timeout);
        });

    }
};
