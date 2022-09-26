require('dotenv').config()

const express = require('express')
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY)
const app = express()
app.use(express.json())
const hbs = require('express-handlebars')
const path = require('path')
const bodyParser = require('body-parser')
const logger = require('morgan')
const route = express.Router()

app.use(logger('dev'))
app.use('/', route)
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended:true}))
const PUBLIC_KEY = process.env.STRIPE_PUBLIC_KEY

const storeItems = new Map([
    [1 ,{price:1000, name:"shoes"} ],
    [2, {price:2000, name:"bags"}],
    [3 ,{price:3000, name:"dress"}]
])

app.set('views', path.join(__dirname,'/views'))
app.set('view engine','hbs')
app.engine('hbs',hbs.engine({
    extname:"hbs"
}))

route.get('/',(req, res)=>{
    res.render('home', { key : PUBLIC_KEY, amount:10 })
})

route.get('/success', (req, res)=>{
    res.send('payment successfully completed')
})

route.get('/fail', (req, res)=>{
    res.send('payment failed')
})

route.get('/paysecure', (req, res)=>{
    res.render('pay')
})

route.post('/create-checkout-session', async(req, res)=>{
    res.header({'Content-Type':'application/json'})
    try{
        const session = await stripe.checkout.sessions.create({
            payment_method_types:['card'],
            mode: 'payment',
            line_items:req.body.items.map(item=>{
                const storeItem = storeItems.get(item.id)
                return {
                    price_data:{
                        currency:'inr',
                        product_data : {
                            name:storeItem.name
                        },
                        unit_amount:storeItem.price
                    },
                    quantity:item.quantity
                }
            }),
            success_url:`${process.env.SERVER_URL}/success`,
            cancel_url:`${process.env.SERVER_URL}/fail`
        })
        res.status(200).json({'url':`${session.url}`,'body':`${res.body}`})
    }catch(err){
        console.log(err);
        res.status(500).json({error:err.meggage})
    }
})

const PORT = process.env.PORT || 5000

app.listen(PORT, (err)=>{
    if(err) throw err;
    console.log(`server started on port : ${PORT}`);
})

module.exports = app