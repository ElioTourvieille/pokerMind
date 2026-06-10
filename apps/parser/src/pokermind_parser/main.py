from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from . import parser_main

app = FastAPI(title="PokerMind Parser", version="0.1.0")


class RequeteParsing(BaseModel):
    texte: str
    site: str
    hero: str | None = None


@app.post("/parser")
async def parser_historique(requete: RequeteParsing):
    try:
        resultat = parser_main(requete.texte, requete.site)
        return resultat.model_dump()
    except NotImplementedError as e:
        raise HTTPException(status_code=501, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))


@app.get("/sante")
async def sante():
    return {"statut": "ok"}
