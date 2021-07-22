
import React, { useState, useEffect } from 'react'
import { Layout, Menu, Typography, Form, Input, Button, InputNumber, message, Divider } from 'antd';
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
	const [sending, setSending] = useState(false);
	const [transferring, setTransferring] = useState(false);
	const [approving, setApproving] = useState(false);
	const { drizzle } = props
	const [sendForm] = Form.useForm();
	const [transferForm] = Form.useForm();
	const [approveForm] = Form.useForm();

	const showModal = () => 
	{
		setIsModalVisible(true);
	};

	const handleOk = () => 
	{
		window.location.reload();
	};

	const getName = (from) =>
	{
		// const nameKey = drizzle.contracts.SEC.methods.name.cacheCall();
		// setName(drizzleReadinessState.drizzleState.contracts.SEC.storedData[nameKey].value); //todo check impl
		drizzle.contracts.SEC.methods.name().call().then((name) =>
			{
				setName(name);							

				if(from != 'init')
				{
					message.success('Updated name.', 2);
				}
			}
		)
	}

	const getSymbol = (from) =>
	{
		drizzle.contracts.SEC.methods.symbol().call().then((symbol) =>
			{
				setSymbol(symbol);		
				
				if(from != 'init')
				{
					message.success('Updated symbol.', 2);
				}
			}
		)
	}

	const getDecimals = (from) =>
	{
		drizzle.contracts.SEC.methods.decimals().call().then((decimals) =>
			{
				setDecimals(decimals);
				
				if(from != 'init')
				{
					message.success('Updated decimal count.', 2);
				}
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
				message.success('Updated balance.', 2);
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
				setDrizzleReadinessState({drizzleState: drizzleState, loading: false})
				getName('init');
				getSymbol('init');
				getDecimals('init');	

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
		if(!drizzle.web3.utils.isAddress(values.receiver))
		{
			message.warning('The entered address does not seem to be valid.', 5);
		}
		else if(values.receiver.toLowerCase() == currAddr.toLowerCase())
			{
			message.warning('You are trying to send from and to the same address.', 5);
		}
		else
		{
			setSending(true);
		
			drizzle.contracts.SEC.methods.transfer(values.receiver, drizzle.web3.utils.toWei(values.amount)).send().then(() =>
			{
				setSending(false);
				message.success('Sent successfully!', 5);
				sendForm.resetFields();
			},
			(e) => sendFailed(e))
		}		
	}

	const sendFailed = (e) =>
	{
		setSending(false);
		message.error(e.message + ' Sending failed! Please try again.', 5);
	}

	const transfer = (values) =>
	{	
		if(!drizzle.web3.utils.isAddress(values.from) || !drizzle.web3.utils.isAddress(values.to))
		{
			message.warning('One or both of the entered address does not seem to be valid.', 5);
		}
		else if(values.from.toLowerCase() == values.to.toLowerCase())
		{
			message.warning('You are trying to send from and to the same address.', 5);
		}
		else if(values.from.toLowerCase() == currAddr.toLowerCase())
		{
			message.warning('Use the Send SEC form above to transfer money from the logged-in address.')
		}
		else
		{
			setTransferring(true);

			drizzle.contracts.SEC.methods.transferFrom(values.from, values.to, drizzle.web3.utils.toWei(values.amount)).send().then(() =>
			{
				setTransferring(false);
				message.success('Transferred successfully!', 5);
				transferForm.resetFields();
			},
			(e) => transferFailed(e))
		}		
	}

	const transferFailed = (e) =>
	{
		setTransferring(false);
		message.error(e.message + ' Transfer failed! Please try again.', 5);
	}

	const approve = (values) =>
	{	
		if(!drizzle.web3.utils.isAddress(values.approvee))
		{
			message.warning('The entered address does not seem to be valid.', 5);
		}
		else if(values.approvee.toLowerCase() == currAddr.toLowerCase())
		{
			message.warning('The address to be approved is the same as the logged-in (approving) address.', 5);
		}
		else
		{
			setApproving(true);

			drizzle.contracts.SEC.methods.approve(values.approvee, drizzle.web3.utils.toWei(values.amount)).send().then(() =>
			{
				setApproving(false);
				message.success('Approved successfully!', 5);
				approveForm.resetFields();
			},
			(e) => approveFailed(e))
		}		
	}

	const approveFailed = (e) =>
	{
		setApproving(false);
		message.error(e.message + ' Approval failed! Please try again.', 5);
	}

	const getAllowance = (values) =>
	{	
		if(!drizzle.web3.utils.isAddress(values.owner) || !drizzle.web3.utils.isAddress(values.approved))
		{
			message.warning('The entered address does not seem to be valid.', 5);
		}
		if(values.owner.toLowerCase() == values.approved.toLowerCase())
		{
			message.warning('The entered addresses are identical.', 5)
		}
		else
		{
			drizzle.contracts.SEC.methods.allowance(values.owner, values.approved).call().then((allowance) =>
			{
				setAllowance(drizzle.web3.utils.fromWei(allowance, 'ether'));
			},
			(e) => getAllowanceFailed(e))
		}		
	}

	const getAllowanceFailed = (e) =>
	{
		message.error(e.message + ' Checking failed! Please try again.')
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
			drizzleReadinessState.loading ? 
				<Paragraph style={{ padding: "24px", fontSize: "32px"}}><Text type="danger">To be able to use this web application, please make sure you are running a web3-compatible browser, or have installed an Ethereum wallet extension to your browser, configured those with your accounts, logged in to you Ethereum wallet, Kovan is set as the Ethereum network, and you allow our web application to access your account.</Text></Paragraph>
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
								<Text>Your SEC balance at the adress </Text><Text code>{drizzleReadinessState.drizzleState.accounts[0]}</Text><Text> is </Text><Text strong>{balance} SEC.</Text><ReloadOutlined onClick = {getBalance}/>
									</Paragraph>
									<Title>Send SEC</Title>
									<Paragraph>
										<Text>
											You can send SEC from your wallet to anyone with a valid SEC (KETH) wallet.
										</Text>
									</Paragraph>
									<Form name="send" labelCol={{ span: 8 }} wrapperCol={
									{ span: 16 }} onFinish={send} form={sendForm}>
										<Form.Item label="Receiver's address" name="receiver" 
											rules={[{required: true, validator: async(_, receiver) => 
											{
												if(!/^0x[a-fA-F0-9]{40}$/.test(receiver))
												{
													return Promise.reject(new Error('Please enter a valid SEC wallet address'))
												}
											}}]}>
									<Input disabled={sending} />
										</Form.Item>
										<Form.Item label="Amount" name="amount" 
										rules={[{required: true, message: 'Please enter the amount of SEC you want to send.' }]}>
									<InputNumber min={0} max={balance} stringMode 
									type="number" disabled={sending} />
										</Form.Item>
										<Form.Item wrapperCol={{ offset: 8, span: 16 }}>
									<Button type="primary" htmlType="submit" disabled={
										sending}>{ sending ? "Sending.." : "Send"}</Button>
										</Form.Item>
									</Form>
									<Title>Transfer SEC</Title>
									<Paragraph>
										<Text>
											You can transfer SEC from accounts that you are approved (by their owners) to transfer from, upto the allowed amount.
										</Text>
									</Paragraph>
									<Form name="transfer" labelCol={{ span: 8 }} wrapperCol={
										{ span: 16 }} onFinish={transfer} form={transferForm}>
										<Form.Item label="Transfer from" name="from" 
											rules={[{required: true, validator: async(_, receiver) => 
											{
												if(!/^0x[a-fA-F0-9]{40}$/.test(receiver))
												{
													return Promise.reject(new Error('Please enter a valid SEC wallet address'))
												}
											}}]}>
									<Input disabled={transferring}/>
										</Form.Item>
										<Form.Item label="Transfer to" name="to" 
											rules={[{required: true, validator: async(_, receiver) => 
											{
												if(!/^0x[a-fA-F0-9]{40}$/.test(receiver))
												{
													return Promise.reject(new Error('Please enter a valid SEC wallet address'))
												}
											}}]} extra={'Your address is ' +  drizzleReadinessState.drizzleState.accounts[0] + '.'}>
									<Input  disabled={transferring}/>
										</Form.Item>
										<Form.Item label="Amount" name="amount" 
										rules={[{required: true, message: 'Please enter the amount of SEC you want to transfer.' }]}>
									<InputNumber min={0} max={balance} stringMode type="number" disabled={transferring}/>
										</Form.Item>
										<Form.Item wrapperCol={{ offset: 8, span: 16 }}>
									<Button type="primary" htmlType="submit" disabled={transferring}>{ transferring ? "Transferring.." : "Transfer"}</Button>
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
								{ span: 16 }} onFinish={approve} form={approveForm}>
										<Form.Item label="To approve" name="approvee" 
											rules={[{required: true, validator: async(_, receiver) => 
											{
												if(!/^0x[a-fA-F0-9]{40}$/.test(receiver))
												{
													return Promise.reject(new Error('Please enter a valid SEC wallet address'))
												}
											}}]}>
									<Input disabled={approving}/>
										</Form.Item>
										<Form.Item label="Amount" name="amount" 
										rules={[{required: true, message: 'Please enter the amount of SEC you want the user to be approved to be able to transfer from your account.' }]}>
									<InputNumber min={0} max={balance} stringMode type="number" disabled={approving}/>
										</Form.Item>
										<Form.Item wrapperCol={{ offset: 8, span: 16 }}>
									<Button type="primary" htmlType="submit" disabled={approving}>{ approving ? "Approving.." : "Approve"}</Button>
										</Form.Item>
									</Form>
									<Title>Check allowance</Title>
									<Paragraph>
										<Text>
											You can check if and how much of a wallet owner's funds can be transferred by an approved user.
										</Text>
									</Paragraph>
									<Form name="allowance" labelCol={{ span: 8 }} wrapperCol={
										{ span: 16 }} onFinish={getAllowance}>
										<Form.Item label="Owner's address" name="owner" 
											rules={[{required: true, validator: async(_, receiver) => 
											{
												if(!/^0x[a-fA-F0-9]{40}$/.test(receiver))
												{
													return Promise.reject(new Error('Please enter a valid SEC wallet address'))
												}
											}}]} extra={'Your address is ' +  
											drizzleReadinessState.drizzleState.accounts[0] + '.'}
									onChange={clearAllowance}>
											<Input />
										</Form.Item>
										<Form.Item label="Approved user's address" name="approved" 
											rules={[{required: true, validator: async(_, receiver) => 
											{
												if(!/^0x[a-fA-F0-9]{40}$/.test(receiver))
												{
													return Promise.reject(new Error('Please enter a valid SEC wallet address'))
												}
											}}]} extra={'Your address is ' +  
											drizzleReadinessState.drizzleState.accounts[0] + '.'}
									onChange={clearAllowance}>
											<Input />
										</Form.Item>
										<Form.Item wrapperCol={{ offset: 8, span: 16 }}>
											<Button type="primary" htmlType="submit">Check</Button>
										</Form.Item>
										{
											allowance 
											? 
									<Form.Item label="Allowance">
										<span className="ant-form-text">{allowance} SEC</span>
											</Form.Item>
											:
											null
										}										
									</Form>
								</Route>
								<Route path="/">
									<Title>SEC Token Details</Title>
							<Paragraph><Text>The name of the token is </Text><Text strong>{name}. </Text><ReloadOutlined onClick = {getName}/> *</Paragraph>
							<Paragraph><Text>The symbol of the token is </Text><Text strong>{symbol}. </Text><ReloadOutlined onClick = {getSymbol}/> *</Paragraph>
							<Paragraph><Text>The number of decimals in the token (ether vs wei) is </Text><Text strong>{decimals}. </Text><ReloadOutlined onClick = {getDecimals}/> *</Paragraph>
							<Paragraph><Text>Your SEC balance at the adress </Text><Text code>{drizzleReadinessState.drizzleState.accounts[0]}</Text><Text> is </Text><Text strong>{balance} SEC. </Text><ReloadOutlined onClick = {getBalance}/></Paragraph>
							<Divider></Divider>
							<Paragraph><Text>* Refetching will not change the values. Functionality provided only for demonstration of capability.</Text></Paragraph>
								</Route>
							</Switch>
						</div>						
					</Content>
					<Footer style={{ textAlign: 'center' }}>Shyam Senthil Nathan for Securrency</Footer>
				</Layout>
			
	);
}
		
export default withRouter(App);		