/**
 * Extract client IP address from request
 * Handles proxies and load balancers by checking X-Forwarded-For header
 * @param {Request} req - Express request object
 * @returns {string} Client IP address
 */
export const getClientIp = (req) => {
  // Check X-Forwarded-For header (proxy/load balancer)
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    // X-Forwarded-For can contain multiple IPs, get the first one
    return forwarded.split(",")[0].trim();
  }

  // Check X-Real-IP header (alternative proxy header)
  const realIp = req.headers["x-real-ip"];
  if (realIp) {
    return realIp;
  }

  // Fallback to direct connection IP
  return req.ip || req.connection.remoteAddress || "unknown";
};

/**
 * Extract User-Agent from request headers
 * @param {Request} req - Express request object
 * @returns {string} User-Agent string or 'unknown'
 */
export const getUserAgent = (req) => {
  return req.headers["user-agent"] || "unknown";
};
