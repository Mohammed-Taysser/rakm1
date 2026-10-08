# Real-time & WebSockets (41 questions)

> Real-time communication is how a server pushes data to clients the instant something happens, instead of waiting for the client to ask. It underpins chat, notifications, live dashboards, collaborative editing, and tracking flows. You have shipped this several times: **Socket.IO** for Foody (broadcasting order updates to kitchen-display screens via rooms) and Trust-Node (live delivery tracking), **Microsoft SignalR** for Nova ERP (live ERP updates pushed to a React client), and **Redis pub/sub** in learn-background-task (decoupling producers from consumers and fanning out events across processes). This file is the interview-prep bank for the whole topic: the transport choices (polling / SSE / WebSockets), the WebSocket protocol itself, Socket.IO concepts and scaling, SignalR, React integration, and the operational concerns (auth, heartbeats, reconnection, presence, ordering, security).

## Quick Revision Checklist

- Plain HTTP is **request/response**: the client must initiate; the server cannot push. Real-time needs a way around that.
- Four techniques, increasing capability: **short polling -> long polling -> SSE -> WebSockets**. Pick the simplest that meets the need.
- **SSE = one-way (server->client), text only, auto-reconnect built in, runs over HTTP.** Great for notifications, feeds, dashboards.
- **WebSockets = full-duplex, persistent, binary or text, over a single TCP connection** after an HTTP Upgrade handshake.
- WebSocket URLs: `ws://` (plain) and `wss://` (TLS). Always use `wss://` in production.
- The handshake is an HTTP `GET` with `Upgrade: websocket` + `Connection: Upgrade`; server replies `101 Switching Protocols`.
- **Socket.IO is NOT raw WebSockets.** It adds auto-reconnection, transport fallback (long polling), rooms, namespaces, acks, and an event API. Client and server must both be Socket.IO.
- Socket.IO rooms: `socket.join('kitchen:42')` then `io.to('kitchen:42').emit(...)` — exactly the Foody kitchen-display pattern.
- **Broadcasting:** `io.emit` (everyone), `socket.broadcast.emit` (everyone except sender), `io.to(room).emit` (a room).
- **Acknowledgements:** pass a callback as the last `emit` arg to get a confirmed response back from the other side.
- **Scaling Socket.IO horizontally needs a backplane** (Redis adapter) so emits on one node reach clients connected to other nodes; sticky sessions are needed when HTTP long-polling fallback is allowed.
- **Auth:** send a token at connection time (`auth` payload) and verify it in `io.use()` middleware before the socket is allowed to do anything.
- **SignalR** (.NET) negotiates transport automatically: WebSockets -> SSE -> long polling. Concepts map to Socket.IO: Hubs ~ namespaces, Groups ~ rooms.
- **React integration:** connect/subscribe in `useEffect`, update state or React Query cache on events, and **always clean up** (`socket.off` / `socket.disconnect`) on unmount.
- Detect dead connections with **heartbeats (ping/pong)**; handle reconnection with backoff + missed-message replay (`Last-Event-ID` for SSE, server-side buffering for WS).
- **Don't reach for WebSockets by default** — if you only need server->client and infrequent updates, SSE or even polling is simpler and cheaper.

## Basic

### Q1: What is real-time communication and what are typical use cases?

**A:** Real-time communication means clients receive data with very low latency, pushed by the server as soon as an event occurs, rather than on a fixed schedule or only when the client requests it. Typical use cases: chat/messaging, push notifications, live dashboards and metrics, collaborative editing (Google-Docs style), live sports/finance tickers, delivery/ride tracking on a map, and kitchen-display systems that show new and updated orders instantly.

**Tip:** Tie it to your work: Foody pushes order state changes to kitchen screens, Trust-Node streams a courier's location to the customer, and Nova ERP pushes inventory/order updates to the React dashboard. Concrete examples make the answer memorable.

### Q2: Why isn't plain HTTP request/response enough for real-time?

**A:** Classic HTTP is half-duplex and **client-initiated**: the server can only respond to a request the client made. It has no way to spontaneously push "a new order arrived" to a browser. To simulate push you'd have to repeatedly poll, which wastes requests, adds latency (you only learn about an event on the next poll), and burns server resources on empty responses.

**Tip:** The one-line interview answer: "HTTP is pull-only; the server can't initiate. Real-time needs server-initiated push, which is why we use long polling, SSE, or WebSockets."

### Q3: Compare short polling, long polling, SSE, and WebSockets. (Classic interview question)

**A:**

- **Short polling:** client sends a request every N seconds; server responds immediately (even with "nothing new"). Simple, but high overhead and latency up to N seconds.
- **Long polling:** client sends a request; server **holds it open** until there's data (or a timeout), then responds; client immediately re-requests. Lower latency, fewer empty responses, but still one request per message and connection churn.
- **SSE (Server-Sent Events):** a single long-lived HTTP response streams events server->client. One-way, text only, auto-reconnect built in. Simple and efficient for server push.
- **WebSockets:** one persistent, full-duplex TCP connection; both sides send messages anytime; binary or text. Lowest latency, most flexible, but more infrastructure complexity.

**Tip:** The decision rule: server->client only and simple -> SSE; truly bidirectional / high-frequency / low-latency -> WebSockets; can't change infrastructure / legacy -> long polling; trivial occasional updates -> short polling.

### Q4: What is the WebSocket protocol?

**A:** WebSocket (RFC 6455) is a protocol providing **full-duplex, persistent** communication over a single TCP connection. It starts life as an HTTP request that is **upgraded** to the WebSocket protocol; after the handshake, HTTP is no longer used and both sides exchange lightweight **frames** in either direction with minimal overhead. URLs use the `ws://` (plaintext) or `wss://` (TLS) schemes.

**Tip:** Key words to say: full-duplex, persistent, single TCP connection, frame-based, low overhead per message.

### Q5: Walk through the WebSocket handshake.

**A:** The client sends an HTTP `GET` with headers `Upgrade: websocket`, `Connection: Upgrade`, a `Sec-WebSocket-Key` (random base64), and `Sec-WebSocket-Version: 13`. The server, if it accepts, responds with **`101 Switching Protocols`**, echoing back a `Sec-WebSocket-Accept` computed by hashing the client key with a fixed GUID. After the 101, the TCP connection is reused for WebSocket frames — no more HTTP.

**Tip:** The `101` status and the `Upgrade`/`Connection` header pair are what interviewers want to hear. The `Sec-WebSocket-Key`/`Accept` exchange just proves the server actually understands WebSockets (not a cache/proxy replaying).

### Q6: WebSocket vs HTTP — what's the difference?

**A:** HTTP is stateless request/response, half-duplex, one response per request, with per-request headers (overhead). WebSocket is a stateful, persistent, full-duplex channel where either side can send anytime with tiny frame overhead. HTTP is better for cacheable, RESTful resource access; WebSocket is better for continuous low-latency bidirectional messaging.

**Tip:** They're complementary, not competitors. Most apps use HTTP/REST for normal CRUD and add WebSockets only for the real-time slice.

### Q7: WebSocket vs SSE — when would you choose SSE?

**A:** SSE is **one-way** (server->client) over plain HTTP, text only, with **automatic reconnection** and event IDs built into the browser's `EventSource`. WebSockets are **bidirectional**, support binary, and need more setup. Choose SSE when the client only needs to _receive_ updates (notifications, news feeds, a read-only live dashboard) — it's simpler, works through most proxies, and reconnects for free.

**Tip:** "If the client never needs to send messages back over the same channel, SSE is usually the right, simpler choice." A common pattern is SSE for push + normal POST requests for the rare client->server action.

### Q8: What is Socket.IO and what does it add over raw WebSockets?

**A:** Socket.IO is a library (client + server) built **on top of** WebSockets (via the Engine.IO layer). It adds: **automatic reconnection** with backoff, **transport fallback** to HTTP long polling when WebSockets are blocked, **rooms** and **namespaces** for grouping, **acknowledgements** (request/response over the socket), easy **broadcasting**, and a clean **event-based API** (`emit`/`on`). It also multiplexes custom events over one connection.

**Tip:** Be explicit: "Socket.IO is not a WebSocket implementation you can talk to with the browser's native `WebSocket` — both ends must run Socket.IO because it has its own framing and handshake."

## Intermediate

### Q9: Show a Socket.IO server that broadcasts order updates to a kitchen room (Foody-style).

**A:**

```js
const { Server } = require("socket.io");
const io = new Server(httpServer, { cors: { origin: process.env.CLIENT_URL } });

io.on("connection", (socket) => {
  // A kitchen display joins the room for its restaurant
  socket.on("kitchen:join", ({ restaurantId }) => {
    socket.join(`kitchen:${restaurantId}`);
  });

  // When an order is placed/updated elsewhere, push to that kitchen's screens
  socket.on("order:update", (order, ack) => {
    io.to(`kitchen:${order.restaurantId}`).emit("order:updated", order);
    ack?.({ ok: true }); // acknowledgement back to the emitter
  });

  socket.on("disconnect", () => {
    // socket auto-leaves all its rooms
  });
});

// Elsewhere (e.g. after a DB write in an HTTP route) you can push too:
function notifyKitchen(order) {
  io.to(`kitchen:${order.restaurantId}`).emit("order:updated", order);
}
```

**Tip:** Rooms are server-side only — the client never names rooms directly; it asks to join and the server decides. That's a security point: validate that this user is allowed in `kitchen:42` before calling `socket.join`.

### Q10: Explain io.emit vs socket.emit vs socket.broadcast.emit vs io.to(room).emit.

**A:**

- `socket.emit(event, data)` — send only to **this one** connected client.
- `io.emit(event, data)` — broadcast to **all** connected clients (everyone).
- `socket.broadcast.emit(event, data)` — broadcast to **everyone except the sender**.
- `io.to('room').emit(event, data)` — broadcast to **all clients in that room** (you can chain `.to()` for multiple rooms, and use `socket.to(room)` to exclude the sender within a room).

**Tip:** Mnemonic: `socket.*` is "from the perspective of one connection," `io.*` is "from the server's perspective (all)." `broadcast` always means "exclude me."

### Q11: What are namespaces vs rooms in Socket.IO?

**A:** A **namespace** is a separate communication channel/endpoint (e.g. `/admin`, `/chat`) created with `io.of('/admin')`; clients connect to it explicitly, and it has its own connection event, middleware, and event handlers. A **room** is a subdivision _within_ a namespace that sockets can join/leave dynamically for targeted broadcasts. Rule of thumb: namespaces are static, defined by the app's structure (different features/permission tiers); rooms are dynamic, defined by runtime grouping (a chat channel, a kitchen, a delivery).

**Tip:** Foody's per-kitchen grouping = rooms (dynamic, one per restaurant). Separating, say, the courier app from the kitchen app could be namespaces.

### Q12: What are acknowledgements (callbacks) in Socket.IO?

**A:** Normally `emit` is fire-and-forget. If you pass a **callback as the last argument**, the receiver can invoke it (with data) to confirm receipt/processing — giving you a request/response round-trip over the socket. Modern Socket.IO also supports promise-style with `socket.timeout(ms).emitWithAck(event, data)`.

**Tip:**

```js
// sender
socket.emit("order:update", order, (res) => console.log("server said", res));
// receiver
socket.on("order:update", (order, ack) => {
  /* ... */ ack({ ok: true });
});
```

Always add a **timeout** to acks; without one a lost ack hangs forever.

### Q13: How do you handle authentication in WebSockets / Socket.IO?

**A:** Send a token (usually a JWT) when connecting, then verify it in connection middleware _before_ the socket can emit/join anything. With Socket.IO use `io.use()`:

```js
// client
const socket = io(URL, { auth: { token: localStorage.getItem("jwt") } });

// server
io.use((socket, next) => {
  try {
    const payload = jwt.verify(
      socket.handshake.auth.token,
      process.env.JWT_SECRET,
    );
    socket.user = payload; // attach identity for later handlers
    next();
  } catch {
    next(new Error("unauthorized")); // rejects the connection
  }
});
```

**Tip:** Browsers can't set custom headers on the native WebSocket handshake, so don't rely on `Authorization` headers — Socket.IO's `auth` payload (or a query param/cookie) is the practical channel. Also re-check authorization on sensitive events, since a token can expire mid-connection.

### Q14: How do you integrate Socket.IO with React?

**A:** Establish the connection once, subscribe in `useEffect`, update state (or the React Query cache) on events, and **clean up on unmount**:

```jsx
useEffect(() => {
  const socket = io(URL, { auth: { token } });
  socket.emit("kitchen:join", { restaurantId });

  const onUpdate = (order) => {
    setOrders((prev) => upsert(prev, order));
    // or with React Query: queryClient.setQueryData(['orders', restaurantId], ...)
  };
  socket.on("order:updated", onUpdate);

  return () => {
    socket.off("order:updated", onUpdate); // remove listener
    socket.disconnect(); // close connection
  };
}, [restaurantId, token]);
```

**Tip:** This is exactly the pattern you used in Foody and the Nova ERP React client. The cleanup is the part interviewers probe — without `socket.off`/`disconnect` you get duplicate listeners and leaked connections on re-render/unmount. For a single app-wide connection, create it once (a context/provider) instead of per component.

### Q15: Show an SSE endpoint and an EventSource client.

**A:**

```js
// Express SSE endpoint (server -> client only)
app.get("/notifications", (req, res) => {
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  res.flushHeaders();

  const send = (data) =>
    res.write(
      `id: ${data.id}\nevent: notify\ndata: ${JSON.stringify(data)}\n\n`,
    );

  const sub = bus.on("notify", send);
  req.on("close", () => bus.off("notify", sub)); // cleanup on disconnect
});
```

```js
// Browser client
const es = new EventSource("/notifications", { withCredentials: true });
es.addEventListener("notify", (e) => render(JSON.parse(e.data)));
es.onerror = () => {
  /* EventSource auto-reconnects; just log */
};
```

**Tip:** The wire format matters: each event is `field: value` lines ending with a **blank line** (`\n\n`). Setting `id:` lets the browser send `Last-Event-ID` on reconnect so you can replay missed events.

### Q16: What is the native WebSocket API on the client?

**A:** The browser exposes a global `WebSocket`:

```js
const ws = new WebSocket("wss://api.example.com/socket");
ws.onopen = () => ws.send(JSON.stringify({ type: "hello" }));
ws.onmessage = (e) => console.log(JSON.parse(e.data));
ws.onclose = () => {
  /* you must implement reconnection yourself */
};
ws.onerror = (e) => console.error(e);
```

On the server (Node) the `ws` library is the common choice. Note: the native API gives you **no** auto-reconnect, rooms, or fallback — you build those yourself, which is the gap Socket.IO fills.

**Tip:** Mention `ws` (server) and the native `WebSocket` (client) to show you know raw WebSockets, then contrast with Socket.IO.

### Q17: What is the C10k problem, and how does it relate to WebSockets?

**A:** C10k is the classic challenge of handling 10,000+ concurrent connections on one server. WebSockets make it acute because each client holds a **persistent** connection (and file descriptor/memory) for its whole session, unlike short HTTP requests. Solutions: event-driven non-blocking I/O (Node's event loop, epoll/kqueue), tuning OS limits (`ulimit -n`, ephemeral ports), and **horizontal scaling** across many nodes with a backplane.

**Tip:** Node is well-suited here because its single-threaded event loop handles thousands of idle persistent connections cheaply — the cost is per-message work, not per-connection threads.

## Advanced

### Q18: How do you scale Socket.IO horizontally across multiple Node instances?

**A:** With multiple instances behind a load balancer, a client connected to **Node A** won't receive an `io.to(room).emit(...)` issued on **Node B**, because each instance only knows its own sockets. The fix is a **backplane/adapter** — most commonly the **Redis adapter** — that uses Redis pub/sub so that an emit on any node is published and every node delivers it to its locally connected clients in that room.

```js
const { createAdapter } = require("@socket.io/redis-adapter");
const { createClient } = require("redis");
const pub = createClient({ url: process.env.REDIS_URL });
const sub = pub.duplicate();
await Promise.all([pub.connect(), sub.connect()]);
io.adapter(createAdapter(pub, sub));
```

**Tip:** Two separate concerns:

1. the **adapter** solves cross-node _broadcasting_
2. **sticky sessions** solve the _connection_ problem when HTTP long-polling fallback is enabled (the multiple handshake requests must hit the same node)

If you force `transports: ['websocket']` you can avoid sticky sessions, but the adapter is still required for cross-node emits.

### Q19: Why are sticky sessions needed, and when can you skip them?

**A:** Socket.IO's default transport upgrade does HTTP **long polling first**, then upgrades to WebSocket. Long polling involves multiple separate HTTP requests that must all reach the **same** server instance to maintain session state; a round-robin LB would scatter them and break the handshake. Sticky sessions (by cookie or IP hash) pin a client to one node. You can skip stickiness only if you disable polling and use WebSocket-only transport — but you still need the Redis adapter for broadcasting.

**Tip:** "Sticky sessions are about the _connection handshake_; the Redis adapter is about _message fan-out_. People conflate them — they solve different problems."

### Q20: Explain the Redis pub/sub pattern as a real-time backbone.

**A:** Redis pub/sub lets producers `PUBLISH` messages to named **channels** and any number of subscribers `SUBSCRIBE` to receive them — fully decoupled, fire-and-forget. It's the mechanism behind the Socket.IO Redis adapter and a general way to fan an event out to many processes/services. You used it in **learn-background-task** to decouple a producer from background workers so events propagate across processes without direct coupling.

**Tip:** Caveat to mention: **plain Redis pub/sub has no persistence or delivery guarantee** — if a subscriber is down, it misses the message. For durability/replay you'd use **Redis Streams** (or Kafka) instead, which keep a log and support consumer groups.

### Q21: What is SignalR and how does it compare to Socket.IO?

**A:** SignalR is Microsoft's real-time library for .NET. It **negotiates the best transport automatically**: WebSockets first, falling back to **SSE**, then **long polling**. Its core abstraction is the **Hub** — a server class whose methods clients can call and which can call methods back on clients (RPC-style). It supports **Groups** (like rooms) and a JS/TS client usable from React. You used it in **Nova ERP** to push live ERP updates to a React front end.

**Tip:** Map the vocabulary for the interviewer: SignalR **Hub** ~ Socket.IO **namespace**, SignalR **Group** ~ Socket.IO **room**, both do transport fallback and auto-reconnection. The big difference is ecosystem (.NET vs Node).

### Q22: How do you consume SignalR from a React client?

**A:** Use `@microsoft/signalr`: build a `HubConnection`, register handlers with `connection.on(...)`, start it, and invoke server methods with `connection.invoke(...)`. Wire it into `useEffect` with cleanup, like any real-time client:

```js
import * as signalR from "@microsoft/signalr";

useEffect(() => {
  const conn = new signalR.HubConnectionBuilder()
    .withUrl("/erpHub", { accessTokenFactory: () => token })
    .withAutomaticReconnect()
    .build();

  conn.on("InventoryUpdated", (item) => updateCache(item));
  conn.start();

  return () => {
    conn.stop();
  };
}, [token]);
```

**Tip:** `accessTokenFactory` is SignalR's auth hook (sends the JWT). `withAutomaticReconnect()` enables built-in reconnection with backoff — mention that you relied on it in Nova ERP.

### Q23: How do heartbeats / ping-pong detect dead connections?

**A:** A TCP connection can silently die (network drop, sleeping laptop, NAT timeout) without a clean close, so the server keeps thinking the client is there. Heartbeats fix this: one side periodically sends a **ping** and expects a **pong** within a timeout; if it's missed, the connection is considered dead and closed. The WebSocket protocol has native ping/pong frames; Socket.IO/Engine.IO implements its own heartbeat with configurable `pingInterval` and `pingTimeout`.

**Tip:** If asked "how does the server know a client vanished?" — heartbeats. Tuning the timeout trades off faster dead-connection detection vs false positives on slow networks.

### Q24: What are good reconnection strategies and how do you handle missed messages?

**A:** Reconnect with **exponential backoff + jitter** (don't hammer a recovering server). For missed messages while disconnected:

- **SSE:** the browser automatically sends `Last-Event-ID`; the server replays events after that id.
- **WebSockets/Socket.IO:** track a cursor/sequence number; on reconnect the client tells the server its last seen id and the server **replays** buffered events. Socket.IO offers **Connection State Recovery** that restores rooms and replays missed events for a short window.

**Tip:** "At-least-once with idempotent handlers" is the pragmatic stance: replay may resend, so make event handlers idempotent (e.g. upsert by id) so duplicates are harmless.

### Q25: What is backpressure in a real-time system and how do you handle it?

**A:** Backpressure occurs when you produce messages faster than a slow client (or the network) can consume them; the per-connection send buffer grows and can exhaust memory. Handle it by: monitoring the socket's buffered amount (`ws.bufferedAmount`), dropping/coalescing stale updates (e.g. only keep the latest location for a courier), batching, throttling/sampling high-frequency streams, and disconnecting hopelessly-behind clients.

**Tip:** For a live tracking map (Trust-Node), you don't need every GPS point — **coalesce to the latest position** and send at a fixed rate. That naturally bounds backpressure.

### Q26: How do you implement presence (who's online)?

**A:** Track active connections and map them to users. On connect, mark the user online (e.g. a Redis set/hash keyed by userId, with the socket id); on disconnect, remove it; broadcast presence changes to interested clients. With multiple nodes, store presence in **Redis** so all nodes share one view. Use heartbeats + TTLs so a crashed node's users eventually expire.

**Tip:** Edge case to raise: a user can have **multiple connections** (tabs/devices), so use a reference count or a set of socket ids per user — only mark them offline when the last one disconnects.

### Q27: What about message ordering and delivery guarantees?

**A:** Over a single WebSocket/TCP connection, messages from one sender are delivered **in order**. But ordering is **not** guaranteed across reconnects, across multiple connections, or across a pub/sub fan-out from multiple producers. Delivery is **at-most-once** by default (lost on disconnect) unless you add acks + replay for at-least-once. Exactly-once is hard — usually approximated with at-least-once + idempotency/dedup by message id.

**Tip:** If strict ordering matters, attach a monotonic sequence number per stream and let the client reorder/detect gaps. Be honest in interviews: "true exactly-once is generally not provided; I design for at-least-once with idempotent consumers."

### Q28: What are the main security concerns with WebSockets?

**A:**

- **Use `wss://`** (TLS) so frames are encrypted; never `ws://` in production.
- **Authenticate** on connect (token in `auth`/cookie) and verify in middleware; re-authorize sensitive actions.
- **Check the `Origin` header** server-side to mitigate Cross-Site WebSocket Hijacking (the SOP/CORS rules don't apply to WS the same way).
- **Validate every payload** (size limits, schema) — never trust client input; the persistent channel is an open door.
- **Rate-limit messages** per connection to prevent flooding/DoS.
- **Authorize room joins** so a client can't subscribe to data it shouldn't see.

**Tip:** The two interviewers love: **Origin checking** (CSWSH) and **per-message validation/rate limiting** — both are easy to forget because the connection is already "open."

### Q29: What is WebRTC and how does it differ from WebSockets?

**A:** WebRTC is a browser standard for **peer-to-peer** real-time media (audio/video) and data, going _directly_ between clients (after a signaling step) rather than through your server. It uses UDP-based protocols (SRTP/SCTP over ICE/STUN/TURN) for low-latency media. WebSockets, by contrast, are client<->server over TCP. They're complementary: WebRTC typically still uses a WebSocket (or similar) channel for **signaling** to exchange connection info before the P2P link forms.

**Tip:** One-liner: "WebSockets = client-server messaging; WebRTC = peer-to-peer media/data. Use WebRTC for video/voice calls, WebSockets for chat/data and for WebRTC's signaling."

### Q30: When should you NOT use WebSockets?

**A:** Avoid them when a simpler tool suffices:

- **Only need server->client** updates -> SSE (simpler, auto-reconnect, proxy-friendly).
- **Infrequent or non-time-critical** updates -> short/long polling.
- **One-off request/response** -> just use HTTP/REST.
- Environments where persistent connections are awkward (some serverless/edge platforms, strict corporate proxies) -> SSE or polling fall back more gracefully.
  WebSockets add operational cost (sticky sessions, backplane, connection management, scaling) that isn't worth it unless you genuinely need bidirectional, low-latency, high-frequency communication.

**Tip:** Strong senior signal: "I default to the simplest transport that meets the latency and directionality requirement, and only adopt WebSockets when the use case is truly bidirectional and real-time."

### Q31: How does Socket.IO's transport fallback actually work?

**A:** Engine.IO (Socket.IO's transport layer) opens with **HTTP long polling** first because it works almost everywhere, then attempts to **upgrade** to a WebSocket. If the upgrade succeeds, it switches; if WebSockets are blocked (some proxies/firewalls), it stays on long polling. This guarantees a working connection at the cost of the polling phase needing sticky sessions.

**Tip:** You can configure `transports: ['websocket']` to skip polling entirely (faster connect, no stickiness) at the risk of failing where WS is blocked. Trade-off worth naming.

### Q32: How do you keep React Query cache in sync with real-time events?

**A:** Subscribe in an effect and on each event update the relevant query cache directly with `queryClient.setQueryData`, or invalidate the query to refetch:

```js
socket.on("order:updated", (order) => {
  queryClient.setQueryData(["orders", restaurantId], (old = []) =>
    upsertById(old, order),
  );
});
```

`setQueryData` is instant (optimistic, no network); `invalidateQueries` is simpler but triggers a refetch. Choose `setQueryData` for high-frequency events to avoid refetch storms.

**Tip:** This is the pattern you used to feed live ERP/order updates into React without losing React Query's caching/dedup benefits. Mention idempotent upsert-by-id so replays/duplicates don't corrupt the cache.

### Q33: What is the difference between Redis pub/sub and Redis Streams for real-time?

**A:** **Pub/sub** is ephemeral fire-and-forget — subscribers only get messages published _while connected_, nothing is stored, no replay, no consumer groups. **Streams** are an append-only log: messages persist, consumers can read history, acknowledge processing, and use **consumer groups** for load-balanced, at-least-once delivery. Pub/sub fits transient fan-out (the Socket.IO adapter); Streams fit durable event processing/replay.

**Tip:** If an interviewer pushes on "what if a worker was down when the event fired?" with pub/sub the answer is "it's lost — that's when I'd switch to Streams or Kafka."

### Q34: How do namespaces/rooms help with authorization and multi-tenancy?

**A:** Rooms let you scope broadcasts to exactly the audience allowed to see them — e.g. one room per restaurant kitchen, per delivery, or per tenant. By validating membership in middleware/handlers before `socket.join`, you ensure a client can only receive data for resources it's authorized for. Namespaces can separate whole feature areas or permission tiers with their own middleware.

**Tip:** "Rooms aren't just for convenience — they're an authorization boundary. I gate `join` on a permission check so a kitchen screen can only ever receive its own restaurant's orders."

### Q35: How do you test or debug real-time features?

**A:** Use a CLI/script client (e.g. `wscat` for raw WS, a small Socket.IO/SignalR test client) to emit and observe events; inspect the handshake and frames in the browser DevTools **Network -> WS** tab; add structured logging on connect/disconnect/error with connection ids; and write integration tests that spin up the server and connect real clients to assert event delivery. For scaling bugs, test with multiple instances + the Redis adapter locally.

**Tip:** DevTools' WS frame inspector is the fastest way to see exactly what's on the wire — mention it; it shows you're hands-on.

### Q36: What happens to in-flight state when a Socket.IO server restarts/deploys?

**A:** All connections drop; clients auto-reconnect (Socket.IO does this with backoff). Because connection state lives in memory, rooms and any per-socket data are lost on that node — clients must re-join rooms on reconnect (re-emit `kitchen:join`). With a Redis adapter the _broadcasting_ survives, but per-socket state still needs re-establishing. **Connection State Recovery** can restore rooms and replay a short window of missed events.

**Tip:** Practical rule: make reconnection idempotent — on every `connect`, re-send the subscriptions/joins. Don't assume state survived a reconnect.

### Q37: How do you rate-limit and validate messages on a socket?

**A:** Apply a per-connection token-bucket/counter (in memory or Redis) and reject or disconnect clients exceeding the rate; validate each incoming event's payload against a schema (size caps, types, allowed fields) before acting on it. Wrap handlers so a thrown validation error doesn't crash the process.

```js
socket.on("order:update", (order, ack) => {
  if (!isValidOrder(order)) return ack?.({ ok: false, error: "invalid" });
  if (!withinRateLimit(socket))
    return ack?.({ ok: false, error: "rate_limited" });
  // ... handle
});
```

**Tip:** A persistent connection means one malicious client can spam thousands of events cheaply — rate limiting per socket is the defense, not just per HTTP request.

### Q38: Long polling vs WebSockets — give a crisp summary an interviewer wants.

**A:** Long polling reuses standard HTTP: the client requests, the server holds the response until data is ready, then the client immediately re-requests. It's compatible with all HTTP infrastructure but pays connection-setup overhead per message and remains essentially **half-duplex** (server can only push by holding a request). WebSockets keep one persistent **full-duplex** channel so both sides push freely with minimal overhead. Long polling is the universal fallback; WebSockets are the efficient native solution.

**Tip:** "Long polling simulates push by holding the request open; WebSockets provide real push over a persistent connection."

### Q39: How do you handle CORS and cross-origin issues with Socket.IO?

**A:** Socket.IO's HTTP handshake is subject to CORS, so configure the server's `cors` option with the allowed `origin` (and `credentials: true` if using cookies). For pure WebSocket frames, browsers don't enforce CORS, so you must **check the `Origin` header yourself** server-side to prevent cross-site hijacking.

**Tip:** Two layers: `cors` config covers the handshake/polling; manual `Origin` validation covers the WS layer. Don't assume one covers the other.

### Q40: What's the role of the Engine.IO layer under Socket.IO?

**A:** Engine.IO is the lower-level transport abstraction Socket.IO sits on. It manages the actual connection: opening via long polling, **upgrading** to WebSocket, heartbeats/ping-pong, and reconnection at the transport level. Socket.IO adds the higher-level features (events, rooms, namespaces, acks, broadcasting) on top.

**Tip:** Knowing the Engine.IO/Socket.IO split signals depth — it explains _why_ there's a polling phase and _where_ heartbeats live.

### Q41: How would you architect live delivery tracking (Trust-Node)?

**A:** Couriers' apps emit periodic location updates to the server (WebSocket or even HTTP since it's low-frequency from each courier); the server places each delivery in a **room** keyed by delivery/order id; the customer's client joins that room and receives `location:updated` events. To bound load: **coalesce** to the latest position per courier and throttle the broadcast rate. Persist last-known location (Redis) so a reconnecting customer immediately sees current state. Scale with the Redis adapter so any node can broadcast to the delivery's room.

**Tip:** Key design points to volunteer: per-delivery room (authorization + targeting), coalescing/throttling (backpressure), last-known state in Redis (instant resume), Redis adapter (multi-node). That covers targeting, performance, and scaling in one answer.

## Common Mistakes / Red Flags

- **Thinking Socket.IO is plain WebSockets.** You can't connect to a Socket.IO server with the browser's native `WebSocket`, or vice versa — both ends need the same library because of custom framing/handshake.
- **No cleanup in React effects.** Forgetting `socket.off`/`socket.disconnect` (or `conn.stop()` for SignalR) on unmount causes duplicate listeners, memory leaks, and stacked connections after re-renders.
- **Scaling to multiple nodes without a backplane.** Without the Redis adapter, broadcasts only reach clients on the same instance — "it works locally, breaks in production behind the LB."
- **Confusing sticky sessions with the Redis adapter.** Sticky sessions fix the _handshake_ (polling); the adapter fixes _cross-node broadcasting_. You often need both.
- **Using `ws://` in production / skipping TLS.** Frames travel unencrypted; also breaks on HTTPS pages (mixed content).
- **No auth or weak auth on the socket.** Relying on `Authorization` headers (browsers can't set them on native WS) or not validating the token in middleware before allowing joins/emits.
- **No `Origin` check.** Leaves you open to Cross-Site WebSocket Hijacking because WS isn't bound by the same CORS rules.
- **Trusting client payloads / no rate limiting.** A persistent connection lets one client flood or inject bad data cheaply — validate and rate-limit per socket.
- **Assuming delivery/ordering guarantees that don't exist.** Default is at-most-once and order isn't guaranteed across reconnects/fan-out; design idempotent handlers + replay if you need more.
- **Ignoring missed messages on reconnect.** Not replaying via `Last-Event-ID` (SSE) or a sequence cursor (WS) silently loses updates during a disconnect.
- **No heartbeat / dead-connection handling.** Half-open connections accumulate, presence shows ghosts, and memory leaks.
- **Reaching for WebSockets when SSE or polling would do.** Over-engineering a read-only notification feed into a full bidirectional WS stack.
- **Assuming Redis pub/sub is durable.** It's fire-and-forget; subscribers that are down miss messages — use Streams/Kafka if you need persistence/replay.
- **Not re-joining rooms after reconnect.** Per-socket room membership is in-memory and lost on server restart/reconnect; clients must re-subscribe.

## Further Reading

- WebSocket protocol overview (MDN): https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API
- Server-Sent Events & EventSource (MDN): https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events
- Socket.IO documentation (rooms, adapters, scaling, auth): https://socket.io/docs/v4/
- ASP.NET Core SignalR documentation: https://learn.microsoft.com/en-us/aspnet/core/signalr/introduction
