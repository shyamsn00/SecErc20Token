const SEC = artifacts.require("SEC");

contract("SEC", accounts => 
{
	it("should put 100000 * 10 ** 18 SEC in the deployer's account", () =>
	  SEC.deployed()
		.then(instance => instance.balanceOf.call(accounts[0]))
		.then(balance => 
		{
			  assert.equal(balance.valueOf(), '100000000000000000000000');
		})
	);

	it("should have the name Securrency", () =>
	  SEC.deployed()
		.then(instance => instance.name.call())
		.then(name => 
		{
			  assert.equal(name.valueOf(), 'Securrency');
		})
	);

	it("should have the symbol SEC", () =>
	  SEC.deployed()
		.then(instance => instance.symbol.call())
		.then(symbol => 
		{
			  assert.equal(symbol.valueOf(), 'SEC');
		})
	);
})