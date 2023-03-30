
# API Design

## RESTful API Design Patterns

### URI Formats

- Use forward slash `(/)` seperator
- Use Hyphens `(-)` Avoid underscores `(_)`
- Don't use a trailing forward slash `(\)`
- Stick to **lowercase** letters

### Carefully use HTTP Methods

- `GET` in case we're fetching or reading Data
- `POST` in case we're creating new data
- `PUT` in case we're updating a whole resource in our data with a new one
- `PATCH` in case we're partially updating a resource
- `DELETE` in case we're deleting existing data

### Formulate well your endpoints

- Include version numbers
- Use consistent sub-domain names

  ```txt
  api.amazing-app.com // for api requests
  dev.amazing-app.com // for development environment
  ```

- Use nouns rather than verbs. Let the HTTP methods do the action

  ```txt
  GET http://api.example.com/v1/users           // DO
  GET http://api.example.com/v1/users/get-users // DONTPOST 

  POST http://api.example.com/v1/users             // DO
  POST http://api.example.com/v1/users/create-user // DONTPUT 

  PUT http://api.example.com/v1/users/:id             // DO
  PUT http://api.example.com/v1/users/update-user/:id // DONTDELETE 

  DELETE http://api.example.com/v1/users/:id             // DO
  DELETE http://api.example.com/v1/users/delete-user/:id // DONTDELETE 

  DELETE http://api.example.com/v1/users/1234       // DO
  GET http://api.example.com/v1/delete-user?id=1234 // DONT
  POST http://api.example.com/v1/1234/delete        // DONT
  ```

- Use singular nouns for document names and plural names for collections and stores.

  ```txt
  http://api.example.com/v1/profiles/customers
  http://api.example.com/v1/profiles/customers/memberstatus
  http://api.example.com/v1/profiles/customers/memberstatus/preferences
  ```

- It is possible to use a verb or a verb phrase for controller resources.

  ```txt
  http://api.example.com/v1/profiles/customers/memberstatus/reset
  http://api.example.com/v1/profiles/customers/memberstatus/activate
  ```
