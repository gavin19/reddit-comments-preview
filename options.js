var topComments = document.querySelector('select[name="topComments"]'),
	sortType = document.querySelector('select[name="sortType"]'),
	eventType = document.querySelector('select[name="eventType"]'),
	topColour = document.querySelector('input[type="color"]');

function save_options() {
	var status = document.querySelector('.status'),
		opts = {
			topComments: topComments.value,
			sortType: sortType.value,
			eventType: eventType.value,
			topColour: topColour.value
		};
	chrome.storage.sync.set({options: opts});
	status.setAttribute('style','display: inline-block');
	status.textContent = "Saved";
	setTimeout(function() {
		status.style.display = 'none';
	}, 2500);
}

function restore_options() {
	chrome.storage.sync.get('options', function(e) {
		if (e.options) {
			topComments.value = e.options.topComments;
			sortType.value = e.options.sortType;
			eventType.value = e.options.eventType;
			topColour.value = e.options.topColour;
		} else {
			topComments.value = 3;
			sortType.value = 'top';
			eventType.value = 'click';
			topColour.value = '#444';
		}
	});
}

document.addEventListener('DOMContentLoaded', restore_options);
document.querySelector('#save').addEventListener('click', save_options);
