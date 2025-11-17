# Services quick examples

- Logger
```js
import { logger } from "./logger";
logger.info("App started", { build: process.env.NODE_ENV });
```

- API client
```js
import { apiClient } from "./apiClient";
const me = await apiClient.get("/api/me");
```

- WebSocket client
```js
import { wsClient } from "./wsClient";
wsClient.on("message", (evt) => console.log("WS message:", evt.data));
wsClient.send({ type: "ping" });
```

- Feature flags
```js
import { isFeatureEnabled, getAllFlags } from "./featureFlags";
if (isFeatureEnabled("analyticsV2")) { /* enable new charts */ }
console.log(getAllFlags());
```
