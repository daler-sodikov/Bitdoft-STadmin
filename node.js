fetch("https://newbitsoftapp1.onrender.com/api/login/admin",{
    method:'POST',
    headers:{
        "Content-Type":"application/json"
    },
    body:JSON.stringify({email:" mh@gmail.com ",password: "123456"})
}).then((e)=>e.json()).then((e)=>console.log(e)
)