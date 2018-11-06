const { ipcRenderer } = require('electron')

ipcRenderer.on('show-notification', (event, title, body, onClick = () => {}) => {
  const noti = new Notification(title, { body })    // equivalent to { body: body }
  noti.onclick = onClick
})

