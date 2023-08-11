import {FastifyPluginAsync} from 'fastify'
import type {Song, SongSearchInformation} from "@unblockneteasemusic/rust-napi";
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
    }>('/album', opts, async function (request, reply): Promise<SongSearchInformation | undefined> {
        const {engine, id, name, duration, artists, album} = request.query;
        const neteaseId = Number(id)
        if (isNaN(neteaseId)) {
            reply.code(400).send('params "id" is required')
            return
        }
        if (!name) {
            reply.code(400).send('params "name" is required')
            return;
        }
        if (!artists) {
            reply.code(400).send('params "artists" is required')
            return;
        }
        return executor.search(
            engine ? [engine] : executor.list(),
            {
                id, name, duration, artists, album
            },
            ctx
        )
    });
}

export default album;

