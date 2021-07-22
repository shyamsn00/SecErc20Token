/**
* Use this file to configure your truffle project. It's seeded with some
* common settings for different networks and features like migrations,
* compilation and testing. Uncomment the ones you need or modify
* them to suit your project as necessary.
*
* More information about configuration can be found at:
*
* truffleframework.com/docs/advanced/configuration
*
* To deploy via Infura you'll need a wallet provider (like truffle-hdwallet-provider)
* to sign your transactions before they're sent to a remote public node. Infura accounts
* are available for free at: infura.io/register.
*
* You'll also need a mnemonic - the twelve word phrase the wallet uses to generate
* public/private key pairs. If you're publishing your code to GitHub make sure you load this
* phrase from a file you've .gitignored so it doesn't accidentally become public.
*
*/

const HDWalletProvider = require('@truffle/hdwallet-provider');
const path = require('path');
require('dotenv').config()

module.exports = 
{
	contracts_build_directory: path.join(__dirname, 'client/src/contracts'),
	networks: 
	{
		// testnets
		// properties
		// network_id: identifier for network based on ethereum blockchain. Find out more at 
		// https://github.com/ethereumbook/ethereumbook/issues/110
		// gas: gas limit
		// gasPrice: gas price in gwei
		kovan: 
		{
			provider: () => new HDWalletProvider(process.env.MNENOMIC, 'https://kovan.infura.io/v3/' +
				process.env.INFURA_API_KEY),
			network_id: 42,
			gas: 3000000,
			gasPrice: 10000000000
		}
	},
	compilers: 
	{
		solc: 
		{
		  version: '^0.8.0'
		}
	}
};