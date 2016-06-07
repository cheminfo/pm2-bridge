'use strict';

const pm2 = require('pm2');
var messages = [];
var onNewMessage;
var _resolveBridge;
const init = connect().then(launchBus);
const processes = new Set();

function connect() {
    return new Promise(function(resolve, reject) {
        pm2.connect(function(err) {
            if(err) return reject(err);
            resolve();
        });
    });
}

function launchBus() {
    return new Promise(function(resolve, reject) {
        pm2.launchBus(function(err, bus) {
            if(err) return reject(err);
            bus.on('pm2-bridge:test', function(packet) {
                messages.push(packet);
                onNewMessage(messages);
            });
            bus.on('pm2-bridge:ready', resolveBridge);
            resolve();
        });
    });
}

function resolveBridge() {
    _resolveBridge();
}

function startPm2Bridge() {
    return new Promise(function(resolve, reject) {
        _resolveBridge = resolve;
        pm2.start('bin/start.js', {
            name: 'pm2-bridge'
        }, function(err, proc) {
            if(err) {
                return reject(err);
            }
            processes.add('pm2-bridge');
        });
    });
}

module.exports = {

    test(config) {
        config = Object.assign({}, config);
        return init
            .then(startPm2Bridge)
            .then(launchScripts)
            .then(listenEvents)
            .then(checkResults)
            .then(pm2DeleteAll)
            .catch(close);

        function launchScripts() {
            return pm2Start(config.scripts);
        }

        function listenEvents() {
            return new Promise(function(resolve, reject) {
                onNewMessage = function(messages) {
                    if(messages.length === config.expect.length) {
                        resolve();
                    }
                };
                setTimeout(function() {
                    reject(new Error('event timeout'));
                }, 3000)
            })
        }
        
        function checkResults() {
            config.expect.should.deepEqual(messages.map(m => m.data));
            messages = [];
        }

        function close(err) {
            return pm2DeleteAll({
                ignoreError:true
            }).then(() => {
                throw err;
            }, () => {
                throw err;
            });
        }
    }
};

function pm2DeleteAll(options) {
    return pm2Delete(processes, options);
}


function pm2Delete(processes, options) {
    options = options || {};
    if(processes instanceof Set) {
        var prom = [];
        for(let processName of processes) {
            prom.push(pm2Delete(processName));
        }
        return Promise.all(prom);
    } else {
        return new Promise(function(resolve, reject) {
            pm2.delete(processes, function(err) {
                if(!options.ignoreError && err) return reject(err);
                return resolve();
            })
        });
    }
}

function pm2Start(proc) {
    if(proc instanceof Array) {
        var prom = [];
        for(let i=0; i<proc.length; i++) {
            prom.push(pm2Start(proc[i]).then(processName => processes.add(processName)));
        }
        return Promise.all(prom);
    } else {
        return new Promise(function(resolve, reject) {
            pm2.start(proc, function(err) {
                if(err) return reject(err);
                return resolve(proc.name);
            });
        });
    }
}
