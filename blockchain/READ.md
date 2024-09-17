# 🚀 <span style="color: #4CAF50; font-size: 3em; font-weight: bold; text-shadow: 2px 2px 5px rgba(0,0,0,0.3); border-bottom: 2px solid #4CAF50; padding-bottom: 10px; display: block; margin-bottom: 20px;">**Ahoy Supplychain**</span>


## 📜 <span style="color: #4CAF50; font-size: 2.5em; font-weight: bold; text-shadow: 2px 2px 5px rgba(0,0,0,0.3); border-bottom: 2px solid #4CAF50; padding-bottom: 10px; display: block; margin-bottom: 20px;">**Description**</span>
The blockchain-based tea supply chain management system ensures transparency, traceability, and security from the tea plantation to the consumer. Each step in the tea supply chain is recorded on the blockchain, providing an immutable and transparent record of the tea's journey.

## 🛠️ <span style="color: #4CAF50; font-size: 2.5em; font-weight: bold; text-shadow: 2px 2px 5px rgba(0,0,0,0.3); border-bottom: 2px solid #4CAF50; padding-bottom: 10px; display: block; margin-bottom: 20px;">**Technologies Used**</span>
- **API**: NestJS
- **DB**: MongoDB
- **Queue Management**: Kafka
- **Smart Contract**: Solidity
- **Blockchain**: Besu Zero gas fee private network

## 📑 <span style="color: #4CAF50; font-size: 2.5em; font-weight: bold; text-shadow: 2px 2px 5px rgba(0,0,0,0.3); border-bottom: 2px solid #4CAF50; padding-bottom: 10px; display: block; margin-bottom: 20px;">**Contract Deployment Steps in Private Network with Proxy**</span>

Deploying all the contracts on a private network requires no gas .

### <span style="color: #4CAF50; font-size: 2em; font-weight: bold; text-shadow: 2px 2px 5px rgba(0,0,0,0.3); background-color: #f1f8e9; border-radius: 8px; padding: 10px; display: block; margin-bottom: 20px;">**Steps to Deploy Contracts**</span>

Execute scripts one by one from the `scripts` folder:

<pre style="background-color: #f9fbe7; border-left: 4px solid #4CAF50; padding: 10px; border-radius: 8px;">
1. <code>generateWallet.js</code>
2. <code>1_deploy.js</code>
3. <code>2_deploy-multiTea-with-proxy.js</code>
4. <code>3_multiTeaToken.js</code>
5. <code>4_deploy-chai-with-proxy.js</code>
6. <code>5_chai_contract.js</code>
7. <code>mint-tea-token.js</code> - To mint token
</pre>

### <span style="color: #4CAF50; font-size: 2em; font-weight: bold; text-shadow: 2px 2px 5px rgba(0,0,0,0.3); background-color: #f1f8e9; border-radius: 8px; padding: 10px; display: block; margin-bottom: 20px;">**To Upgrade Contracts**</span>

Execute scripts from the `scripts/update` folder as needed:

<pre style="background-color: #f9fbe7; border-left: 4px solid #4CAF50; padding: 10px; border-radius: 8px;">
1. <code>1_deploy.js</code>
2. <code>2_deploy-multiTea-with-proxy.js</code>
3. <code>4_deploy-chai-with-proxy.js</code>
</pre>

**Note:** 
<br>All contracts are deployed and communicate with each other through the proxy. 
<br>As the application is deployed and running on a private network, no gas is needed for performing transactions.

---
