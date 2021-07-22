import React from 'react'; // todo add polyfills for IE?
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import 'antd/dist/antd.css';
import { BrowserRouter as Router }from 'react-router-dom'


// import drizzle functions and contract artifact
import { DrizzleContext } from '@drizzle/react-plugin' //todo explore
import { Drizzle } from '@drizzle/store';
import SEC from "./contracts/SEC.json";

// let drizzle know what contracts we want and how to access our test blockchain
const options = 
{
	contracts: [SEC],
	web3: 
	{
		fallback: 
		{
			type: "ws",
			url: "ws://127.0.0.1:9545",
		},
	},
};

// setup drizzle
const drizzle = new Drizzle(options);

ReactDOM.render(<Router><App drizzle={drizzle}/></Router>, document.getElementById('root'));