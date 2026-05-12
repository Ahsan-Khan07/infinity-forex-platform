/**
 * AUTH CALLBACKS (SESSION ENFORCEMENT LAYER)
 * ------------------------------------------
 * Ensures session integrity using sessionVersion control
 */

export async function jwtCallback({ token, user }: any) {
  // On login
  if (user) {
    token.id = user.id;
    token.role = user.role;
    token.sessionVersion = user.sessionVersion;
  }

  return token;
}

export async function sessionCallback({ session, token }: any) {
  if (session.user) {
    session.user.id = token.id;
    session.user.role = token.role;
    session.user.sessionVersion = token.sessionVersion;
  }

  return session;
}
