import { IpcChannels } from "@/shared/IpcChannels"

export const checkAPPUpdate = ()=>{
    window.ipcRenderer?.invoke(IpcChannels.CheckUpdate)
}