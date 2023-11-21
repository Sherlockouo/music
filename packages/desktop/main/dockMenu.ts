import { IpcChannels } from "@/shared/IpcChannels";
import { BrowserWindow } from "electron";

const { Menu } = require('electron');

export function createDockMenu(win: BrowserWindow | null) {
    return Menu.buildFromTemplate([
        {
            label: 'PlayOrPause',
            click() {
                win?.webContents.send(IpcChannels.PlayOrPause);
            },
        },
        {
            label: 'Next',
            click() {
                win?.webContents.send(IpcChannels.Next);
            },
        },
        {
            label: 'Previous',
            click() {
                win?.webContents.send(IpcChannels.Previous);
            },
        },
    ]);
}
