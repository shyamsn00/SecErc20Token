const SEC = artifacts.require('SEC') //todo fix

contract("SEC", accounts => 
{
	SECToken = await SEC.deployed("100000000000000000000000")

	it("should create token with specified name", async () => 
	{
		assert.equal(await SECToken.name.call(), 'Securrency')
	});

	it("should create token with specified symbol", async () => 
	{		
		assert.equal(await SECToken.symbol.call(), 'SEC')
	});
});