const { app, clipboard, Menu, Tray, systemPreferences } = require('electron')
const path = require('path')

const clippings = []
let tray = null

app.on('ready', () => {
  if (app.dock) {
    app.dock.hide() // macOS
  }

  tray = new Tray(path.join(__dirname, getIcon()))
  if (process.platform === 'win32') {
    tray.on('click', tray.popUpContextMenu)
  }

  updateMenu()

  tray.setToolTip('Clipmaster')
})

const updateMenu = () => {
  const menu = Menu.buildFromTemplate([
    {
      label: 'Create New Clipping',
      click() {
        addClipping()
      },
      accelerator: 'CommandOrControl+Shift+C'
    },
    { type: 'separator' },
    ...clippings.map((clipping, index) => ({ label: clipping })), // the parser doesn't interpret the two braces as an object literal, but as a block statement.
    { type: 'separator' },
    {
      label: 'Quit',
      click() {
        app.quit()
      },
      accelerator: 'CommandOrControl+Q'
    }
  ])
  tray.setContextMenu(menu)
}

const getIcon = () => {
  if (process.platform === 'win32') {
    return 'icon-light@2x.ico'
  }
  if (systemPreferences.isDarkMode()) { // macOS
    return 'icon-light.png'
  }
  return 'icon-dark.png'
}

const addClipping = () => {
  const clipping = clipboard.readText()
  clippings.push(clipping)
  updateMenu()
  return clipping
}