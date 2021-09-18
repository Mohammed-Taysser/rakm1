
# js examples

## save on locale storage

```html
<div class="my-3 localstorage" id="localstorage">
    <p>change color by click and save it in locale storage</p>

    <div class="colors d-flex justify-content-center align-items-center">
        <div class="rounded-circle mx-2 bg-danger" data-color='danger'></div>
        <div class="rounded-circle mx-2 bg-primary" data-color='primary'></div>
        <div class="rounded-circle mx-2 bg-success" data-color='success'></div>
        <div class="rounded-circle mx-2 bg-warning" data-color='warning'></div>
    </div>
    <div class="p-5 my-3" id="effect"></div>
</div>
```

```css
.localstorage .colors div{
    width: 30px;
    height: 30px;
    cursor: pointer;
}
```

```js
let colors_elements = document.querySelectorAll('#localstorage .colors div');
let effect_element = document.querySelector('#effect');
let using_color = [];

// if(localStorage.getItem('using_color') !== null){
// effect_element.classList.add(localStorage.getItem('using_color'));
// }else {
// effect_element.classList.add('bg-info');
// }
effect_element.classList.add(localStorage.getItem('using_color') || 'bg-info');

colors_elements.forEach(color => {
    using_color.push('bg-' + color.dataset['color'])
    color.addEventListener('click', function (){
        if(!effect_element.classList.contains('bg-' + this.dataset['color'])){
            effect_element.classList.remove(...using_color);
            effect_element.classList.add('bg-' + this.dataset['color']);
            localStorage.setItem('using_color', 'bg-' + this.dataset['color']);
        }
    }, false);
})
```

## text writer effect

```html
<div class="my-3" id="text_effect">
    <div class="form-group my-3">
        <label for="exampleFormControlTextarea1">write your text</label>
        <textarea class="form-control" id="exampleFormControlTextarea1" rows="3"></textarea>
        <div class="small text-right mt-1">letter <span class="letter_left">0</span></div>
        <button class="btn btn-primary mt-3 done" disabled>Done</button>
    </div>
    <div class="output"></div>
</div>
```

```js
let text_area_input = document.querySelector('#text_effect textarea'), i=0;
let done_btn = document.querySelector('#text_effect .done'), output_write = document.querySelector('#text_effect .output');
text_area_input.oninput = function () {
    document.querySelector('#text_effect .letter_left').textContent = text_area_input.value.length ;
    if(text_area_input.value.length > 0){
        done_btn.disabled = false
    }else {
        done_btn.disabled = true
    }
}
done_btn.onclick = function(){
    text_area_input.disabled = true;
    done_btn.disabled = true
    output_write.textContent = '';
    let text_writer_interval = setInterval(() => {
        if (i > text_area_input.value.length - 1) {
            clearInterval(text_writer_interval);
            text_area_input.disabled = false;
            done_btn.disabled = false
            i = 0;
        }else {
            output_write.textContent += text_area_input.value[i];
            i++;
        }
    }, 100);
}
```

## close button

```html
<div class="section-close-button my-5 py-5">
    <div class="bg-light close-button transition cursor-pointer">
        <div class="bar transition bg-primary mb-2" style="height: 3px;width: 40px;"></div>
        <div class="bar transition bg-warning mb-2" style="height: 3px;width: 40px;"></div>
        <div class="bar transition bg-danger mb-2" style="height: 3px;width: 40px;"></div>
    </div>
</div>
```

```css
.section-close-button {
  width: 50px;
}
.section-close-button .close-button div:first-of-type.transform {
  transform: rotate(-45deg) translate(-10px, 10px);
  -webkit-transform: rotate(-45deg) translate(-10px, 10px);
  -moz-transform: rotate(-45deg) translate(-10px, 10px);
  -ms-transform: rotate(-45deg) translate(-10px, 10px);
  -o-transform: rotate(-45deg) translate(-10px, 10px);
}
.section-close-button .close-button div:nth-of-type(2).transform {
  opacity: 0;
}
.section-close-button .close-button div:last-of-type.transform {
  transform: rotate(45deg) translate(-5px, -5px);
  -webkit-transform: rotate(45deg) translate(-5px, -5px);
  -moz-transform: rotate(45deg) translate(-5px, -5px);
  -ms-transform: rotate(45deg) translate(-5px, -5px);
  -o-transform: rotate(45deg) translate(-5px, -5px);
}
```

```js
$('.section-close-button').on('click', function () {
    $('.section-close-button .close-button div').toggleClass('transform');
});
```

## spinner

```html
<div class="section-spinner">
    <div class="spinner position-relative">
        <div class="rounded-circle position-absolute circle"></div>
        <div class="rounded-circle position-absolute circle"></div>
        <div class="rounded-circle position-absolute circle"></div>
    </div>
</div>
```

```css
.section-spinner{
    height: 100px;
}
.section-spinner .spinner .circle {
  animation: rotate-spinner 0.2s linear infinite;
  -webkit-animation: rotate-spinner 0.2s linear infinite;
  border: 5px solid transparent;
}
.section-spinner .spinner .circle:first-of-type {
  border-top-color: dodgerblue;
  height: 50px;
  width: 50px;
  top: 50px;
  left: 50px;
  animation-duration: 0.85s;
}

.section-spinner .spinner .circle:nth-of-type(2) {
  border-top-color: lawngreen;
  height: 75px;
  width: 75px;
  top: 38px;
  animation-duration: 0.95s;
  left: 38px;
}
.section-spinner .spinner .circle:last-of-type {
  border-top-color: darkorange;
  animation-duration: 1.05s;
  height: 100px;
  width: 100px;
  top: 25px;
  left: 25px;
}

@keyframes rotate-spinner {
  from {
    transform: rotate(0deg);
    -webkit-transform: rotate(0deg);
    -moz-transform: rotate(0deg);
    -ms-transform: rotate(0deg);
    -o-transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
    -webkit-transform: rotate(360deg);
    -moz-transform: rotate(360deg);
    -ms-transform: rotate(360deg);
    -o-transform: rotate(360deg);
  }
}
```

## image border

### effect 1

```html
<div class="section-img-border">
    <div class="position-relative transition img-container img-border-1 mb-3">
        <img src="../assets/images/game.jpg" alt="" class="img-fluid transition">
        <span class="position-absolute transition bg-primary"></span>
        <span class="position-absolute transition bg-info"></span>
        <span class="position-absolute transition bg-warning"></span>
        <span class="position-absolute transition bg-danger"></span>
    </div>
</div>
```

### effect 2

```html
<div class="section-img-border">
    <div class="position-relative transition img-container img-border-2">
        <img src="../assets/images/game.jpg" alt="" class="img-fluid transition">
        <span class="position-absolute transition bg-primary"></span>
        <span class="position-absolute transition bg-info"></span>
        <span class="position-absolute transition bg-warning"></span>
        <span class="position-absolute transition bg-danger"></span>
    </div>
</div>
```

```css
.section-img-border .img-container.img-border-1 span:nth-of-type(1),
.section-img-border .img-container.img-border-2 span:nth-of-type(1) {
  left: 0;
  top: 0;
  height: 0;
  width: 3px;
}
.section-img-border .img-container.img-border-1 span:nth-of-type(2),
.section-img-border .img-container.img-border-2 span:nth-of-type(2) {
  left: 0;
  bottom: 0;
  width: 0;
  height: 3px;
}
.section-img-border .img-container.img-border-1 span:nth-of-type(3),
.section-img-border .img-container.img-border-2 span:nth-of-type(3) {
  right: 0;
  bottom: 0;
  height: 0;
  width: 3px;
}
.section-img-border .img-container.img-border-1 span:nth-of-type(4),
.section-img-border .img-container.img-border-2 span:nth-of-type(4) {
  right: 0;
  top: 0;
  width: 0;
  height: 3px;
}

.section-img-border .img-container.img-border-1:hover span:nth-of-type(1),
.section-img-border .img-container.img-border-1:hover span:nth-of-type(3) {
  height: 100%;
}
.section-img-border .img-container.img-border-1:hover span:nth-of-type(2),
.section-img-border .img-container.img-border-1:hover span:nth-of-type(4) {
  width: 100%;
}
.section-img-border .img-container.img-border-1:hover img {
  opacity: 0.5;
  transition-delay: 0.3s;
}

.section-img-border .img-container.img-border-2:hover span:nth-of-type(1) {
  height: 100%;
}
.section-img-border .img-container.img-border-2:hover span:nth-of-type(2) {
  width: 100%;
  transition-delay: 0.5s;
}

.section-img-border .img-container.img-border-2:hover span:nth-of-type(3) {
  height: 100%;
  transition-delay: 1s;
}
.section-img-border .img-container.img-border-2:hover span:nth-of-type(4) {
  width: 100%;
  transition-delay: 1.5s;
}
.section-img-border .img-container.img-border-2:hover img {
  transition-delay: 1.5s;
  opacity: 0.5;
}
```

## input effect

```html
<div class="section-input-effect">
    <div class="position-relative">
        <input type="text" class="form-control effect" id="input-name-1" required>
        <label for="input-name-1">user name</label>
    </div>
</div>
```

```css
.section-input-effect .effect ~ label {
  position: absolute;
  left: 14px;
  width: 100%;
  pointer-events: none;
  top: 8px;
  font-size: 1rem;
  color: #aaa;
  transition: 0.3s;
}
.section-input-effect .effect:focus ~ label,
.section-input-effect .has-content.effect ~ label {
  top: -30px;
  left: 0;
  /* font-size: 0.9rem; */
  font-weight: 400;
  color: #212529;
  transition: 0.3s;
}
```

```js
$('.section-input-effect input.effect').focusout(function () {
    if ($(this).val() != '') {
        $(this).addClass('has-content');
    } else {
        $(this).removeClass('has-content');
    }
});
```
