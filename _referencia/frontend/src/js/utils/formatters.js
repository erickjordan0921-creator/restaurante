export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => {
    switch (character) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      case "'":
        return '&#39;';
      default:
        return character;
    }
  });
}

export function formatCurrency(value) {
  const numericValue = Number(value ?? 0);
  const amount = Number.isFinite(numericValue) ? numericValue : 0;

  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function truncateText(text, maxLength = 120) {
  const content = String(text ?? '').trim();

  if (!content) {
    return '';
  }

  if (content.length <= maxLength) {
    return content;
  }

  return `${content.slice(0, maxLength).trimEnd()}...`;
}
