const spawn = require('child_process').spawn;
const process = spawn('ls', ['-lh', '/usr']);

process.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

process.stderr.on('data', (data) => {
  console.log(`stderr: ${data}`);
});

process.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});

/*  try to spawn
child = child_process.spawn('process', ['-lh', '/usr']);
child.stdout.setEncoding('utf8');
child.stdout.on('data', function(data) {
  console.log(data);
});
*/
