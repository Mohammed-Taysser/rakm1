
# What's AJAX?

AJAX stands for Asynchronous JavaScript And XML.

- Make requests to the server without reloading the page
- Receive and work with data from the server

## main structure

ready state

    0 : request not initialized
    1 : server connection established
    2 : request received
    3 : processing request
    4 : request is finished and response is ready

```js
let my_request = new XMLHttpRequest();
my_request.onreadystatechange = function(){
    if(this.readyState === 4 && this.status === 200){
        console.log(JSON.parse(this.responseText));
    }
}
// XMLHttpRequest(method, url, async, user, password)
my_request.open('Get', 'https://api.github.com/users/Mohammed-Taysser/repos', true);
my_request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
my_request.send();
```

### other example with `try & catch`

```js
function alertContents() {
  try {
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
      if (httpRequest.status === 200) {
        alert(httpRequest.responseText);
      } else {
        alert('There was a problem with the request.');
      }
    }
  }
  catch( e ) {
    alert('Caught Exception: ' + e.description);
  }
}
```

### explain

- The first parameter of the call to `open()` is the HTTP request method – `GET`, `POST`, `HEAD`, or another method supported by your server. Keep the method all-**capitals** as per the HTTP standard, otherwise some browsers (like Firefox) might not process the request. For more information on the possible HTTP request methods
- The optional third parameter sets whether the request is asynchronous. If true (the default), JavaScript execution will continue and the user can interact with the page while the server response has yet to arrive. This is the first A in AJAX.

## using jQuery

```js
$.ajax({
    datatype : 'json',  // expected data type from server
    username, 'mo',
    password: '',
    contentType: 'multipart/form-data',     // default application/x-www-form-urlencoded
    cache: false,       // default true
    async : false,
    method: 'POST',
    url : 'auth.php',
    data : {name: 'mohammed', age: 22},
    beforeSend: function(xhr){
        // before send the request
    },
    success : function(data, status, xhr){
        // here when request is success
    },
    error : function(xhr, status, error_message){
        // here when request is error
    },
    complete : function(xhr, status){
        // here when request is complete
    },
});
```

## resources

- [developer.mozilla](https://developer.mozilla.org/en-US/docs/Web/Guide/AJAX/Getting_Started)
