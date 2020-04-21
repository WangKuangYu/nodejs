let func=a => a*a;

let func2=() => {
    let r =0;
    for(let i=1;i<=10;i++){
        r+=i;
    }

    return r;

}

console.log(func(7));
console.log(func2());