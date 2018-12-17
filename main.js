const Koa = require('koa');
const app = new Koa();
const Router = require('koa-router');
const router = new Router();
const cors = require('koa2-cors');
const bodyParser = require('koa-bodyparser');
const contract = require("./contract.js");

router.prefix('/api/v1');
router.get('/balance/:account',getTokenBalance)
    .put('/balance/:account', updateToken);

console.log("app start");
app.use(cors());
app.use(bodyParser());
app.use(router.routes());
app.listen(3000, '127.0.0.1');

function errorHandler(err) {
    console.log(err.message);
    ctx.response.status = 400;
    ctx.response.body = {
        message: err.message
    }
}
async function getTokenBalance (ctx)  {
    let account = ctx.params.account;
    try {
        await contract.getTokenBalance(account).then(balance=>{
            ctx.response.status = 200;
            ctx.response.body = {
                balance:balance
            }
        })
    } catch (err) {
        errorHandler(err);
    }
}

async function updateToken () {
    let amount = ctx.request.body.amount;
    let account = ctx.params.account;
    let p;
    if(amount<0) {
        p = contract.consume(account,-amount);
    } else {
        p = contract.reward(account,amount);
    }

    try {
        await p.then(console.log)
    } catch (err) {
        errorHandler(err)
    }
}

