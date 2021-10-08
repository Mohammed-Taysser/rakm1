
# useful bug-killing tool

## Overview and a quick example

```python
>>> from django.test import Client
>>> c = Client()
>>> response = c.post('/arabic-blog/login', {'username': 'root', 'password': 'root'})
>>> response.status_code
302
>>> response = c.get('/arabic-blog/profile')
>>> response.content
b'<!DOCTYPE html...'
```

if, for some reason, you want the test client to perform CSRF checks, you can create an instance of the test client that enforces CSRF checks. To do this, pass in the enforce_csrf_checks argument when you construct your client:

```python
>>> from django.test import Client
>>> csrf_client = Client(enforce_csrf_checks=True)
```

## Making requests

Use the django.test.Client class to make requests.

```python
class Client(enforce_csrf_checks=False, json_encoder=DjangoJSONEncoder, **defaults)
```

- send a User-Agent HTTP header in each request

    c = Client(HTTP_USER_AGENT='Mozilla/5.0')

    Once you have a Client instance, you can call any of the following methods:

  - `get(path, data=None, follow=False, secure=False, **extra)`

    ```python
    c = Client()
    c.get('/customers/details/', {'name': 'fred', 'age': 7})

    # equivalent to:
    # /customers/details/?name=fred&age=7
    ```

    The `extra` keyword arguments parameter can be used to specify headers to be sent in the request

    ```python
    c.get('/customers/details/', {'name': 'fred', 'age': 7}, HTTP_ACCEPT='application/json')
    # equal to
    c.get('/customers/details/?name=fred&age=7'
    ```

    If you set `follow` to True the client will follow any redirects and a `redirect_chain` attribute will be set in the response object containing tuples of the intermediate urls and status codes.

    If you had a URL `/redirect_me/` that redirected to `/next/`, that redirected to `/final/`, this is what you’d see:

    ```python
    >>> response = c.get('/redirect_me/', follow=True)
    >>> response.redirect_chain
    [('http://testserver/next/', 302), ('http://testserver/final/', 302)]
    ```

    If you set secure to True the client will emulate an HTTPS request

  - `post(path, data=None, content_type=MULTIPART_CONTENT, follow=False, secure=False, **extra)`

    ```python
    c = Client()
    c.post('/login/', {'name': 'fred', 'passwd': 'secret'})
    # evaluation to /login/ with post data name=fred&passwd=secret
    ```

    If you provide content_type as `application/json`, the data is serialized using `json.dumps()` if it’s a `dict`, `list`, or `tuple`. `Serialization` is performed with `DjangoJSONEncoder` by default, and can be overridden by providing a `json_encoder` argument to Client. This `serialization` also happens for `put()`, `patch()`, and `delete()` requests.

    If you don’t provide a value for `content_type`, the values in data will be transmitted with a content type of `multipart/form-data`. In this case, the key-value pairs in data will be encoded as a multipart message and used to create the `POST` data payload.

  - `head(path, data=None, follow=False, secure=False, **extra)`
  - `options(path, data='', content_type='application/octet-stream', follow=False, secure=False, **extra)`
  - `put(path, data='', content_type='application/octet-stream', follow=False, secure=False, **extra)`
  - `patch(path, data='', content_type='application/octet-stream', follow=False, secure=False, **extra)`
  - `delete(path, data='', content_type='application/octet-stream', follow=False, secure=False, **extra)`
  - `trace(path, follow=False, secure=False, **extra)`
  - `login(**credentials)`

    ```python
    >>> c = Client()
    >>> c.login(username='fred', password='secret')

    # Now you can access a view that's only available to logged-in users.
    ```
  
    login() returns True if it the credentials were accepted and login was successful.

  - `force_login(user, backend=None)`

    If your site uses Django’s authentication system, you can use the `force_login()` method to simulate the effect of a user logging into the site. Use this method instead of `login()` when a test requires a user be logged in and the details of how a user logged in aren’t important.

    Unlike `login()`, this method skips the authentication and verification steps: inactive users `(is_active=False)` are permitted to login and the user’s credentials don’t need to be provided.

  - `logout()`

## Testing responses

The `get()` and `post()` methods both return a Response object. This Response object is not the same as the HttpResponse object returned by Django views; the test response object has some additional data useful for test code to verify.

### class Response

- `client` test client that was used to make the request
- `content`  body of the response
- `context` The template Context instance that was used to render the template

  ```python
  >>> response = client.get('/foo/')
  >>> response.context['name']
  'Arthur'
  ```

- `exc_info` A tuple of three values that provides information about the unhandled exception (type, value, traceback)
- `json(**kwargs)`

  If the Content-Type header is not "`application/json`", then a `ValueError` will be raised when trying to parse the response.

  ```python
  >>> response = client.get('/foo/')
  >>> response.json()['name']
  'Arthur'
  ```

- `request`
- `wsgi_request`
- `status_code`
- `templates` A list of Template instances used to render the final content use template.name to get the template’s file name
- `resolver_match`

  An instance of ResolverMatch for the response. You can use the func attribute, for example, to verify the view that served the response

  ```python
  # my_view here is a function based view
  self.assertEqual(response.resolver_match.func, my_view)

  # class-based views need to be compared by name, as the functions
  # generated by as_view() won't be equal
  self.assertEqual(response.resolver_match.func.__name__, MyView.as_view().__name__)
  ```

## Persistent state

- Client.cookies
- Client.session

  ```python
  def test_something(self):
      session = self.client.session
      session['somekey'] = 'test'
      session.save()
  ```

## Example

```python
import unittest
from django.test import Client

class SimpleTest(unittest.TestCase):
    def setUp(self):
        # Every test needs a client.
        self.client = Client()

    def test_details(self):
        # Issue a GET request.
        response = self.client.get('/customer/details/')

        # Check that the response is 200 OK.
        self.assertEqual(response.status_code, 200)

        # Check that the rendered context contains 5 customers.
        self.assertEqual(len(response.context['customers']), 5)
```

## Provided test case classes

- SimpleTestCase

  A subclass of `unittest.TestCase`

- TransactionTestCase
- TestCase
- LiveServerTestCase
