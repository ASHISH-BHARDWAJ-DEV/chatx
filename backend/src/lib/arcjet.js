import arcjet, { shield, detectBot, tokenBucket, slidingWindow } from "@arcjet/node";
import "dotenv/config.js";

const aj = arcjet({
    key: process.env.ARCJET_KEY,
    rules: [
      shield({ mode: "LIVE" }),
      detectBot({
        mode: "LIVE",
        allow: [
          "CATEGORY:SEARCH_ENGINE", 
        ],
      }),
      // rate limiting rules
        slidingWindow({
            mode:"LIVE",
            max:100,
            interval:60,
    
        }),
    ],
  });

  export default aj;
