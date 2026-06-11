from dataclasses import asdict

from fastapi import FastAPI, Form, HTTPException, UploadFile, File
from pydantic import BaseModel, Field

from . import parser_main, parser_fichier
from .stats import calculer_stats, detecter_fuites

app = FastAPI(title="PokerMind Parser API", version="0.3.0")


# ── Modèles JSON ─────────────────────────────────────────────────────────────

class RequeteParsing(BaseModel):
    texte: str
    site: str
    hero: str | None = None


class RequeteStats(BaseModel):
    texte: str = Field(..., description="Fichier complet (N mains)")
    site: str
    hero: str | None = None
    max_fuites: int = Field(default=3, ge=1, le=6)


# ── Helper partagé ────────────────────────────────────────────────────────────

def _reponse_stats(texte: str, site: str, hero: str | None, max_fuites: int) -> dict:
    mains = parser_fichier(texte, site)
    if not mains:
        raise HTTPException(status_code=422, detail="Aucune main valide trouvée dans le fichier")
    stats = calculer_stats(mains, hero_override=hero)
    fuites = detecter_fuites(stats, max_fuites=max_fuites)
    return {
        "mains_analysees": len(mains),
        "stats": {
            "mains": stats.mains,
            "vpip_pct": stats.vpip_pct,
            "pfr_pct": stats.pfr_pct,
            "wwsf_pct": stats.wwsf_pct,
            "fold_3bet_pct": stats.fold_3bet_pct,
            "cbet_pct": stats.cbet_pct,
            "fold_cbet_pct": stats.fold_cbet_pct,
            "ev_par_position": stats.ev_par_position,
            "bb_par_100": stats.bb_par_100,
        },
        "fuites": [asdict(f) for f in fuites],
    }


# ── Endpoints JSON (pour l'API NestJS) ───────────────────────────────────────

@app.post("/parser", summary="Parse une seule main (JSON)")
async def endpoint_parser(requete: RequeteParsing):
    try:
        main = parser_main(requete.texte, requete.site)
        return main.model_dump()
    except NotImplementedError as e:
        raise HTTPException(status_code=501, detail=str(e))
    except (ValueError, KeyError) as e:
        raise HTTPException(status_code=422, detail=str(e))


@app.post("/stats", summary="Stats + fuites sur un fichier complet (JSON)")
async def endpoint_stats(requete: RequeteStats):
    try:
        return _reponse_stats(requete.texte, requete.site, requete.hero, requete.max_fuites)
    except HTTPException:
        raise
    except (NotImplementedError, ValueError, KeyError) as e:
        raise HTTPException(status_code=422, detail=str(e))


# ── Endpoints upload fichier (pour Postman / frontend) ───────────────────────

@app.post("/upload/parser", summary="Parse une seule main (form-data, fichier .txt)")
async def endpoint_upload_parser(
    fichier: UploadFile = File(..., description="Fichier texte d'une main"),
    site: str = Form(..., description="pokerstars | winamax | ggpoker"),
    hero: str | None = Form(None),
):
    try:
        texte = (await fichier.read()).decode("utf-8", errors="replace")
        main = parser_main(texte.strip(), site)
        return main.model_dump()
    except NotImplementedError as e:
        raise HTTPException(status_code=501, detail=str(e))
    except (ValueError, KeyError) as e:
        raise HTTPException(status_code=422, detail=str(e))


@app.post("/upload/stats", summary="Stats + fuites sur un fichier complet (form-data)")
async def endpoint_upload_stats(
    fichier: UploadFile = File(..., description="Fichier texte contenant N mains"),
    site: str = Form(..., description="pokerstars | winamax | ggpoker"),
    hero: str | None = Form(None),
    max_fuites: int = Form(default=3),
):
    try:
        texte = (await fichier.read()).decode("utf-8", errors="replace")
        return _reponse_stats(texte, site, hero, max_fuites)
    except HTTPException:
        raise
    except (NotImplementedError, ValueError, KeyError) as e:
        raise HTTPException(status_code=422, detail=str(e))


@app.post("/lot", summary="Parse toutes les mains d'un fichier (JSON)")
async def endpoint_lot(requete: RequeteParsing):
    try:
        mains = parser_fichier(requete.texte, requete.site)
        if not mains:
            raise HTTPException(status_code=422, detail="Aucune main valide trouvée dans le fichier")
        return [m.model_dump() for m in mains]
    except HTTPException:
        raise
    except (NotImplementedError, ValueError, KeyError) as e:
        raise HTTPException(status_code=422, detail=str(e))


@app.get("/sante", summary="Health check")
async def sante():
    return {"statut": "ok", "version": "0.3.0"}
