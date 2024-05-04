import { Hono } from "npm:hono";
import webpush from "npm:web-push";

const publicVapidKey =
  "BD1ObFM0zgGLIngkiDRaFuk5y6fSbVXckzDdq-CVXjaoIqh1x5sBl73wFyAPwv1FLjhoM8Ixn5SL24cPGAB8gUw";
const privateVapidKey = "yaf7eM8ZMpC7BIFyhaNRZ58akupL2I6sjzPESeRpflg";

webpush.setVapidDetails(
  "mailto:localhost", // アプリケーションのmailtoまたはURL // ローカルで試すときhttpではできなかった
  publicVapidKey,
  privateVapidKey
);

const kv = await Deno.openKv();

const app = new Hono();

const subs:any[] = []

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
  const payload = JSON.stringify({ title: `Push Test ${Date.now()}` });
  
  const li = await kv.list({prefix: ["subscription"]})
  
  for await (const {key, value} of li) {
  
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

}, 10000);

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

  return c.body(Deno.readFileSync(`./public/${path}`));
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
  return c.body(Deno.readTextFileSync(`./${path}`));
});

app.get("/", (c) => c.html(Deno.readTextFileSync("./public/index.html")));

export default {
  fetch(request) {
    return app.fetch(request);
  },
};
