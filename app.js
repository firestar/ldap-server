const net = require('net');

const bindRequestProtocolOp = (content, func = (message)=>{}) =>{
    console.log("Bind Request Protocol Op")
    const length = parseInt(content[2]+content[3], 16)*2+4;
    console.log("\t length", length)
    let i=4;
    let data = [];
    while(i<length) {
        let innerLength = parseInt(content[i+2]+content[i+3], 16)*2+4;
        let cont = content.substr(i,innerLength)
        i=i+innerLength;
        data.push(readldap(cont, func));
    }
    func(Buffer.from('300c02010161070a010004000400', 'hex'))
    return data;
}

const searchRequestProtocolOp = (content, func = (message)=>{}) =>{
    console.log("Search Request Protocol Op")
    const length = parseInt(content[2]+content[3], 16)*2+4;
    console.log("\t length", length)
    let i=4;
    let data = [];
    while(i<length) {
        let innerLength = parseInt(content[i+2]+content[i+3], 16)*2+4;
        let cont = content.substr(i,innerLength)
        i=i+innerLength;
        data.push(readldap(cont, func));
    }
    //func(Buffer.from('300c02010161070a010004000400', 'hex'))
    return data;
}

const sequence = (content, func = (message)=>{})=>{
    console.log("sequence");
    const length = parseInt(content[2]+content[3], 16)*2+4;
    console.log("\t length", length)
    let i=4;
    let data = [];
    while(i<length) {
        let innerLength = parseInt(content[i+2]+content[i+3], 16)*2;
        let cont = content.substr(i,innerLength+4)
        i=i+innerLength+4;
        data.push(readldap(cont, func));
    }
    return data;
}
const boolean = content=>{
    console.log("boolean");
    const length = parseInt(content[2]+content[3], 16)*2;
    console.log("\tlength", length)
    return parseInt(content.substr(4, length), 16);
}

const integer = content=>{
    console.log("integer");
    const length = parseInt(content[2]+content[3], 16)*2;
    console.log("\tlength", length)
    return parseInt(content.substr(4, length), 16);
}
const octetString = content=>{
    console.log("string");
    const length = parseInt(content[2]+content[3], 16)*2;
    console.log("\tlength", length)
    return new Buffer(content.substr(4, length), 'hex').toString('utf8');
}

const readldap = (content, func = (message)=>{}) => {
    console.log(content)
    switch(content[0]+content[1]){
        case "30":
            return sequence(content, func);
            break;
        case "01":
            return boolean(content)
            break;
        case "02":
            return integer(content)
            break;
        case "60":
            return bindRequestProtocolOp(content, func)
            break;
        case "63":
            return searchRequestProtocolOp(content, func)
            break;
        case "04":
            return octetString(content)
            break;
        case "80":
            return octetString(content)
            break;
    }
}

const server_two = net.createServer((socket) => {
    socket.on("data",(data)=>{
        console.log(readldap(data.toString('hex'), (message)=>{
            console.log("writing: ", message);
            socket.write(message);
        }))
    })
    //socket.end('goodbye\n');

}).on('error', (err) => {
    // Handle errors here.
    console.log("test2")
    throw err;
});
server_two.listen(389,"0.0.0.0", () => {
    console.log('opened server on', server_two.address());
});