tinynews-api
=========

A RESTful API server providing data access to both Frontend ajax operations and at some point, third-party operations.
Uses [tinynews-common](https://github.com/mlightning/tinynews-common)

Conventions
----

In most cases, CRUD operations map to their http 1.1 method counterparts.  That means that in true RESTful style, Create = POST, Retrieve = GET, Update = PUT, & Delete = DELETE. In the case of listings, we use a pluralized GET such as `GET /users`.
All requests are expected to be of type `application/json`, with the obvious exceptions of GET & DELETE methods.
All responses are in JSON.

Testing
----

Summarized:  

    grunt test

Full Report:  

    grunt test_report

Authentication
----

    Coming soon...

Endpoints
----

Most of the models found in **tinynews-common** are represented with this API.

#### Users

`GET /users`
`POST /user`
`GET /user/:user_id`
`PUT /user/:user_id`
`DELETE /user/:user_id`

#### User Profiles

`GET /user/:user_id/profile`
`PUT /user/:user_id/profile`

#### Articles

`GET /articles`
`POST /article`
`GET /article/:article_id`
`PUT /article/:article_id`
`DELETE /article/:article_id`

#### Journalists

`GET /journalists`
`POST /journalist`
`GET /journalist/:journalist_id`
`PUT /journalist/:journalist_id`
`DELETE /journalist/:journalist_id`

#### Publishers

`GET /publishers`
`POST /publisher`
`GET /publisher/:pub_id`
`PUT /publisher/:pub_id`
`DELETE /publisher/:pub_id`
