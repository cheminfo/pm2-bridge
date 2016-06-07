'use strict';

const pm2 = require('pm2');
var messages = [];
var onNewMessage;
var _resolveBridge;
const init = connect().then(launchBus);

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
            return pm2Start(config.scripts).then(function(processes) {
                config.processes = processes;
            });
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
    return pm2Delete('all', options);
}


function pm2Delete(processes, options) {
    options = options || {};
    if(processes instanceof Array) {
        var prom = [];
        for(var i=0; i<processes.length; i++) {
            prom.push(pm2Delete(processes[i]));
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

function pm2Start(processes) {
    if(processes instanceof Array) {
        var prom = [];
        for(let i=0; i<processes.length; i++) {
            prom.push(pm2Start(processes[i]));
        }
        return Promise.all(prom);
    } else {
        return new Promise(function(resolve, reject) {
            pm2.start(processes, function(err) {
                if(err) return reject(err);
                return resolve(processes.name);
            });
        })
    }
}
