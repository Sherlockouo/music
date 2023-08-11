import {FastifyPluginAsync} from 'fastify'
import type {RetrievedSongInfo, Song} from "@unblockneteasemusic/rust-napi";
import * as UNM from "@unblockneteasemusic/rust-napi";


const album: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
    UNM.enableLogging(UNM.LoggingType.ConsoleEnv);
    const executor = new UNM.Executor();
    const ctx = {};
    fastify.get<{
        Querystring: {
            /* 设置搜索引擎 */
            /**
             * Bilbili Music    bilibili        ✅
             * 酷狗音乐    kugou        ✅
             * 酷我音乐    kuwo    目前僅支援 320kbps MP3    ✅
             * 咪咕音乐    migu
             * JOOX    joox    需要設定 joox:cookie，見引擎文件。    ✅
             * YtDl    ytdl    預設使用的 youtube-dl 後端是 yt-dlp，可設定 ytdl:exe 調整    ✅
             * 第三方網易雲 API    pyncm        ✅
             * QQ 音乐    qq    需要設定 qq:cookie，見引擎文件。    ✅
             * */
            engine?: "bilibili" | "kugou" | "kuwo" | "migu" | "joox" | "ytdl" | "pyncm" | "qq",
            id: Song["id"],
            name: Song["name"],
            duration: Song["duration"],
            artists: Song["artists"],
            album: Song["album"],
        }
    }>('/album', opts, async function (request, reply): Promise<RetrievedSongInfo | undefined> {
        const {engine, id, name} = request.query;
        if (!name) {
            reply.code(400).send('params "name" is required')
            return;
        }
        // if (!artists) {
        //     reply.code(400).send('params "artists" is required')
        //     return;
        // }
        return executor.retrieve({
            source: engine as string,
            identifier: id,

        }, ctx);
        // return executor.search(
        //     engine ? [engine] : executor.list(),
        //     {
        //         id, name, duration, artists: [
        //             {
        //                 id: "11127",
        //                 name: "Beyond",
        //                 // picUrl: null,
        //                 // alias: [],
        //                 // albumSize: 0,
        //                 // picId: 0,
        //                 // fansGroup: null,
        //                 // img1v1Url: "https://p1.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg",
        //                 // img1v1: 0,
        //                 // trans: null
        //             }
        //         ], album
        //     },
        //     ctx
        // )
    });
}

export default album;
//
// "id": 1357375695,
//     "name": " 海阔天空 ",
//     "artists": [

// ],
//     "album": {
//     "id": 78372827,
//         "name": " 华纳廿三周年纪念精选系列 - B﻿eyond",
//         "artist": {
//         "id": 0,
//             "name": "",
//             "picUrl": null,
//             "alias": [],
//             "albumSize": 0,
//             "picId": 0,
//             "fansGroup": null,
//             "img1v1Url": "https://p1.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg",
//             "img1v1": 0,
//             "trans": null
//     },
//     "publishTime": 999273600000,
//         "size": 15,
//         "copyrightId": 7002,
//         "status": 1,
//         "picId": 109951163984013010,
//         "mark": 0
// },
// "duration": 239506,
//     "copyrightId": 7002,
//     "status": 0,
//     "alias": [],
//     "rtype": 0,
//     "ftype": 0,
//     "mvid": 5501497,
//     "fee": 1,
//     "rUrl": null,
//     "mark": 8192
// },
