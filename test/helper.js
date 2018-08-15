'use strict';

const pm2 = require('pm2');

var messages = [];
var onNewMessage;
const init = connect().then(launchBus);
const processes = new Set();

function connect() {
  return new Promise(function (resolve, reject) {
    pm2.connect(function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

function disconnect() {
  pm2.disconnect();
}

function launchBus() {
  return new Promise(function (resolve, reject) {
    pm2.launchBus(function (err, bus) {
      if (err) {
        reject(err);
        return;
      }
      bus.on('pm2-bridge:test', function (packet) {
        messages.push(packet);
        onNewMessage(messages);
      });
      resolve();
    });
  });
}

function pm2List() {
  return new Promise(function (resolve, reject) {
    pm2.list(function (err, res) {
      if (err) return reject(err);
      return resolve(res);
    });
  });
}

module.exports = {
  test(config) {
    config = Object.assign({}, config);
    return init
      .then(launchScripts)
      .then(listenEvents)
      .then(checkResults)
      .then(() => pm2DeleteAll({ ingoreError: true }))
      .catch(close);

    function launchScripts() {
      return pm2Start(config.scripts);
    }

    function listenEvents() {
      return new Promise(function (resolve, reject) {
        onNewMessage = function (messages) {
          if (messages.length === config.expect.length) {
            resolve();
          }
        };
        setTimeout(function () {
          reject(new Error('event timeout'));
        }, 3000);
      });
    }

    function checkResults() {
      expect(config.expect).toEqual(messages.map((m) => m.data));
      messages = [];
    }

    function close(err) {
      return pm2DeleteAll({
        ignoreError: true
      }).then(
        () => {
          throw err;
        },
        () => {
          throw err;
        }
      );
    }
  },
  disconnect
};

function pm2DeleteAll(options) {
  return pm2Delete(processes, options);
}

function pm2Delete(proc, options) {
  options = options || {};
  if (proc instanceof Set) {
    var prom = [];
    for (let processName of proc) {
      prom.push(pm2Delete(processName));
    }
    return Promise.all(prom);
  } else {
    return new Promise(function (resolve, reject) {
      pm2.delete(proc, function (err) {
        processes.delete(proc);
        if (!options.ignoreError && err) return reject(err);
        // It seems that pm2 process is not always actually off
        // when this callback is called
        setTimeout(resolve, 100);
      });
    });
  }
}

function pm2Start(proc) {
  if (proc instanceof Array) {
    var prom = [];
    for (let i = 0; i < proc.length; i++) {
      prom.push(
        pm2Start(proc[i]).then((processName) => processes.add(processName))
      );
    }
    return Promise.all(prom);
  } else {
    return new Promise(function (resolve, reject) {
      pm2.start(proc, function (err) {
        if (err) {
          return reject(err);
        }
        return resolve(proc.name);
      });
    });
  }
}
