# ERC20 token demonstration

<p>This project is a simple demonstration of writing and deploying an ERC20 token smart contract and interacting with the it through a React application.</p>

## Smart contract desciption

<p>The smart contract allows users to create a new ERC20 token with a desired, name, symbol and initial supply.</p>
<p>Note: The contract retains the community-recommended value of 18 for the <code>decimals</code> value.</p>
<p>I have deployed my ERC20 token smart contract to the Kovan testnet, and it resides at <code>0x2275b8f83f01034c2dbcb2b2846ee9fd9a6f4290</code>, but you can deploy it to any network by adding the desired network to <code>truffle-config.js</code> and modifying the network name during deployment.</p>

## Front-end description

<p>The front-end is built with ReactJS, utilizing AntDesign components.</p>
<p>
	The React web application allows users to
	<ul>
		<li>Get to know of the basic attributes of the token
		<li>Check your current token balance, provided you have a web3 wallet integrated into the browser
		<li>Approve others to transfer funds on your behalf
		<li>Transfer funds on behalf of others, provided you are approved for it
		<li>Check allowances
	</ul>
</p>

## Building and deploying

<ul>
<li>Run <code>npm install</code>.
<li>Create file <code>.env</code> with appropriate keys-value pairs, corresponding to all keys in <code>.env.req</code>.
<li>Run <code>truffle migrate --network kovan</code> from the root dir.
<li><code>cd</code> to <code>\client</code>.
<li>Run <code>npm install</code>.
<li>Run <code>npm start</code>.
</ul

