'use strict'

// This has been written to simulate dynamic loading of pages
// as a testbed for the tamarin module and has deliberate delays

if (location.pathname === '/login' || $.localStorage.get('user')) {
  var view = 'errors'
  if (location.pathname !== '/login') {
    $('nav').addClass('logged-in')
    $('nav a')
      .on('click', function (e) {
        e.preventDefault()
        $('.selected').removeClass('selected')
        $(e.currentTarget).addClass('selected')
        setTimeout(function () {
          if ($(e.currentTarget).hasClass('logout-link')) {
            $.localStorage.remove('user')
            location.pathname = '/'
          } else {
            location = $(e.currentTarget).attr('href')
          }
        }, 250)
      })
      .filter('[href="' + location.pathname + '"]').addClass('selected')
  }
  switch (location.pathname) {
    case '/':
      view = 'home'
      break
    case '/login':
      view = 'login'
      break
    case '/widgets':
      view = 'widgets'
      break
    case '/widgets/widget-1':
      view = 'widget'
      break
  }
  document.title += ':' + view
  $('#view').load('/templates/' + view + '.html', function () {
    console.log(view + ': loaded')
  })
} else {
  location = '/login?return=' + location.pathname
}
