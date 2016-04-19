Feature('Check swipes');

Scenario('Check work next buttons', (I) => {
	I.amOnPage('/examples/basic/');
	I.swipe('.jcarousel', -100, 0);
});
