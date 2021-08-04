const fetch = require("node-fetch");
const fs = require("fs");
const fsPromises = require("fs").promises;
const slugify = require("slugify");
const path = require("path");

async function downloadImage(url, file) {
    try {
        // récupération de l'image sur le web
        const response = await fetch(url);

        // écrire le flux dans un fichier en prenant en compte le chemin spécifier
        // On créer un receptacle pour accueiller les données brutes de l'image dans un fichier local
        // Ce fichier a ce stade est vide, c'est une coquille vide.
        // ! attention ne pas confondre avec createReadStream, la ca fonctionne pas du tout, meri Christo !
        const localFile = fs.createWriteStream(file);
        // Maintenant il faut pousser l'ensemble des données reçu dans le fichier afin qu'il ne soit plus vide.
        // J'en profite pour récupérer le résultat, pour voir si tout c'est bien passé.

        const result = response.body.pipe(localFile);

        return result;
    } catch (error) {
        console.error(error);
    }
}

async function createDirectory(dir) {
    try {
        // création du répertoire
        await fsPromises.mkdir(dir, { recursive: true });
    } catch (error) {
        console.error(error);
    }
}

async function fecthNasaImages() {
    try {
        const response = await fetch(
            "https://api.nasa.gov/planetary/apod?api_key=SL4e3tlY9IzTrAxQsNKGvlfxmbqN7bwZ9aM3OKdg&start_date=2019-01-01&end_date=2019-03-31"
        );

        if (response.status !== 200) {
            throw new Error("Bad response");
        }

        let data = await response.json();

        if (!Array.isArray(data)) {
            data = [data];
        }

        for (const image of data) {
            const slug = slugify(image.title);
            const filename = `${image.date}-${slug}`;
            const ext = path.extname(image.url) ?? png;
            const month = image.date.substr(0, 7);
            const baseDir = "photos";

            if (!ext || ["jpg", "jpeg", "png", "gif"].includes(ext)) {
                continue;
            }

            const dir = path.join(baseDir, month);
            await createDirectory(dir);

            const downloadResults = await downloadImage(
                image.url,
                `${dir}/${filename}.${ext}`
            );

            if (downloadResults) {
                console.log(`Downloaded ${downloadResults.path}`);
            }
        }
    } catch (error) {
        console.error(error);
    }
}

fecthNasaImages();
