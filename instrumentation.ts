export async function register() {
  // Force IPv4-first DNS resolution to prevent ConnectTimeoutError
  // when connecting to api.themoviedb.org (common with certain ISPs)
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const dns = await import("node:dns")
    dns.setDefaultResultOrder("ipv4first")
  }
}
