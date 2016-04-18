
Feature('test');

Scenario('test something', (I) => {
	I.amOnPage('/examples/basic/');
	I.see('Basic carousel');
});
