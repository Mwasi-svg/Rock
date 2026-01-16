import { ipcRenderer, contextBridge } from 'electron'

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },

  // You can expose other APTs you need here.
  // ...
})

// --------- Data Persistence API ---------
contextBridge.exposeInMainWorld('rockData', {
  async getData(): Promise<unknown> {
    return ipcRenderer.invoke('get-data')
  },
  async saveData(data: unknown): Promise<boolean> {
    return ipcRenderer.invoke('save-data', data)
  },
  async getDataPath(): Promise<string> {
    return ipcRenderer.invoke('get-data-path')
  },
})

// --------- Git API ---------
contextBridge.exposeInMainWorld('rockGit', {
  async verifyRepo(repoPath: string): Promise<boolean> {
    return ipcRenderer.invoke('git-verify-repo', repoPath)
  },
  async getStatus(repoPath: string): Promise<unknown> {
    return ipcRenderer.invoke('git-status', repoPath)
  },
  async getLog(repoPath: string, limit?: number): Promise<unknown[]> {
    return ipcRenderer.invoke('git-log', repoPath, limit)
  },
  async getBranches(repoPath: string): Promise<unknown[]> {
    return ipcRenderer.invoke('git-branches', repoPath)
  },
  async getCurrentBranch(repoPath: string): Promise<string> {
    return ipcRenderer.invoke('git-current-branch', repoPath)
  },
  async commit(repoPath: string, message: string, files: string[]): Promise<void> {
    return ipcRenderer.invoke('git-commit', repoPath, message, files)
  },
  async push(repoPath: string): Promise<void> {
    return ipcRenderer.invoke('git-push', repoPath)
  },
  async pull(repoPath: string): Promise<void> {
    return ipcRenderer.invoke('git-pull', repoPath)
  },
  async fetch(repoPath: string): Promise<void> {
    return ipcRenderer.invoke('git-fetch', repoPath)
  },
  async switchBranch(repoPath: string, branch: string): Promise<void> {
    return ipcRenderer.invoke('git-switch-branch', repoPath, branch)
  },
  async createBranch(repoPath: string, branchName: string): Promise<void> {
    return ipcRenderer.invoke('git-create-branch', repoPath, branchName)
  },
  async clone(url: string, destinationPath: string): Promise<void> {
    return ipcRenderer.invoke('git-clone', url, destinationPath)
  },
  async getRemoteUrl(repoPath: string): Promise<string> {
    return ipcRenderer.invoke('git-remote-url', repoPath)
  },
  async selectDirectory(): Promise<string | null> {
    return ipcRenderer.invoke('dialog-open-directory')
  },
})

// --------- Preload scripts loading ---------
function domReady(condition: DocumentReadyState[] = ['complete', 'interactive']) {
  return new Promise(resolve => {
    if (condition.includes(document.readyState)) {
      resolve(true)
    } else {
      document.addEventListener('readystatechange', () => {
        if (condition.includes(document.readyState)) {
          resolve(true)
        }
      })
    }
  })
}

const safeDOM = {
  append(parent: HTMLElement, child: HTMLElement) {
    if (!Array.from(parent.children).find(e => e === child)) {
      return parent.appendChild(child)
    }
  },
  remove(parent: HTMLElement, child: HTMLElement) {
    if (Array.from(parent.children).find(e => e === child)) {
      return parent.removeChild(child)
    }
  },
}

/**
 * https://tobiasahlin.com/spinkit
 * https://connoratherton.com/loaders
 * https://projects.lukehaas.me/css-loaders
 * https://matejkustec.github.io/SpinThatShit
 */
function useLoading() {
  const className = `loaders-css__square-spin`
  const styleContent = `
@keyframes square-spin {
  25% { transform: perspective(100px) rotateX(180deg) rotateY(0); }
  50% { transform: perspective(100px) rotateX(180deg) rotateY(180deg); }
  75% { transform: perspective(100px) rotateX(0) rotateY(180deg); }
  100% { transform: perspective(100px) rotateX(0) rotateY(0); }
}
.${className} > div {
  animation-fill-mode: both;
  width: 50px;
  height: 50px;
  background: #fff;
  animation: square-spin 3s 0s cubic-bezier(0.09, 0.57, 0.49, 0.9) infinite;
}
.app-loading-wrap {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #282c34;
  z-index: 9;
}
    `
  const oStyle = document.createElement('style')
  const oDiv = document.createElement('div')

  oStyle.id = 'app-loading-style'
  oStyle.innerHTML = styleContent
  oDiv.className = 'app-loading-wrap'
  oDiv.innerHTML = `<div class="${className}"><div></div></div>`

  return {
    appendLoading() {
      safeDOM.append(document.head, oStyle)
      safeDOM.append(document.body, oDiv)
    },
    removeLoading() {
      safeDOM.remove(document.head, oStyle)
      safeDOM.remove(document.body, oDiv)
    },
  }
}

// ----------------------------------------------------------------------

const { appendLoading, removeLoading } = useLoading()
domReady().then(appendLoading)

window.onmessage = (ev) => {
  ev.data.payload === 'removeLoading' && removeLoading()
}

setTimeout(removeLoading, 4999)