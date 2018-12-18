const Koa = require('koa');
const app = new Koa();
const Router = require('koa-router');
const router = new Router();
const cors = require('koa2-cors');
const bodyParser = require('koa-bodyparser');
const contract = require("./contract.js");

router.prefix('/api/v1');
router.get('/balance/:account',getTokenBalance)
    .post('/balance/:account', updateToken);

console.log("app start");
app.use(cors());
app.use(bodyParser());
app.use(router.routes());
app.listen(8000, 'localhost');

function errorHandler(err,ctx) {
    console.log(err.message);
    ctx.response.status = 400;
    ctx.response.body = {
        message: err.message
    }
}
async function getTokenBalance (ctx)  {
    let account = ctx.params.account;
    try {
        await contract.getTokenBalance(account).then(payload=>{
            let payloadArray = payload.split(' ');
            let balance = payloadArray[0];
            let symbol = payloadArray[1];
            ctx.response.status = 200;
            ctx.response.body = {
                balance:balance,
                symbol:symbol
            }
        })
    } catch (err) {
        errorHandler(err,ctx);
    }
}

async function updateToken (ctx) {
    let amount = ctx.request.body.amount;
    let account = ctx.params.account;
    console.log("update token for :"+account+" amount:"+amount);
    let p;
    if(amount<0) {
        p = contract.consume(account,-amount);
    } else {
        p = contract.reward(account,amount);
    }

    try {
        await p.then(receipt=>{
            ctx.response.status = 200;
            ctx.response.body = receipt;
        })
    } catch (err) {
        errorHandler(err,ctx)
    }
}

