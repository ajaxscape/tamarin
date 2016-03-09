'use strict';

module.exports = {
    path: 'http://localhost:3021/widgets/:id',
    pageObject: {
        header: ['header', require('./../components/header')],
        nameInput: '#name'
    }
};