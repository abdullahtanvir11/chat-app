const generateMessage = (username,message)=>{
    return {
        username,
        txt: message,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMessage
}