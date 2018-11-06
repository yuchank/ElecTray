const { app, Notification, BrowserWindow, clipboard, globalShortcut, Menu, Tray, systemPreferences } = require('electron')
const path = require('path')

const clippings = []
let tray = null
let browserWindow = null

const getIcon = () => {
  if (process.platform === 'win32') {
    return 'icon-light@2x.ico'
  }
  if (systemPreferences.isDarkMode()) { // macOS
    return 'icon-light.png'
  }
  return 'icon-dark.png'
}

app.on('ready', () => {
  // dev
  // add node_modules\electron\dist\electron.exe to Start Menu(C:\ProgramData\Microsoft\Windows\Start Menu\Programs)
  // main.js add app.setAppUserModelId(process.execPath)
  // https://github.com/electron/electron/issues/10864
  if (app.dock) {
    app.dock.hide() // macOS
  }

  tray = new Tray(path.join(__dirname, getIcon()))
  tray.setPressedImage(path.join(__dirname, 'icon-light.png'))
  if (process.platform === 'win32') {
    tray.on('click', tray.popUpContextMenu)
  }

  browserWindow = new BrowserWindow({
    show: true
  })

  browserWindow.loadURL(`file://${__dirname}/index.html`)

  const activationShortcut = globalShortcut.register('CommandOrControl+Option+C', () => {
    tray.popUpContextMenu()
  });

  if (!activationShortcut) {
    console.error('Global activation shortcut failed to register')
  }

  const clippingShortcut = globalShortcut.register('CommandOrControl+Shift+Option+C', () => {
    const clipping = addClipping()
    if (clipping) {
      browserWindow.webContents.send('show-notification', 'Clipping Added', clipping)
    }
  });

  if (!clippingShortcut) {
    console.error('Global new clipping shortcut failed to register')
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
    // ...clippings.map((clipping, index) => ({ label: clipping })), // the parser doesn't interpret the two braces as an object literal, but as a block statement.
    ...clippings.slice(0, 10).map(createClippingMenuItem),  // only the first 10 items
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

const addClipping = () => {
  const clipping = clipboard.readText()
  if (clippings.includes(clipping)) {
    return
  }
  clippings.unshift(clipping)
  updateMenu()
  return clipping
}

const createClippingMenuItem = (clipping, index) => {
  return {
    label: clipping.length > 20 ? clipping.slice(0, 20) + '...' : clipping,
    click() {
      clipboard.writeText(clipping)
    },
    accelerator: `CommandOrControl+${index}`
  }
}