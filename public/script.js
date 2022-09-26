console.log('hloooo')

const button = document.querySelector("#button")
button.addEventListener('click',()=>{
    fetch('/create-checkout-session',{
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({
            items:[
                {id:1, quantity:3},
                {id:2, quantity:1}
            ]
        })
    }).then((res)=>{
        if(res.ok) return res.json()
        //this is for making sure the json response fails bcz the fetch doesnt fail on its own
        return res.json().then(json=>Promise.reject(json))
    }).then(({url})=>{
        window.location = url;
        console.log(url);
    }).catch((err)=>{
        console.log(err.error);
    })
})