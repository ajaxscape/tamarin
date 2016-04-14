'use strict'

// polyfill startsWith
if (!String.prototype.startsWith) {
  // noinspection Eslint
  String.prototype.startsWith = function (searchString, position) {
    position = position || 0
    return this.substr(position, searchString.length) === searchString
  }
}

// This has been written to simulate dynamic loading of pages
// as a testbed for the tamarin module and has deliberate delays

function redirectToLogin (returnPath) {
  history.replaceState({}, 'login', '/login/?return=' + returnPath)
  location.reload(true)
}

function logout () {
  $.localStorage.remove('user')
  redirectToLogin('/')
}

function getView (path) {
  if (path.startsWith('/widgets/')) {
    var widgets = $.localStorage.get('widgets') || []
    var widgetId = path.split('/')[2]
    if (widgets.filter(function (widget) { return widget.id === widgetId }).pop()) {
      return 'widget'
    }
  } else {
    switch (path) {
      case '':
        return 'home'
      case '/login':
        return 'login'
      case '/widgets':
        return 'widgets'
    }
  }
  return 'errors'
}

if (location.pathname.startsWith('/logout')) {
  logout()
}

var user = $.localStorage.get('user')

if (location.pathname.startsWith('/login') || user) {
  if (!location.pathname.startsWith('/login')) {
    $('nav').addClass('logged-in')
    $('nav a')
      .on('click', function (e) {
        e.preventDefault()
        $('.selected').removeClass('selected')
        $(e.currentTarget).addClass('selected')
        setTimeout(function () {
          history.replaceState({}, '', $(e.currentTarget).attr('href'))
          location.reload(true)
        }, 250)
      })
      .filter('[href="' + location.pathname + '"]').addClass('selected')
  }
  var path = location.pathname
  if (path.substr(path.length - 1) === '/') {
    path = path.substr(0, path.length - 1)
  }
  var view = getView(path)
  document.title += ':' + view
  $('#view').load('/templates/' + view + '.html', function () {
    console.log(view + ': loaded')
  })
} else {
  redirectToLogin(location.pathname)
}
