export function split(str: string, count: number): string[] {
  return new RegExp(`(.{1,${count}})`, 'g').exec(str) || [];
}

export function charCodeToChar(
  str: string,
  count: number,
  radix: number
): string {
  return split(str, count)
    .map((charCode) => String.fromCharCode(parseInt(charCode, radix)))
    .join('');
}

export function charToCharCode(str: string, radix: number): string {
  return str
    .split('')
    .map((char) => char.charCodeAt(0))
    .map((charCode) => charCode.toString(radix))
    .join('');
}
