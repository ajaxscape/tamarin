'use strict'

var validUser = $.localStorage.get('validUser') || {username: 'username', password: 'password'}

$('button[type="submit"]').on('click', function (event) {
  event.preventDefault()
  if ($('#username').val() === validUser.username && $('#password').val() === validUser.password) {
    $.localStorage.set('user', validUser)
    document.location = $.query.get('return')
  } else {
    $('.login-error').text('Invalid username or password')
  }
})
