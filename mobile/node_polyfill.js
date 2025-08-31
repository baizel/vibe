// Polyfill for Node.js os.availableParallelism for older Node versions
const os = require('os');

if (!os.availableParallelism) {
  os.availableParallelism = function() {
    return os.cpus().length;
  };
}