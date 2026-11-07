"""Excepciones de dominio compartidas.

Cada dominio define sus propias excepciones heredando de ErrorDominio y fijando
`codigo_http`. El app factory registra un unico manejador para todas ellas,
en lugar de un manejador por excepcion como en la API de referencia.
"""


class ErrorDominio(Exception):
    codigo_http = 400


class DatosInvalidosError(ErrorDominio):
    """Errores de validacion de DTOs (incluye el detalle por campo)."""

    codigo_http = 400

    def __init__(self, details):
        super().__init__("Datos de entrada invalidos.")
        self.details = details


class NoEncontradoError(ErrorDominio):
    codigo_http = 404


class ConflictoError(ErrorDominio):
    """Regla de negocio incumplida (stock insuficiente, estado no valido, etc.)."""

    codigo_http = 409


class CredencialesInvalidasError(ErrorDominio):
    codigo_http = 401


class PermisoDenegadoError(ErrorDominio):
    codigo_http = 403
