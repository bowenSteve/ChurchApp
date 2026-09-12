import { useEffect, useState } from 'react'
import { getElectronBridge, type UpdateStatus } from '../../lib/electronBridge'

export default function UpdateChecker() {
  const electron = getElectronBridge()
  const [version, setVersion] = useState<string | null>(null)
  const [status, setStatus] = useState<UpdateStatus | null>(null)

  useEffect(() => {
    if (!electron) return
    electron.getAppVersion().then(setVersion)
    electron.onUpdateStatus(setStatus)
    return () => electron.removeUpdateListener()
  }, [electron])

  function statusLine() {
    if (!status) return null
    switch (status.type) {
      case 'checking':
        return <p className="text-sm text-paper-dim">Checking for updates…</p>
      case 'not-available':
        return <p className="text-sm text-paper-dim">You're on the latest version.</p>
      case 'dev-mode':
        return <p className="text-sm text-paper-faint">Updates only work in the installed app, not in dev mode.</p>
      case 'available':
        return (
          <div className="space-y-2">
            <p className="text-sm text-paper-dim">Version {status.version} is available.</p>
            <button className="btn btn-primary btn-sm" onClick={() => electron!.downloadUpdate()}>
              Download Update
            </button>
          </div>
        )
      case 'downloading':
        return <p className="text-sm text-paper-dim">Downloading update… {status.percent}%</p>
      case 'downloaded':
        return (
          <div className="space-y-2">
            <p className="text-sm text-paper-dim">
              Version {status.version} is ready to install.
            </p>
            <button className="btn btn-primary btn-sm" onClick={() => electron!.installUpdate()}>
              Restart & Install
            </button>
          </div>
        )
      case 'error':
        return <p className="banner-error inline-block">Update check failed: {status.message}</p>
      default:
        return null
    }
  }

  return (
    <div className="space-y-3 border-t border-hairline pt-5">
      <h3 className="font-display text-lg">Software Updates</h3>

      {!electron ? (
        <p className="banner-warn">
          Updates are only available in the installed desktop app — you're viewing this in a browser.
        </p>
      ) : (
        <>
          {version && <p className="text-xs text-paper-faint">Current version: {version}</p>}
          <button className="btn btn-neutral" onClick={() => electron.checkForUpdates()}>
            Check for Updates
          </button>
          {statusLine()}
        </>
      )}
    </div>
  )
}
