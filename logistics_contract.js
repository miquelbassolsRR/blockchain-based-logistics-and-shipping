const Web3 = require('web3');
const solc = require('solc');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const contractPath = path.resolve(__dirname, 'contracts', 'Logistics.sol');
const source = fs.readFileSync(contractPath, 'utf8');

// Compile contract
const input = {
    language: 'Solidity',
    sources: {
        'Logistics.sol': {
            content: source
        }
    },
    settings: {
        outputSelection: {
            '*': {
                '*': ['*']
            }
        }
    }
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));
const contractABI = output.contracts['Logistics.sol'].Logistics.abi;
const contractByteCode = output.contracts['Logistics.sol'].Logistics.evm.bytecode.object;

// Connect to local Ethereum node
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

// Contract deployment
const deployContract = async () => {
    const accounts = await web3.eth.getAccounts();
    const logisticsContract = new web3.eth.Contract(contractABI);

    logisticsContract.deploy({
        data: '0x' + contractByteCode
    })
    .send({
        from: accounts[0],
        gas: 1500000,
        gasPrice: web3.utils.toWei('0.00003', 'ether')
    })
    .then((deployment) => {
        console.log('Logistics Contract deployed at address:', deployment.options.address);
    })
    .catch(err => {
        console.error("Deployment failed:", err);
    });
};

deployContract();
