/**
 * Amount formatting utilities matching EstateVaultCRM AmountFormattingUtils.kt
 * Formats numbers into South Asian words (Crore, Lakh, Thousand) and provides
 * comma-formatted inputs.
 */

export function formatAmountInWords(amount: number): string {
  if (!amount || amount <= 0) return '';
  let num = Math.floor(amount);
  const parts: string[] = [];

  const crore = Math.floor(num / 10_000_000);
  if (crore > 0) {
    parts.push(`${crore} Crore`);
    num %= 10_000_000;
  }

  const lakh = Math.floor(num / 100_000);
  if (lakh > 0) {
    parts.push(`${lakh} Lakh`);
    num %= 100_000;
  }

  const thousand = Math.floor(num / 1_000);
  if (thousand > 0) {
    parts.push(`${thousand} Thousand`);
    num %= 1_000;
  }

  if (num > 0 && parts.length === 0) {
    parts.push(`${num}`);
  }

  return parts.join(' ');
}

export function formatCommas(amount: number): string {
  if (isNaN(amount)) return '0';
  return new Intl.NumberFormat('en-US').format(Math.floor(amount));
}

export function formatAmountWithWords(
  amount: number | string,
  currencyPrefix: string = 'PKR'
): string {
  let num = typeof amount === 'string' ? parseAmountToNumber(amount) : amount;
  if (!num || num <= 0) {
    return currencyPrefix ? `${currencyPrefix} 0` : '0';
  }
  const formattedNum = formatCommas(num);
  const words = formatAmountInWords(num);
  const prefixStr = currencyPrefix ? `${currencyPrefix} ` : '';
  return words ? `${prefixStr}${formattedNum} (${words})` : `${prefixStr}${formattedNum}`;
}

export function formatInputWithCommas(rawInput: string): string {
  if (!rawInput) return '';
  const clean = rawInput.replace(/[^0-9.]/g, '');
  if (!clean) return '';
  const parts = clean.split('.');
  const integerPart = parts[0] ? new Intl.NumberFormat('en-US').format(Number(parts[0])) : '';
  return parts.length > 1 ? `${integerPart}.${parts[1]}` : integerPart;
}

export function parseAmountToNumber(formattedInput: string | number): number {
  if (typeof formattedInput === 'number') return formattedInput;
  if (!formattedInput) return 0;
  const clean = String(formattedInput).replace(/[^0-9.]/g, '');
  return parseFloat(clean) || 0;
}
