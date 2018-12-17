// configuration for eos
config = require("./producConfig");   //testConfig or producConfig
const { Api, JsonRpc, RpcError, JsSignatureProvider } =require('eosjs');
const fetch = require('node-fetch'); // node only; not needed in browsers
const { TextDecoder, TextEncoder } = require('text-encoding');  // node, IE11 and IE Edge Browsers

const symbol = config.symbol;
const issueAmount = config.issueAmount;
const ownerAccount = config.ownerAccount;
const defaultPrivateKey = config.privateKey; // alpha
const rpc = new JsonRpc(config.url, { fetch });
const signatureProvider = new JsSignatureProvider([defaultPrivateKey]);
const api = new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });

/*
reward function in contract
inline void reward(account_name owner, asset value);
*/

const txResProcess = res=> {
    let receipt = res.processed.receipt;
    if (receipt.status == 'executed') {
        return Promise.resolve({
            transaction_id: res.transaction_id,
            cpu_usage: receipt.cpu_usage_us,
            net_usage: receipt.net_usage_words,
        })
    } else {
        return Promise.reject(res);
    }
};

const reward = (account,amount) =>
    api.transact({
        actions: [{
            account: ownerAccount,
            name: "reward",
            authorization: [{
                actor: ownerAccount,
                permission: 'active',
            }],
            data: {
                owner: account,
                value: amount+' '+symbol,
            },
        }]
    },{
        blocksBehind: 0,
        expireSeconds: 1000,
    }).then(txResProcess);

/*
consume function in contract
inline void consume(account_name owner, asset value);
*/
const consume = (account,amount) =>
    api.transact({
        actions: [{
            account: ownerAccount,
            name: "consume",
            authorization: [{
                actor: ownerAccount,
                permission: 'active',
            }],
            data: {
                owner: account,
                value: amount+' '+symbol,
            },
        }]
    },{
        blocksBehind: 0,
        expireSeconds: 1000,
    }).then(txResProcess);

/*public async get_table_rows({
json = true,
    code,
    scope,
    table,
    table_key = "",
    lower_bound = "",
    upper_bound = "",
    limit = 10
    }
}*/

const getTokenBalance = (account) =>
    rpc.get_table_rows({
        code:ownerAccount,
        scope:account,
        table:"accounts",
        json: true,
    }).then((res) => Promise.resolve(res.rows[0].balance));

const getContractStatus = () =>
    rpc.get_table_rows({
        code:ownerAccount,
        scope:symbol,
        table:"stat",
        json: true,
    }).then((res) => Promise.resolve(res));

const create = () =>
    api.transact({
        actions: [{
            account: ownerAccount,
            name: "create",
            authorization: [{
                actor: ownerAccount,
                permission: 'active',
            }],
            data: {
                issuer: ownerAccount,
                maximum_supply: issueAmount+' '+symbol,
            },
        }]
    },{
        blocksBehind: 0,
        expireSeconds: 1000,
    }).then(txResProcess);

module.exports = {
    reward: reward,
    consume: consume,
    getTokenBalance: getTokenBalance,
    getContractStatus: getContractStatus,
    create: create,
};


/*
{"msg": "succeeded",
"keys": {"active_key": {"public": "EOS5dYcieLoDDsZEC31PBSzLNSNhkhFNcQHWATorY9m2vDEETLxWg",
"private": "5HwTMf6x1P5PWKrrkQUPdNx8g7H9jJdpkgG8ZkRrZWa8GGSDviq"},
"owner_key": {"public": "EOS7vjhHr6ubNxMwLLC4LP2abNXpFrc2Fjp8FuFvNTFZLMQg6mNWm",
"private": "5KebCxUGT3vVuqqLB5TrDjiqMSudVuFp6hRw3FDFvEJCu4Njd1X"}},
"account": "kkkkkkuuuuu2"

"url":https://api-kylin.eosasia.one
}
*/