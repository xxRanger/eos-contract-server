const contract = require("./contract.js");
const testAccount = "bob";
const testAmount = 1000;

const test = async ()=> {
    const testReward = async () => {
        contract.reward(testAccount,testAmount).then(console.log);
    };
    const testConsume = async () => {
        contract.consume(testAccount,testAmount).then(console.log);
    };

    const testGetBalance = async () => {
        contract.getTokenBalance(testAccount).then(console.log);
    };

    const testGetStatus = async () => {
        contract.getContractStatus().then(console.log);
    };

    const testCreate = async () => {
        contract.create().then(console.log);
    };

    // testCreate();
    testGetStatus();
    testGetBalance();
    testReward();
};

test();

