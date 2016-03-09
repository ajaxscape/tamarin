'use strict';

module.exports = {
    path: 'http://localhost:3021/widgets',
    pageObject: {
        header: ['header', require('./../components/header')],
        description: '#description',
        widgets: '#toys'
    }
};