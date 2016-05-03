Feature('Check swipes');

Scenario('Check work swipes', (I) => {
	I.amOnPage('/tests/pages/default/');
	I.swipe('.jcarousel', -100, 0);
	I.waitToHide('.slide-1', 2);
	I.seeElement('.slide-2');
	I.swipe('.jcarousel', -100, 0);
	I.waitToHide('.slide-2', 2);
	I.seeElement('.slide-3');
	I.swipe('.jcarousel', 100, 0);
	I.waitToHide('.slide-3', 2);
	I.seeElement('.slide-2');
	I.swipe('.jcarousel', 100, 0);
	I.waitToHide('.slide-2', 2);
	I.seeElement('.slide-1');
	I.swipe('.jcarousel', -1000, 0);
	I.waitToHide('.slide-2', 2);
	I.seeElement('.slide-3');
	I.swipe('.jcarousel', -1000, 0);
	I.waitToHide('.slide-4', 2);
	I.seeElement('.slide-5');
});
