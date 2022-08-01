const socket = io()

const $msgForm = document.querySelector('#message-form')
const $msgFormInput = $msgForm.querySelector('input')
const $msgFormButton = $msgForm.querySelector('button')
const $locButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sideBarTemplate = document.querySelector('.sidebar-template').innerHTML

const {username, room} = Qs.parse(location.search,{ignoreQueryPrefix: true})
 
const autoScroll = () => {
    // New Message Element
    const $newMessage = $messages.lastElementChild

    //Height of the new Message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    
    //Visible Height
    const visibleHeight = $messages.offsetHeight

    //Height of Messages container
    const containerHeight = $messages.scrollHeight

    //How far have I scrolled
    const scrolloffSet = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrolloffSet){
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message',(msg)=>{
      console.log(msg)
      const html = Mustache.render(messageTemplate,{
         username: msg.username,
         message: msg.txt,
         createdAt: moment(msg.createdAt).format('h:mm a')
      })
      $messages.insertAdjacentHTML('beforeend',html)
      autoScroll()
})

socket.on('locationMessage',(url)=>{
    console.log(url)
    const html = Mustache.render(locationTemplate,{
       username: url.username , 
       url : url.txt,
       createdAt: moment(url.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})

socket.on('roomData',({room,users})=>{
    const html = Mustache.render(sideBarTemplate,{
        room,
        users
    })

    document.querySelector('#sidebar').innerHTML = html

})

$msgForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    
    //disable
    $msgFormButton.setAttribute('disabled',true)
    $msgFormInput.setAttribute('disabled',true)

    const input = $msgFormInput.value
    socket.emit('sendMessage',input,(error)=>{
        $msgFormButton.removeAttribute('disabled')
        $msgFormInput.removeAttribute('disabled')
        
        $msgFormInput.value = ''
        $msgFormInput.focus()

        if(error){
            return console.log(error)
        }
        console.log('Message Delivered')
    })
})

$locButton.addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert('Your browser does not support geolocation!')
    }
    
    $locButton.setAttribute('disabled',true)

    navigator.geolocation.getCurrentPosition((position)=>{
        const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }
        socket.emit('sendLocation',location,()=>{
            $locButton.removeAttribute('disabled')
            console.log('Location has been delivered')
        })
        
        
    })
})

socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href = '/'
    }
})

