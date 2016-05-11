'use strict'

displayWidget()

function displayWidget () {
  let widgetId = document.location.pathname.split('/').pop()

  $('.modal').hide()

  $('#widget')
    .html(($.localStorage.get('widgets') || [])
      .filter(function (widget) { return widget.id === widgetId })
      .map(function (widget) {
        return ['',
          '<div class="field">',
          '<label for="widget_name">Name</label>',
          '<input id="widget_name" name="widget_name" type="text" autocorrect="off" value="' + widget.name + '">',
          '</div>',
          '<div class="field">',
          '<label for="widget_description">Description</label>',
          '<input id="widget_description" name="widget_description" type="text" autocorrect="off" value="' + widget.description + '">',
          '</div>',
          ''].join('\n')
      }))
}
