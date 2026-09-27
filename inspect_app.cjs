const http = require('http');
const fs = require('fs');
const { spawn } = require('child_process');

async function main() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const proc = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--window-size=390,844',
    '--user-data-dir=C:\\Users\\ao837\\AppData\\Local\\Temp\\edge_debug_dir_mobile',
    'http://localhost:5173/?lang=ar'
  ]);

  // Wait 2 seconds for Edge to start
  await new Promise(r => setTimeout(r, 2000));

  // Get list of targets
  http.get('http://127.0.0.1:9222/json', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', async () => {
      try {
        const targets = JSON.parse(data);
        console.log('Targets:', targets.map(t => ({ title: t.title, url: t.url })));
        const page = targets.find(t => t.type === 'page' || t.url.includes('localhost'));
        if (!page) {
          console.log('No page target found');
          proc.kill();
          return;
        }

        const wsUrl = page.webSocketDebuggerUrl;
        console.log('WS URL:', wsUrl);

        // Connect via WebSocket (built into Node 22 or via ws)
        const WebSocket = globalThis.WebSocket || require('ws');
        const ws = new WebSocket(wsUrl);

        let id = 1;
        const send = (method, params = {}) => new Promise((resolve) => {
          const reqId = id++;
          const handler = (msg) => {
            const parsed = JSON.parse(msg.data || msg);
            if (parsed.id === reqId) {
              ws.removeEventListener('message', handler);
              resolve(parsed.result);
            }
          };
          ws.addEventListener('message', handler);
          ws.send(JSON.stringify({ id: reqId, method, params }));
        });

        ws.onopen = async () => {
          console.log('Connected to CDP');
          await send('Page.enable');
          await send('Runtime.enable');

          // Check console logs & errors
          ws.onmessage = (event) => {
            const m = JSON.parse(event.data);
            if (m.method === 'Runtime.consoleAPICalled' || m.method === 'Runtime.exceptionThrown') {
              console.log('BROWSER LOG/ERROR:', JSON.stringify(m.params));
            }
          };

          // Wait 2.5s for fonts & scene ready
          await new Promise(r => setTimeout(r, 2500));

          // Evaluate document state
          const evalResult = await send('Runtime.evaluate', {
            expression: `(() => {
              const env = document.querySelector('.envelope');
              const r = env ? env.getBoundingClientRect() : null;
              const img = document.querySelector('.env-front__img');
              return {
                stage: document.querySelector('.scene')?.className,
                ready: document.querySelector('.scene')?.classList.contains('is-ready'),
                opacity: window.getComputedStyle(document.querySelector('.scene')).opacity,
                envelopeExists: !!env,
                envBounds: r ? { x: r.x, y: r.y, width: r.width, height: r.height } : null,
                imgLoaded: img?.complete,
                imgNaturalWidth: img?.naturalWidth,
                waxSealExists: !!document.querySelector('.wax-seal'),
                ctaText: document.querySelector('.env-cta__text')?.innerText,
                pageVisible: document.querySelector('.page')?.classList.contains('is-visible'),
              };
            })()`,
            returnByValue: true
          });
          console.log('DOM State:', JSON.stringify(evalResult.result.value, null, 2));

          // Capture initial envelope screenshot
          const snap1 = await send('Page.captureScreenshot', { format: 'png' });
          if (snap1 && snap1.data) {
            fs.writeFileSync('envelope_initial.png', Buffer.from(snap1.data, 'base64'));
            console.log('Saved envelope_initial.png');
          }

          // Click envelope
          console.log('Clicking envelope...');
          await send('Runtime.evaluate', {
            expression: `document.querySelector('.envelope')?.click()`
          });

          // Wait 800ms
          await new Promise(r => setTimeout(r, 800));
          const snap2 = await send('Page.captureScreenshot', { format: 'png' });
          if (snap2 && snap2.data) {
            fs.writeFileSync('envelope_opening.png', Buffer.from(snap2.data, 'base64'));
            console.log('Saved envelope_opening.png');
          }

          // Wait another 1500ms
          await new Promise(r => setTimeout(r, 1500));
          const snap3 = await send('Page.captureScreenshot', { format: 'png' });
          if (snap3 && snap3.data) {
            fs.writeFileSync('envelope_after.png', Buffer.from(snap3.data, 'base64'));
            console.log('Saved envelope_after.png');
          }

          const evalResultAfter = await send('Runtime.evaluate', {
            expression: `({
              stage: document.querySelector('.scene')?.className,
              pageVisible: document.querySelector('.page')?.classList.contains('is-visible'),
              pageOpacity: window.getComputedStyle(document.querySelector('.page')).opacity,
              scrollY: window.scrollY
            })`,
            returnByValue: true
          });
          console.log('DOM State After:', JSON.stringify(evalResultAfter.result.value, null, 2));

          ws.close();
          proc.kill();
          process.exit(0);
        };
      } catch (err) {
        console.error('Error in CDP:', err);
        proc.kill();
        process.exit(1);
      }
    });
  }).on('error', (err) => {
    console.error('HTTP error to CDP:', err);
    proc.kill();
    process.exit(1);
  });
}

main().catch(console.error);
