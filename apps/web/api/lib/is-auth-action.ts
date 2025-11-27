const authActions = [
    "providers",
    "session",
    "csrf",
    "signin",
    "signout",
    "callback",
    "verify-request",
    "error",
    "webauthn-options",
]

export function isAuthAction(
    pathname: string,
): boolean {
    const base = '/api/auth'
    
    // Check if the path starts with /api/auth
    if (!pathname.startsWith(base)) {
        return false
    }
    
    // Allow all /api/auth/* routes to be handled by authHandler
    // This is more permissive and lets Auth.js handle the routing
    return true
}