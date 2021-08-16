
# authentication

## User objects

The primary attributes of the default user

- `username`
- `password`
- `email`
- `first_name`
- `last_name`

## Authenticating users

```python
from django.contrib.auth import authenticate
user = authenticate(username='john', password='secret')
if user is not None:
    # A backend authenticated the credentials
else:
    # No backend authenticated the credentials
```

## How to log a user in

```python
from django.contrib.auth import authenticate, login

def my_view(request):
    username = request.POST['username']
    password = request.POST['password']
    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        # Redirect to a success page.
        ...
    else:
        # Return an 'invalid login' error message.
        ...
```

## How to log a user out

doesn’t throw any errors if the user wasn’t logged in

```python
from django.contrib.auth import logout

def logout_view(request):
    logout(request)
    # Redirect to a success page.
```

## Limiting access to logged-in users

- The raw way

    ```python
    from django.conf import settings
    from django.shortcuts import redirect

    def my_view(request):
        if not request.user.is_authenticated:
            return redirect('%s?next=%s' % (settings.LOGIN_URL, request.path))
        # ...

    
    # …or display an error message:

    from django.shortcuts import render

    def my_view(request):
        if not request.user.is_authenticated:
            return render(request, 'myapp/login_error.html')
        # ...
    ```

- The `login_required` decorator
    If the user isn’t logged in, redirect to `settings.LOGIN_URL`, passing the current absolute path in the query string

    ```python
    from django.contrib.auth.decorators import login_required

    @login_required
    def my_view(request):
        ...
    ```

    `@login_required(login_url='/accounts/login/')`

    **Note** that if you don’t specify the `login_url` parameter, you’ll need to ensure that the `settings.LOGIN_URL`

- The `LoginRequired` mixin
- The `permission_required` decorator
