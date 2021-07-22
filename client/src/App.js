
import React, { useState, useEffect } from 'react'
import { Layout, Menu, Typography, Form, Input, Button, InputNumber, Modal } from 'antd';
import './App.css';
import { Switch, Route, Link, withRouter } from "react-router-dom"
import { convertLegacyProps } from 'antd/lib/button/button';
import { getFileName } from 'bindings';
import { ReloadOutlined } from '@ant-design/icons'

const { Header, Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;

const App = props => 
{
	const [drizzleReadinessState, setDrizzleReadinessState] = useState(
		{drizzleState: null, loading: true})
	const [name, setName] = useState("..")
	const [symbol, setSymbol] = useState("..")
	const [decimals, setDecimals] = useState("..")
	const [balance, setBalance] = useState("..")
	const [allowance, setAllowance] = useState(null)
	const [currAddr, setCurrAddr] = useState()
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [location, setLocation] = useState('/');
	const { drizzle } = props

	const showModal = () => 
	{
		setIsModalVisible(true);
	};

	const handleOk = () => 
	{
		window.location.reload();
	};

	const getName = () =>
	{
		// const nameKey = drizzle.contracts.SEC.methods.name.cacheCall();
		// setName(drizzleReadinessState.drizzleState.contracts.SEC.storedData[nameKey].value); //todo check
		drizzle.contracts.SEC.methods.name().call().then((name) =>
			{
				setName(name);							
			}
		)
	}

	const getSymbol = () =>
	{
		drizzle.contracts.SEC.methods.symbol().call().then((symbol) =>
			{
				setSymbol(symbol);							
			}
		)
	}

	const getDecimals = () =>
	{
		drizzle.contracts.SEC.methods.decimals().call().then((decimals) =>
			{
				setDecimals(decimals);							
			}
		)
	}

	const getBalance = () =>
	{
		while(true)
		{
			drizzle.contracts.SEC.methods.balanceOf(
				drizzleReadinessState.drizzleState.accounts[0]).call().then((balance) =>
			{
				setBalance(drizzle.web3.utils.fromWei(balance, 'ether'));		
				console.log(balance)					
			})

			break;
		}		
	}

	
	
	useEffect(() => 
	{
		setLocation(window.location.pathname);

		const unsubscribe = drizzle.store.subscribe(() => 
		{
			// every time the store updates, grab the state from drizzle
			const drizzleState = drizzle.store.getState()
			
			// check to see if it's ready, if so, update local component state
			if (drizzleState.drizzleStatus.initialized) 
			{
				console.log('1')
				setDrizzleReadinessState({drizzleState: drizzleState, loading: false})
				getName();
				getSymbol();
				getDecimals();	

				//todo check delay
				drizzle.contracts.SEC.methods.balanceOf(drizzleState.accounts[0]).call().then(
					(balance) =>
				{
					setBalance(drizzle.web3.utils.fromWei(balance, 'ether'));							
				})						
			}
		});

		const interval = setInterval(() => 
		{
			if(drizzleReadinessState.loading)
			{
				return
			}

			if(!currAddr)
			{
				setCurrAddr(drizzle.web3.eth.accounts.givenProvider.selectedAddress);
			}
			else
			{
				if(drizzle.web3.eth.accounts.givenProvider.selectedAddress != currAddr)
				{
					window.location.reload();
				}
			}
		}, 200)

		return () => 
		{
			clearInterval(interval);
			unsubscribe();
		}			
		}, [drizzle.store, drizzleReadinessState]
	)

	const send = (values) =>
	{	
		if(drizzle.web3.utils.isAddress(values.receiver))
		{
			drizzle.contracts.SEC.methods.transfer(values.receiver, drizzle.web3.utils.toWei(values.amount)).send().then(() =>
			{
				console.log('sucess');
			})
		}
		
	}

	const sendFailed = (e) =>
	{
		console.log(e);
	}

	const transfer = (values) =>
	{	
		if(drizzle.web3.utils.isAddress(values.from) && drizzle.web3.utils.isAddress(values.to))
		{
			drizzle.contracts.SEC.methods.transferFrom(values.from, values.to, drizzle.web3.utils.toWei(values.amount)).send().then(() =>
			{
				console.log('sucess');
			})
		}		
	}

	const transferFailed = (e) =>
	{
		console.log(e);
	}

	const approve = (values) =>
	{	
		if(drizzle.web3.utils.isAddress(values.approvee))
		{
			drizzle.contracts.SEC.methods.approve(values.approvee, drizzle.web3.utils.toWei(values.amount)).send().then(() =>
			{
				console.log('sucess');
			})
		}		
	}

	const approveFailed = (e) =>
	{
		console.log(e);
	}

	const getAllowance = (values) =>
	{	
		if(values.owner == values.approved)
		{
			//todo pre check?
			setAllowance(balance);
		}

		if(drizzle.web3.utils.isAddress(values.approved))
		{
			drizzle.contracts.SEC.methods.allowance(values.owner, values.approved).call().then((allowance) =>
			{
				setAllowance(allowance);
				console.log(allowance)
			})
		}		
	}

	const getAllowanceFailed = (e) =>
	{
		console.log(e);
	}

	const updateLoc = (loc) =>
	{
		setLocation(loc);
	};

	const clearAllowance = () =>
	{
		setAllowance(null);
	}
		
	return (
		// <Router>
			drizzleReadinessState.loading ? 
				"Loading Drizzle..." 
				:
				<Layout className="layout">
					<Header>
						<Menu theme="dark" mode="horizontal" selectedKeys={location}>
							<Menu.Item key="/" onClick={() => updateLoc('/')}><Link to='/'>Home</Link></Menu.Item>
							<Menu.Item key="/transfer" onClick={() => updateLoc('/transfer')}>
								<Link to='/transfer'>Transfer</Link>
							</Menu.Item>
							<Menu.Item key="/allowances" onClick={() => updateLoc('/allowances')}>
								<Link to='/allowances'>Allowances</Link>
							</Menu.Item>
						</Menu>
					</Header>
					<Content style={{ padding: '0 50px' }}>
						<div className="site-layout-content">
							<Switch>
								<Route path="/transfer">
									<Paragraph>
										<Text>Your SEC balance at the adress {drizzleReadinessState.drizzleState.accounts[0]} is {balance} SEC. </Text><ReloadOutlined 
											onClick = {getBalance}/>
									</Paragraph>
									<Title>Send SEC</Title>
									<Paragraph>
										<Text>
											You can send SEC from your wallet to anyone with a valid SEC (KETH) wallet.
										</Text>
									</Paragraph>
									<Form name="send" labelCol={{ span: 8 }} wrapperCol={
										{ span: 16 }} onFinish={send} onFinishFailed={sendFailed}>
										<Form.Item label="Receiver's address" name="receiver" 
											rules={[{required: true, validator: async(_, receiver) => 
											{
												console.log(receiver)
												if(!/^0x[a-fA-F0-9]{40}$/.test(receiver))
												{
													return Promise.reject(new Error('Please enter a valid SEC wallet address'))
												}
											}}]}>
											<Input />
										</Form.Item>
										<Form.Item label="Amount" name="amount" 
										rules={[{required: true, message: 'Please enter the amount of SEC you want to send.' }]}>
											<InputNumber min={0} max={balance} stringMode type="number" />
										</Form.Item>
										<Form.Item wrapperCol={{ offset: 8, span: 16 }}>
											<Button type="primary" htmlType="submit">Send</Button>
										</Form.Item>
									</Form>
									<Title>Transfer SEC</Title>
									<Paragraph>
										<Text>
											You can transfer SEC from accounts that you are approved (by their owners) to transfer from, upto the allowed amount.
										</Text>
									</Paragraph>
									<Form name="transfer" labelCol={{ span: 8 }} wrapperCol={
										{ span: 16 }} onFinish={transfer} onFinishFailed={
											transferFailed}>
										<Form.Item label="Transfer from" name="from" 
											rules={[{required: true, validator: async(_, receiver) => 
											{
												console.log(receiver)
												if(!/^0x[a-fA-F0-9]{40}$/.test(receiver))
												{
													return Promise.reject(new Error('Please enter a valid SEC wallet address'))
												}
											}}]}>
											<Input />
										</Form.Item>
										<Form.Item label="Transfer to" name="to" 
											rules={[{required: true, validator: async(_, receiver) => 
											{
												console.log(receiver)
												if(!/^0x[a-fA-F0-9]{40}$/.test(receiver))
												{
													return Promise.reject(new Error('Please enter a valid SEC wallet address'))
												}
											}}]} extra={'Your address is ' +  drizzleReadinessState.drizzleState.accounts[0] + '.'}>
											<Input />
										</Form.Item>
										<Form.Item label="Amount" name="amount" 
										rules={[{required: true, message: 'Please enter the amount of SEC you want to transfer.' }]}>
											<InputNumber min={0} max={balance} stringMode type="number" />
										</Form.Item>
										<Form.Item wrapperCol={{ offset: 8, span: 16 }}>
											<Button type="primary" htmlType="submit">Send</Button>
										</Form.Item>
									</Form>
								</Route>
								<Route path="/allowances">
									<Title>Approve user</Title>
									<Paragraph>
										<Text>
											You can approve anyone with a valid SEC (KETH) wallet to transfer a configurable amount of SEC from your wallet. The approved person can transfer upto the specified amount to any other wallet in any number of transactions.
										</Text>
									</Paragraph>
									<Form name="approve" labelCol={{ span: 8 }} wrapperCol={
										{ span: 16 }} onFinish={approve} onFinishFailed={approveFailed}>
										<Form.Item label="To approve" name="approvee" 
											rules={[{required: true, validator: async(_, receiver) => 
											{
												console.log(receiver)
												if(!/^0x[a-fA-F0-9]{40}$/.test(receiver))
												{
													return Promise.reject(new Error('Please enter a valid SEC wallet address'))
												}
											}}]}>
											<Input />
										</Form.Item>
										<Form.Item label="Amount" name="amount" 
										rules={[{required: true, message: 'Please enter the amount of SEC you want the user to be approved to be able to transfer from your account.' }]}>
											<InputNumber min={0} max={balance} stringMode type="number" />
										</Form.Item>
										<Form.Item wrapperCol={{ offset: 8, span: 16 }}>
											<Button type="primary" htmlType="submit">Approve</Button>
										</Form.Item>
									</Form>
									<Title>Check allowance</Title>
									<Paragraph>
										<Text>
											You can check if and how much of a wallet owner's funds can be transferred by an approved user.
										</Text>
									</Paragraph>
									<Form name="allowance" labelCol={{ span: 8 }} wrapperCol={
										{ span: 16 }} onFinish={getAllowance} onFinishFailed={getAllowanceFailed}>
										<Form.Item label="Owner's address" name="owner" 
											rules={[{required: true, validator: async(_, receiver) => 
											{
												console.log(receiver)
												if(!/^0x[a-fA-F0-9]{40}$/.test(receiver))
												{
													return Promise.reject(new Error('Please enter a valid SEC wallet address'))
												}
											}}]} extra={'Your address is ' +  
											drizzleReadinessState.drizzleState.accounts[0] + '.'}
											onchange={clearAllowance}>
											<Input />
										</Form.Item>
										<Form.Item label="Approved user's address" name="approved" 
											rules={[{required: true, validator: async(_, receiver) => 
											{
												console.log(receiver)
												if(!/^0x[a-fA-F0-9]{40}$/.test(receiver))
												{
													return Promise.reject(new Error('Please enter a valid SEC wallet address'))
												}
											}}]} extra={'Your address is ' +  
											drizzleReadinessState.drizzleState.accounts[0] + '.'}
											onchange={clearAllowance}>
											<Input />
										</Form.Item>
										<Form.Item wrapperCol={{ offset: 8, span: 16 }}>
											<Button type="primary" htmlType="submit">Check</Button>
										</Form.Item>
										{
											allowance 
											? 
											<Form.Item label="Plain Text">
												<span className="ant-form-text">The approved user can transfer {allowance} SEC on behalf of the owner.</span>
											</Form.Item>
											:
											null
										}										
									</Form>
								</Route>
								<Route path="/">
									<Title>SEC Token Details</Title>
									<Paragraph><Text>The name of the token is {name}. </Text><ReloadOutlined onClick = {getName}/></Paragraph>
									<Paragraph><Text>The symbol of the token is {symbol}. </Text><ReloadOutlined onClick = {getSymbol}/></Paragraph>
									<Paragraph><Text>The number of decimals in the token (ether vs wei) is {decimals}. </Text><ReloadOutlined onClick = {getDecimals}/></Paragraph>
									<Paragraph><Text>Your SEC balance at the adress {drizzleReadinessState.drizzleState.accounts[0]} is {balance} SEC. </Text><ReloadOutlined onClick = {getBalance}/></Paragraph>
								</Route>
							</Switch>
						</div>						
					</Content>
					<Footer style={{ textAlign: 'center' }}>Shyam Senthil Nathan for Securrency</Footer>
				</Layout>
			
		// </Router>
		
	);
}
		
export default withRouter(App);		