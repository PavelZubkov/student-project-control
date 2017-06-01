// put your javascript (node.js) code here
process.stdin.setEncoding('utf8');

process.stdin.on('readable', () => {
  let param = process.stdin.read();
  if (param !== null) {
    let out = param.split(' ').reduce(function(prev, curr) {
      return parseInt(prev) + parseInt(curr);
    });
    process.stdout.write(out.toString());
  }
});

