# Synthesis

FE apps are owned by user, and everything there also, so general strategies are:
* Do not store any sensitive information
* Do not retrieve and execute untrusted data
* Do not trust user input (or any other external data)
* Sandbox execution to reduce blast radius
* Restrict app capabilities, leave only essential ones

# Raw

Frontend security mostly follows:

```text
Never trust the client.
Reduce what injected JS can do.
Reduce what compromised dependencies can access.
Reduce impact radius.
```

For real-world frontend apps, the biggest wins are usually:

CSP
Avoiding token theft
XSS prevention
Dependency hygiene
Limiting third-party JS
Proper isolation boundaries
Backend validation of everything

HTTPS everywhere

```text
MITM
session hijacking
tampering
```

Secure cookies

```text
HttpOnly
Secure
SameSite=Lax/Strict
```

CSP (Content Security Policy)

```text
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  
Only load resources from the same origin.
Only execute scripts from the same origin.
```

CSP is basically:

```text
a browser-side allowlist
for executable/renderable resources

Nothing executes unless explicitly trusted.
```

Avoid inline JS

```text
<button onclick="hack()">
```

Helps CSP become effective.

Never trust user content.

```text
element.textContent = userInput;
```

or sanitaze

Backend-owned session

Browser holds:

```text
HttpOnly session cookie
```

Frontend state should be treated as:

```text
observable by attacker if XSS happens
```

Short-lived access tokens

```text
short-lived access token
refresh token rotation
```

Avoid:

```text
long-lived browser tokens
```

PKCE - Proof Key for Code Exchange

```text
1. User logs into Google
2. Google redirects back:
   /callback?code=ABC
3. App exchanges code for token
```

OAuth (more precisely OAuth OAuth 2.0) is an authorization protocol that allows one application to access resources on
behalf of a user without giving away the user’s password.

OAuth:
Can app access API?

OIDC:
Who logged in?

CSRF — Cross-Site Request Forgery

CSRF is an attack where:

```text
attacker tricks victim's browser
into sending authenticated requests
to another website
without victim intending it
```

to protect use CSRF tokens generated in html and CORS

Treat all input as hostile

Includes:

```text
URL params
query strings
markdown
backend data
CMS content
translations
localStorage
postMessage
```

Sandbox iframe

Run untrusted content isolated.

```text
plugins
third-party widgets
ads
user-generated apps
```

CORS controls:

```text
whether JS may READ responses
```

Cross-Origin Isolation controls:

```text
whether your page/process may become highly isolated
and use powerful APIs safely
```

SRI hashes integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/ux..."
