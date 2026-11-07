"""Utilidades de dominio compartidas (fechas locales y redondeo, como en SINU)."""

from datetime import date, datetime


def hoy():
    return date.today()


def ahora():
    return datetime.now().replace(microsecond=0)


def r3(n):
    """Redondea cantidades a 3 decimales (evita errores de coma flotante)."""
    return round(float(n) + 0.0, 3)


def dias_hasta(fecha):
    """Dias desde hoy hasta la fecha (negativo = ya paso)."""
    return (fecha - hoy()).days


def fmt_num(n):
    """Numero en formato es-CO: 1.234,5"""
    texto = f"{r3(n):,.3f}".rstrip("0").rstrip(".")
    return texto.replace(",", "_").replace(".", ",").replace("_", ".")


MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sept", "oct", "nov", "dic"]


def fmt_fecha(f):
    return f"{f.day:02d} {MESES[f.month - 1]} {f.year}"
