'use strict'

/*global faker*/

displayWidgets()

function displayWidgets () {
  $('.modal').hide()

  $('#widgets')
    .html(($.localStorage.get('widgets') || [])
      .map(function (widget) {
        return '<li id="' + widget.id + '"><a href="/widgets/' + widget.id + '" title="' + widget.description + '">' + widget.name + '</a><button type="button" class="remove_widget">-</button></li>'
      }).join('\n'))
}

$('#add_widget').on('click', function (event) {
  event.preventDefault()
  var $name = $('#widget_name')
  var $desc = $('#widget_description')
  var widget = {
    id: faker.random.uuid(),
    name: $name.val(),
    description: $desc.val()
  }
  $name.val('')
  $desc.val('')
  var widgets = $.localStorage.get('widgets') || []
  widgets.push(widget)
  $.localStorage.set('widgets', widgets)
  displayWidgets()
})

$('#cancel').on('click', function (event) {
  event.preventDefault()
  $('#widget_name').val('')
  $('#widget_description').val('')
  displayWidgets()
})

$('#show_modal').on('click', function (event) {
  event.preventDefault()
  $('.modal').show()
})

$('#widgets').on('click', '.remove_widget', function (event) {
  event.preventDefault()
  var widgetId = $(event.currentTarget).parent()[0].id
  $.localStorage.set('widgets', $.localStorage.get('widgets').filter(function (widget) {
    return widget.id !== widgetId
  }))
  displayWidgets()
})
