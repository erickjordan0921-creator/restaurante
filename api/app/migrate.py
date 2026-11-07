"""
Flask-Migrate: la extension se inicializa dentro del app factory.
Este modulo re-exporta la instancia `migrate` para uso externo si es necesario.
"""

from app import migrate  # noqa: F401
