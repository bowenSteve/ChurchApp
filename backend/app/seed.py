from sqlalchemy.orm import Session

from . import models

DEFAULT_MASS_PARTS = [
    "Entrance",
    "Penitential Act",
    "Gloria",
    "First Reading",
    "Responsorial Psalm",
    "Second Reading",
    "Gospel Acclamation",
    "Gospel",
    "Homily",
    "Creed",
    "Prayers of the Faithful",
    "Offertory",
    "Sanctus",
    "Mystery of Faith",
    "Great Amen",
    "Our Father",
    "Lamb of God",
    "Communion",
    "Post-Communion",
    "Recessional",
]


def seed_mass_parts(db: Session) -> None:
    if db.query(models.MassPart).count() > 0:
        return
    for index, name in enumerate(DEFAULT_MASS_PARTS):
        db.add(models.MassPart(name=name, default_order=index, is_active=True))
    db.commit()


def seed_settings(db: Session) -> None:
    if db.query(models.Settings).count() > 0:
        return
    db.add(models.Settings(id=1))
    db.commit()


def run_seed(db: Session) -> None:
    seed_mass_parts(db)
    seed_settings(db)
