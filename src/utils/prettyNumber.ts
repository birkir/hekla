export default (num: number, suffix: string = '', size: number = 1000) => {
  const sizes = ['', 'K', 'M', 'B'];
  const i = num === 0 ? 0 : Math.floor(Math.log(num) / Math.log(size));
  const res = parseFloat((num / Math.pow(size, i)).toFixed(1)) ;
  return `${res}${sizes[i]} ${res === 1 ? suffix.replace(/s$/, '') : suffix}`.trim();
};
