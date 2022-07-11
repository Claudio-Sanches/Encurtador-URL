import { URLModel } from "database/model/URL"
import { Request, response, Response } from "express"
import shortId from 'shortid'
import { resolveTypeReferenceDirective } from "typescript"
import { config } from "../config/Constants"

export class URLController {
    public async shorten(req: Request, response: Response): Promise<void> {
        //Ver se a URL já não existe
        const { originURL } = req.body
        const url = await URLModel.findOne({ originURL })
        if (url) {
            response.json(url)
            return
        }
        // Criar um hash para essa URL
        const hash = shortId.generate()
        const shortURL = `${config.API_URL}/${hash}`
        const newURL = await URLModel.create({ hash, shortURL, originURL})
        response.json(newURL)
        // Salvar a URL no Banco
        response.json({ originURL, hash, shortURL })
    }


    public async redirect(req: Request, resp: Response): Promise<void> {
        // Pegar hash da URL
        const { hash } = req.params
        // Encontrar a URL original pelo hash
        const url = await URLModel.findOne({ hash })

        if (url){
            response.redirect(url.originURL)
            return
        }
        // Redirecionar para a URL original a partir do que encontramos no DB
        response.status(400).json({error: 'URL not found'})
    }
}