import { app, BrowserWindow, shell, ipcMain, dialog } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import os from 'node:os'
import { update } from './update'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.mjs   > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.APP_ROOT = path.join(__dirname, '../..')

export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

// Disable GPU Acceleration for Windows 7
if (os.release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId('com.rock.app')

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

let win: BrowserWindow | null = null
const preload = path.join(__dirname, '../preload/index.mjs')
const indexHtml = path.join(RENDERER_DIST, 'index.html')

async function createWindow() {
  win = new BrowserWindow({
    title: 'Rock',
    autoHideMenuBar: true,
    icon: path.join(process.env.VITE_PUBLIC, 'favicon.ico'),
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // nodeIntegration: true,

      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      // contextIsolation: false,
    },
  })

  console.log('Icon path:', path.join(process.env.VITE_PUBLIC, 'favicon.ico'));
  if (VITE_DEV_SERVER_URL) { // #298
    win.loadURL(VITE_DEV_SERVER_URL)
    // Open devTool if the app is not packaged
    win.webContents.openDevTools()
  } else {
    win.loadFile(indexHtml)
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })

  // Auto update
  update(win)
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})

// New window example arg: new windows url
ipcMain.handle('open-win', (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  if (VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${VITE_DEV_SERVER_URL}#${arg}`)
  } else {
    childWindow.loadFile(indexHtml, { hash: arg })
  }
})

// ----------------- Data Persistence -----------------
import fs from 'node:fs'

const USER_DATA_PATH = app.getPath('userData')
const DATA_FILE = path.join(USER_DATA_PATH, 'rock-data.json')

interface AppData {
  events?: unknown[]
  tasks?: unknown[]
  spending?: unknown[]
}

function readData(): AppData {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8')
      return JSON.parse(raw)
    }
  } catch (e) {
    console.error('Failed to read data file:', e)
  }
  return {}
}

function writeData(data: AppData): boolean {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8')
    return true
  } catch (e) {
    console.error('Failed to write data file:', e)
    return false
  }
}

ipcMain.handle('get-data', () => {
  return readData()
})

ipcMain.handle('save-data', (_, data: AppData) => {
  return writeData(data)
})

ipcMain.handle('get-data-path', () => {
  return DATA_FILE
})

// ----------------- Git Operations -----------------
import * as GitAPI from './git-api'

ipcMain.handle('git-verify-repo', async (_, repoPath: string) => {
  try {
    return await GitAPI.verifyRepository(repoPath)
  } catch (error: any) {
    console.error('git-verify-repo error:', error)
    return false
  }
})

ipcMain.handle('git-status', async (_, repoPath: string) => {
  try {
    return await GitAPI.getStatus(repoPath)
  } catch (error: any) {
    console.error('git-status error:', error)
    throw error
  }
})

ipcMain.handle('git-log', async (_, repoPath: string, limit?: number) => {
  try {
    return await GitAPI.getLog(repoPath, limit)
  } catch (error: any) {
    console.error('git-log error:', error)
    throw error
  }
})

ipcMain.handle('git-branches', async (_, repoPath: string) => {
  try {
    return await GitAPI.getBranches(repoPath)
  } catch (error: any) {
    console.error('git-branches error:', error)
    throw error
  }
})

ipcMain.handle('git-current-branch', async (_, repoPath: string) => {
  try {
    return await GitAPI.getCurrentBranch(repoPath)
  } catch (error: any) {
    console.error('git-current-branch error:', error)
    throw error
  }
})

ipcMain.handle('git-commit', async (_, repoPath: string, message: string, files: string[]) => {
  try {
    return await GitAPI.commit(repoPath, message, files)
  } catch (error: any) {
    console.error('git-commit error:', error)
    throw error
  }
})

ipcMain.handle('git-push', async (_, repoPath: string) => {
  try {
    return await GitAPI.push(repoPath)
  } catch (error: any) {
    console.error('git-push error:', error)
    throw error
  }
})

ipcMain.handle('git-pull', async (_, repoPath: string) => {
  try {
    return await GitAPI.pull(repoPath)
  } catch (error: any) {
    console.error('git-pull error:', error)
    throw error
  }
})

ipcMain.handle('git-fetch', async (_, repoPath: string) => {
  try {
    return await GitAPI.fetch(repoPath)
  } catch (error: any) {
    console.error('git-fetch error:', error)
    throw error
  }
})

ipcMain.handle('git-switch-branch', async (_, repoPath: string, branch: string) => {
  try {
    return await GitAPI.switchBranch(repoPath, branch)
  } catch (error: any) {
    console.error('git-switch-branch error:', error)
    throw error
  }
})

ipcMain.handle('git-create-branch', async (_, repoPath: string, branchName: string) => {
  try {
    return await GitAPI.createBranch(repoPath, branchName)
  } catch (error: any) {
    console.error('git-create-branch error:', error)
    throw error
  }
})

ipcMain.handle('git-clone', async (_, url: string, destinationPath: string) => {
  try {
    return await GitAPI.cloneRepository(url, destinationPath)
  } catch (error: any) {
    console.error('git-clone error:', error)
    throw error
  }
})

ipcMain.handle('git-remote-url', async (_, repoPath: string) => {
  try {
    return await GitAPI.getRemoteUrl(repoPath)
  } catch (error: any) {
    console.error('git-remote-url error:', error)
    return ''
  }
})

ipcMain.handle('dialog-open-directory', async () => {
  const result = await dialog.showOpenDialog(win!, {
    properties: ['openDirectory'],
  })
  if (result.canceled) return null
  return result.filePaths[0]
})
