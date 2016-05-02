Feature('Check swipes');

Scenario('Check work swipes', (I) => {
	I.amOnPage('/tests/pages/default/');
	I.swipe('.jcarousel', -100, 0);
	I.waitToHide('.slide-1', 2);
	I.seeElement('.slide-2');
	I.swipe('.jcarousel', -100, 0);
	I.waitToHide('.slide-2', 2);
	I.seeElement('.slide-3');
});
