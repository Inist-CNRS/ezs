import 'dotenv/config'
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import ezs from '@ezs/core';
import debug from 'debug';
import { createOutputInterceptor } from 'output-interceptor';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

process.env.DEBUG_COLORS = 0;
debug.enable('ezs:*,-ezs:debug,-ezs:trace');

const formatError = (e) => {
  const prefix = '⚠️ ERROR 👇\n\n';
  if (e.message.search(/Lodash:/) !== -1) { // evalmachine error
    return prefix.concat(e.traceback.slice(0,1));
  }
  return prefix.concat(e.message.split('\n').shift());
}

const runEzs = (input, script) => new Promise((resolve) => {
  try {
    const output = [];
    const stream = ezs.createStream(ezs.objectMode());
    const commands = ezs.createCommands({ script });
    const statements = ezs.compileCommands(commands, {});
    ezs
      .createPipeline(stream, statements)
      .pipe(ezs.catch())
      .on('error', (e) => resolve(formatError(e)))
      .on('data', (d) => output.push(d))
      .on('end', () => resolve(output.join('')));
    stream.write(input || '');
    stream.end();
  }
  catch(e) {
    resolve(formatError(e));
  }
});

const runEzsAndCaptureLog = async (input, script) => {
  const interceptOutput = createOutputInterceptor({
    interceptStderr: true,
    interceptStdout: false,
    stripAnsi: true,
  });
  const output = await interceptOutput(async () => {
    const result = await runEzs(input, script);
    return result;
  });
  return ({output, log: interceptOutput.output});
}

const publicLocation = (file = '') => path.join(__dirname, '..', 'build', file);

const app = express();
app.use(express.json());

app.use(express.static(publicLocation()));
app.get('/', function (req, res) {
  res.sendFile(publicLocation('index.html'));
});

app.put('/', (req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  const { input, script } = req.body;
  runEzsAndCaptureLog(input, script)
    .then(({ output, log}) => res.json({ output, log }))
    .catch(next);
});
app.use((err, req, res, next) => {
  res.status(500)
  res.send(formatError(err));
});

const server = app.listen(process.env.PORT || 3001, () =>
  console.log('Server started.')
);

// Intercepte le Ctrl+C (SIGINT)
process.on('SIGINT', () => {
  console.info("Interruption reçue, fermeture du serveur...");
  server.close(() => {
    console.info("Serveur fermé proprement.");
    process.exit(0);
  });
});

// Intercepte l'arrêt Docker (SIGTERM)
process.on('SIGTERM', () => {
  console.info("Signal de terminaison reçu, fermeture...");
  server.close(() => {
    process.exit(0);
  });
});


