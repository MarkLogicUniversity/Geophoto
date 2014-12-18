var match = '2011-07-15 13:18:52'.match(/^(\d+)-(\d+)-(\d+) (\d+)\:(\d+)\:(\d+)$/)
var date = new Date(match[1], match[2] - 1, match[3], match[4], match[5], match[6])
// big gotcha -------------------------^^^
// month must be between 0 and 11, not 1 and 12
console.log(date);
