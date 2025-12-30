import aj from "../lib/arcjet.js";
import { isSpoofedBot } from "@arcjet/inspect";

export const arcjetProtection = async (req, res, next) => {
  try {
    //for development purpose only
    const userAgent = req.headers["user-agent"] || "";
    const isDevRequest = userAgent.includes("PostmanRuntime") || 
                         userAgent.includes("curl") || 
                         userAgent.includes("Mozilla") ||
                         userAgent.includes("Chrome") ||
                         userAgent.includes("Safari") ||
                         process.env.NODE_ENV === "development";
    
    if (isDevRequest) {
      return next();
    }
    

    const decision = await aj.protect(req);
    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return res.status(429).json({
          message: "Rate limit exceeded. Please try again later.",
        });
      } else if (decision.reason.isBot()) {
        return res.status(403).json({
          message: "Bot access denied.",
        });
      } else {
        return res.status(403).json({
          message: "Access denied by security policy.",
        });
      }
    }
    if (decision.results?.some(isSpoofedBot)) {
      return res.status(403).json({
        error: "Spoofed bot detected",
        message: "Malicious bot activity detected.",
      });
    }
    next();
  } catch (error) {
    console.log("Arcjet Protection Error:", error);
    next();
  }
};
