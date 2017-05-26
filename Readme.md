# pm2-bridge
pm2-bridge is tiny library that enable you to easily send messages/commands and receive a reply between two pm2 processes
## Prerequisites
You will need to have pm2 installed globally
```bash
npm i -g pm2
```

## Usage

### Start the pm2-bridge process
This starts the pm2-bridge manager
```bash
npm i
npm run start
```

### Communicate
Start two other scripts with pm2 and let them communicate together

Sender pm2 script
```js
const pm2Bridge = require('pm2-bridge');

pm2Bridge.send({
    to: 'receiver', // send something to the process with the pm2 name 'receiver'
    data: {message: 'ping'} // Send some data along
}).then(function(data) {
    // Do something with the response
    console.log(data.message); // pong
}, function(err) {
    // Something went wrong :(
    console.error(err)
});

```

Receiver pm2 script
```js
const pm2Bridge = require('pm2-bridge');

pm2Bridge.onMessage((data, context) => {
    // Do something with the data
    // ...

    console.log(data.from); // logs sender's pm2 name
    console.log(data.data.message); // ping
    // Reply using the provided context
    context.reply({message: 'pong'});
});
```

## Options
`pm2Bridge.onMessage(function cb(data, context) {console.log(data);})`:

- `data`:
    - `from`: the name of the pm2 process that sent the message
    - `data`: the data that the sender sent along
- `context` :
    - `reply(data)`: You can call this function with your answer data

`pm2Bridge.send(message).then(response => {console.log(response}`:
- `message`:
    - `data`: the content of the message to be passed
    - `to`: the pm2 name of the process to which the message is destined to
    - `timeout`: response timeout in ms. If after that the receiver has not responded `send` will be rejected
`pm2Bridge.send` returns a promise that resolves with the receiver's response.
`pm2Bridge.send` returns a promise that rejects when one of the following happens:
- `pm2Bridge.send` was given invalid arguments
- No receiver with the specified pm2 name could be found
- Timeout exceeded. There are 2 possible reasons for this error. (1) The pm2-bridge manager is not launched so it could not handle the message. (2) The receiver received the message but did not reply to it.
