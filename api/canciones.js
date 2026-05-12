import fs from "fs";
import path from "path";
import { parseFile } from "music-metadata";

export default async function handler(req, res) {
    const carpeta = path.join(process.cwd(), "Musica");

    let archivos;
    try {
        archivos = fs.readdirSync(carpeta).filter(f => f.endsWith(".mp3"));
    } catch {
        return res.status(200).json([]);
    }

    const canciones = await Promise.all(archivos.map(async (nombre) => {
        const ruta = path.join(carpeta, nombre);

        try {
            const metadata = await parseFile(ruta);
            const { common } = metadata;
            return {
                titulo: common.title || nombre.replace(/\.mp3$/i, ""),
                interpretes: common.artist || "Desconocido",
                src: `/Musica/${nombre}`
            };
        } catch {
            const sinExtension = nombre.replace(/\.mp3$/i, "");
            const partes = sinExtension.split(" - ");
            return {
                titulo: partes[0]?.trim() || sinExtension,
                interpretes: partes[1]?.trim() || "Desconocido",
                src: `/Musica/${nombre}`
            };
        }
    }));

    res.setHeader("Cache-Control", "no-store");
    res.status(200).json(canciones);
}
