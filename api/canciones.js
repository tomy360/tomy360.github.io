import fs from "fs";
import path from "path";

export default function handler(req, res) {
    // Ruta a la carpeta Musica/ desde la raíz del proyecto
    const carpeta = path.join(process.cwd(), "Musica");

    let archivos;
    try {
        archivos = fs.readdirSync(carpeta).filter(f => f.endsWith(".mp3"));
    } catch {
        return res.status(200).json([]);
    }

    const canciones = archivos.map(nombre => {
        const sinExtension = nombre.replace(/\.mp3$/i, "");
        const partes = sinExtension.split(" - ");

        return {
            titulo: partes[0]?.trim() || sinExtension,
            interpretes:  partes[1]?.trim() || "Desconocido",
            src:    `/Musica/${nombre}`
        };
    });

    res.setHeader("Cache-Control", "no-store");
    res.status(200).json(canciones);
}
