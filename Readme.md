# pm2-bridge
pm2-bridge is tiny library that enable you to easily send messages/commands and receive a reply between two pm2 processes.

## Usage

### Install pm2 and pm2-bridge module
```bash
npm i -g pm2
pm2 install pm2-bridge 
```

### Install pm2-bridge client
```bash
npm install pm2-bridge
```

### Sender script

```js
// sender.js
const pm2Bridge = require('pm2-bridge');

setInterval(() => {
    pm2Bridge.send({
        to: 'receiver', // send something to the process with the pm2 name 'receiver'
        data: 'ping' // Send some data along
    }).then(function(message) {
        // Receive the receiver's reply
        console.log(message.data); // pong
    }, function(err) {
        // Something went wrong :(
        // for example the receiver was not found
        console.error(err)
    });
}, 2000);
```

### Receiver script
```js
// receiver.js
const pm2Bridge = require('pm2-bridge');

pm2Bridge.onMessage(function(message, context) {
    console.log(message); // {from: 'sender', data: 'ping'}
    context.reply('pong'); // Reply to the sender
});

```
### Start the scripts and watch them communicate
```bash
pm2 start receiver.js sender.js
pm2 logs
```

## Options
`pm2Bridge.onMessage(function cb(data, context) {console.log(data);})`:

- `data`:
    - `from`: the name of the pm2 process that sent the message
    - `data`: the data that the sender sent along
- `context` :
    - `reply(data)`: You can call this function with your answer data

`pm2Bridge.send(message).then(response => {})`:
- `message`:
    - `data`: the content of the message to be passed
    - `to`: the pm2 name of the process to which the message is destined to
    - `timeout` (optional): response timeout in ms, defaults to 2 seconds. 

`pm2Bridge.send` returns a promise fulfills with the response message, and  rejects when one of the following happens:
- `pm2Bridge.send` was given invalid arguments
- No receiver with the specified pm2 name could be found
- Timeout exceeded. There are 2 possible reasons for this error. (1) The pm2-bridge manager is not launched so it could not handle the message. (2) The receiver received the message but did not reply to it.

# LICENSE
MIT