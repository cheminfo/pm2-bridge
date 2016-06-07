# pm2-bridge

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

```js
const pm2Bridge = require('pm2-bridge');

pm2Bridge.send({
    to: 'receiver', // send something to the process with the pm2 name receiver
    data: {message: 'ping'} // Send some data along
}).then(function(data) {
    // Do something with the response
    console.log(data.message); // pong
}, function(err) {
    // Something went wrong :(
    console.error(err)
});

```

```js
const pm2Bridge = require('pm2-bridge');

pm2Bridge.onMessage(function(data) {
    // Do something with the data
    // ...

    console.log(data.data.message); // ping
    // Reply when your done
    this.reply({message: 'pong'});
});
```

## Options
`pm2Bridge.send(data, options)`:
    - `data`:
        - `to`: the pm2 name of the process to which the message is destined to
        - `data`: the content of the message to be passed
    - `options`: 
        - `timeout`: response timeout in ms. If after that the receiver has not responded `send` will be rejected