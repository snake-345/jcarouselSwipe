'use strict';
let Helper = codecept_helper;

class Swipe extends Helper {
	swipe(selector, xoffset, yoffset) {
		let client = this.helpers['WebDriverIO'].browser;
		xoffset = xoffset || 0;
		yoffset = yoffset || 0;
		return client.moveToObject(selector)
			.buttonDown()
			.moveTo(null, xoffset, yoffset)
			.buttonUp();
	}
}

module.exports = Swipe;
