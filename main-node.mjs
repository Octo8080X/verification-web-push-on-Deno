import { Hono } from "hono";
import webpush  from 'web-push';
import { openKv } from "@deno/kv";
import { readFileSync } from 'node:fs';

const publicVapidKey =
  "BD1ObFM0zgGLIngkiDRaFuk5y6fSbVXckzDdq-CVXjaoIqh1x5sBl73wFyAPwv1FLjhoM8Ixn5SL24cPGAB8gUw";
const privateVapidKey = "yaf7eM8ZMpC7BIFyhaNRZ58akupL2I6sjzPESeRpflg";

webpush.setVapidDetails(
  "mailto:localhost", // アプリケーションのmailtoまたはURL // ローカルで試すときhttpではできなかった
  publicVapidKey,
  privateVapidKey
);

const kv = await openKv("db");

const app = new Hono();

app.post("/subscribe", async (c) => {
  console.log("/subscribe");

  const json = await c.req.json();
  console.log("Received subscription", json);

  const subscription = json;
  console.log("Received subscription", subscription);

  try {
    await kv.set(["subscription", Date.now()], subscription);
    
    const payload = JSON.stringify({ title: `Push Test ${Date.now()}` });
    const a = await webpush.sendNotification(subscription, payload,
      {
        contentEncoding: 'aes128gcm',
      });
    console.log(a)

  } catch(e) {
    console.log(e)
  }


  return c.json({ success: true });
});


setInterval(async () => {
  console.log("push")
  const payload = JSON.stringify({ title: `Push Test ${Date.now()}` });
  
  const li = await kv.list({prefix: ["subscription"]})
 
  console.log(li)
  for await (const {key, value} of li) {
    console.log(key, value)
    try{
      console.log(key, value)
      const a = await webpush.sendNotification(value, payload,
        {
          headers:{        
            "Content-Type": 'application/octet-stream',
            "Content-Encoding": 'aesgcm',
          },
          contentEncoding: 'aesgcm',
        });
      console.log(a)  
    }
    catch(e) {
      console.log(e)
    }
  }

}, 5000);





app.get("/public/:path", (c) => {
  const path = c.req.param("path");
  if (path.endsWith(".css")) {
    c.header("Content-Type", "text/css");
  } else if (path.endsWith(".js")) {
    c.header("Content-Type", "application/javascript");
  } else if (path.endsWith(".html")) {
    c.header("Content-Type", "text/html");
  } else if (path.endsWith(".json")) {
    c.header("Content-Type", "application/json");
  } else if (path.endsWith(".png")) {
    c.header("Content-Type", "image/png");
  }

  return c.body(readFileSync(`./public/${path}`));
});

app.get("/:path", (c) => {
  const path = c.req.param("path");
  if (path.endsWith(".css")) {
    c.header("Content-Type", "text/css");
  } else if (path.endsWith(".js")) {
    c.header("Content-Type", "application/javascript");
  } else if (path.endsWith(".html")) {
    c.header("Content-Type", "text/html");
  } else if (path.endsWith(".json")) {
    c.header("Content-Type", "application/json");
  }
  return c.body(readFileSync(`./${path}`));
});

app.get("/", (c) => c.html(readFileSync("./public/index.html")));

//export default {
//  fetch(request) {
//    return app.fetch(request);
//  },
//};

import { serve } from '@hono/node-server'


serve(
  {
    fetch: app.fetch,
    port: 8000,
  }
)