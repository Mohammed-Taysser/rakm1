$(function () {
	'use strict';
	bsCustomFileInput.init();
	$('[data-toggle="tooltip"]').tooltip();
	$('[data-toggle="popover"]').popover();

	// change color by click and save it in locale storage 
	let colors_elements = document.querySelectorAll('#localstorage .colors div');
	let effect_element = document.querySelector('#effect');
	let using_color = [];

	// if(localStorage.getItem('using_color') !== null){
	// 	effect_element.classList.add(localStorage.getItem('using_color'));
	// }else {
	// 	effect_element.classList.add('bg-info');
	// }
	effect_element.classList.add(localStorage.getItem('using_color') || 'bg-info');

	colors_elements.forEach(color => {
		using_color.push('bg-' + color.dataset['color'])
		color.addEventListener('click', function () {
			if (!effect_element.classList.contains('bg-' + this.dataset['color'])) {
				effect_element.classList.remove(...using_color);
				effect_element.classList.add('bg-' + this.dataset['color']);
				localStorage.setItem('using_color', 'bg-' + this.dataset['color']);
			}
		}, false);
	})

	// text effect writer
	let text_area_input = document.querySelector('#text_effect textarea'), i = 0;
	let done_btn = document.querySelector('#text_effect .done'), output_write = document.querySelector('#text_effect .output');
	text_area_input.oninput = function () {
		document.querySelector('#text_effect .letter_left').textContent = text_area_input.value.length;
		if (text_area_input.value.length > 0) {
			done_btn.disabled = false
		} else {
			done_btn.disabled = true
		}
	}
	done_btn.onclick = function () {
		text_area_input.disabled = true;
		done_btn.disabled = true
		output_write.textContent = '';
		let text_writer_interval = setInterval(() => {
			if (i > text_area_input.value.length - 1) {
				clearInterval(text_writer_interval);
				text_area_input.disabled = false;
				done_btn.disabled = false
				i = 0;
			} else {
				output_write.textContent += text_area_input.value[i];
				i++;
			}
		}, 100);
	}

	// --------------------- close button 
	$('.section-close-button').on('click', function () {
		$('.section-close-button .close-button div').toggleClass('transform');
	});

	// -------------- input effect
	$('.section-input-effect input.effect').focusout(function () {
		if ($(this).val() != '') {
			$(this).addClass('has-content');
		} else {
			$(this).removeClass('has-content');
		}
	});
});