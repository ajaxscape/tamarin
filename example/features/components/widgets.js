'use strict'

module.exports = {
  header: ['header', require('./partials/header')],
  description: '#description',
  widgetName: '#widget_name',
  widgetDesc: '#widget_description',
  addWidget: '#add_widget',
  showModal: '#show_modal',
  widgets: ['#widgets', {
    first: ['li:first-of-type', require('./partials/widget')],
    last: ['li:last-of-type', require('./partials/widget')]
  }]
}
