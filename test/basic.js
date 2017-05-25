'use strict';

const helper = require('./helper');

describe('basic', function () {
    it('tests fail on travis', function () {
        throw new Error('travis test error');
    });
    it('simple send and reply with no data', function () {
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

    it('simple send and reply with data', function () {
        return helper.test({
            expect: [{from: 'sender', data: {test: 1}}, {test: 1}],
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
    
    it('times out', function () {
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

    it('no receiver', function () {
        return helper.test({
            expect: ['error: Receiver process not found'],
            scripts: [
                {
                    name: 'sender',
                    script: 'test/scripts/basic/sender.js'
                }
            ]
        })
    });

    it('no to', function () {
        return helper.test({
            expect: ['error: to is mandatory'],
            scripts: [
                {
                    name: 'sender',
                    script: 'test/scripts/basic/senderNoTo.js'
                }
            ]
        })
    });

    it('no data', function () {
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

    it('reply error', function () {
        return helper.test({
            expect: [{from: 'sender', data: {test: 1}}, 'error: receiver replied with error'],
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
    })
});