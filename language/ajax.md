
# main structure

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
my_request.send();
```

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
