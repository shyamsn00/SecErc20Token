const SEC = artifacts.require('./SEC');

module.exports = function(deployer) 
{
	deployer.deploy(SEC, "100000000000000000000000"); // 100,000 * 10 ** 18
};