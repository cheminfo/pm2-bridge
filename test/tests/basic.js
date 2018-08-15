'use strict';

const helper = require('../helper');

afterAll(() => helper.disconnect());

describe('basic', () => {
  test('simple send and reply with no data', () => {
    return helper.test({
      expect: ['success: receiver received', 'success: sender received reply'],
      scripts: [
        {
          name: 'receiver',
          script: 'test/scripts/basic/receiver.js'
        },
        {
          name: 'sender',
          script: 'test/scripts/basic/sender.js'
        }
      ]
    });
  });

  test('simple send and reply with data', () => {
    return helper.test({
      expect: [{ from: 'sender', data: { test: 1 } }, { data: { test: 2 } }],
      scripts: [
        {
          name: 'receiver',
          script: 'test/scripts/basic/receiverWithData.js'
        },
        {
          name: 'sender',
          script: 'test/scripts/basic/senderWithData.js'
        }
      ]
    });
  });

  test('times out', () => {
    return helper.test({
      expect: ['error: timeout exceeded', 'success: receiver received'],
      scripts: [
        {
          name: 'receiver',
          script: 'test/scripts/basic/receiver.js'
        },
        {
          name: 'sender',
          script: 'test/scripts/basic/senderTimeout0.js'
        }
      ]
    });
  });

  test('no receiver', () => {
    return helper.test({
      expect: ['error: Receiver process not found'],
      scripts: [
        {
          name: 'sender',
          script: 'test/scripts/basic/sender.js'
        }
      ]
    });
  });

  test('no to', () => {
    return helper.test({
      expect: ['error: to is mandatory'],
      scripts: [
        {
          name: 'sender',
          script: 'test/scripts/basic/senderNoTo.js'
        }
      ]
    });
  });

  test('no data', () => {
    return helper.test({
      expect: ['error: data is mandatory'],
      scripts: [
        {
          name: 'sender',
          script: 'test/scripts/basic/senderNoData.js'
        }
      ]
    });
  });

  test('reply error', () => {
    return helper.test({
      expect: [
        { from: 'sender', data: { test: 1 } },
        'error: receiver replied with error'
      ],
      scripts: [
        {
          name: 'receiver',
          script: 'test/scripts/basic/replyError.js'
        },
        {
          name: 'sender',
          script: 'test/scripts/basic/senderWithData.js'
        }
      ]
    });
  });
});
