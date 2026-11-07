"""
Script para generar una SECRET_KEY segura para Flask.
Ejecutar: python scripts/generate_secret.py

Esta clave debe copiarse al archivo .env en la variable SECRET_KEY.
NUNCA compartas esta clave publicamente.
"""

import secrets

secret_key = secrets.token_hex(32)

print("\n" + "=" * 60)
print("Tu nueva SECRET_KEY es:")
print("=" * 60)
print(secret_key)
print("=" * 60)
print("\nCopia esta clave y pegala en tu archivo .env:")
print(f"SECRET_KEY='{secret_key}'")
print()
