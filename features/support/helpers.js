'use strict';

var request = require('superagent'),
    fs = require('fs'),
    faker = require('faker'),
    yaml = require('js-yaml'),
    config = yaml.safeLoad(fs.readFileSync('./features/config.yml', 'utf8')),
    auth;

module.exports = {

    getHost: function () {
        return config.host;
    },

    getCurrentUser: function(){
        return {
            email: config.email,
            password: config.password
        };
    },

    createUser: function (callback) {
        getAuth().then(() => {
                request
                    .post(config.platform + '/profiles')
                    .set('Content-Type', 'application/vnd.mendeley-new-profile.1+json')
                    .set('Authorization', 'Bearer ' + auth.access_token)
                    .send({
                        first_name: faker.name.firstName(),
                        last_name: faker.name.lastName(),
                        email: config.email.replace('@', '+' + Date.now() + '@'),
                        password: config.password,
                        discipline: config.discipline,
                        academic_status: '',
                        institution_id: config.institution_id,
                        marketing: false
                    })
                    .set('Accept', 'application/vnd.mendeley-profiles.1+json')
                    .end(callback);
            }
        );
    },

    createSubmission: function(callback) {
        getAuth().then(() => {
                request
                    .post(config.platform + '/submissions')
                    .set('Content-Type', 'application/vnd.mendeley-submission-creation-request.1+json')
                    .set('Authorization', 'Bearer ' + auth.access_token)
                    .send({
                        journal_id: config.journal_id
                    })
                    .set('Accept', 'application/vnd.mendeley-submission-creation-result.1+json')
                    .end(callback);
            }
        );
    }

};

function getAuth() {
    return new Promise(function (resolve) {
            request.post(config.platform + '/oauth/authorize')
                .redirects(0)
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .send({
                    username: config.email,
                    password: config.password
                })
                .query({
                    client_id: config.client_id,
                    redirect_uri: config.host,
                    response_type: 'code',
                    scope: 'all'
                })
                .end(function (err, res) {
                    var code = res.headers.location.split('?code=')[1] || false;
                    request.post(config.platform + '/oauth/token')
                        .set('Content-Type', 'application/x-www-form-urlencoded')
                        .send({
                            grant_type: 'authorization_code',
                            code: code,
                            client_id: config.client_id,
                            client_secret: config.client_secret,
                            redirect_uri: config.host
                        })
                        .end(function (err, res) {
                            auth = {
                                email: config.email,
                                access_token: res.body.access_token,
                                expires_in: res.body.expires_in,
                                refresh_token: res.body.refresh_token,
                                created: Math.floor(Date.now() / 1000)
                            };
                            resolve(auth);
                        });
                });
        });
}