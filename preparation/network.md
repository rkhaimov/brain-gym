# Synthesis

HTTP is just an application level transport protocol that is supposed to send text over the network. It uses TCP to
establish connection. Also TLS can be used to secure this connection from MITM.

HTTP 2.0 supports multiplexing, WS is built on top of TCP.

There is also an UDP option, it is faster but more loose

# Raw

Purpose	        Typical Protocol
Page/API	    HTTP/2 or HTTP/3
Realtime	    WebSocket
Streaming	    SSE or streaming HTTP
Video calls	    WebRTC

At high level, loading a webpage is roughly:

1. Resolve domain → IP (`DNS`)
2. Establish connection (`TCP`)
3. Secure connection (`TLS`)
4. Exchange application data (`HTTP`)
5. Browser renders response

Let’s walk through the real mechanics.

---

# 1. URL parsing

You type:

```txt
https://example.com/products?id=10
```

Browser extracts:

* Protocol: `https`
* Host: `example.com`
* Port: `443` (default for HTTPS)
* Path/query:

  ```txt
  /products?id=10
  ```

Before HTTP even starts, browser must know:

* Which IP to connect to
* How to securely talk to it

---

# 2. DNS lookup

Human-readable domains must be translated into IP addresses.

```txt
example.com -> 93.184.216.34
```

# 3. TCP connection

Now browser knows IP.

It must establish reliable byte stream.

TCP is connection-oriented.

---

# TCP 3-way handshake

Client wants to connect to:

```txt
93.184.216.34:443
```

Sequence:

## Step 1 — SYN

Client sends:

```txt
SYN, seq=x
```

Meaning:

> “I want to open connection.
> My initial sequence number is x.”

---

## Step 2 — SYN-ACK

Server replies:

```txt
SYN-ACK, seq=y, ack=x+1
```

Meaning:

> “I acknowledge your sequence.
> My own sequence starts at y.”

---

## Step 3 — ACK

Client sends:

```txt
ACK, ack=y+1
```

Connection established.

---

# Why sequence numbers exist

TCP transfers ordered reliable stream.

Packets may:

* arrive out of order
* be duplicated
* be lost

Sequence numbers allow:

* ordering
* retransmission
* deduplication

---

# Important: TCP is stream-oriented

Application sees:

```txt
continuous bytes
```

NOT packets.

Example:

```txt
"hello world"
```

may arrive as:

```txt
hel
lo wor
ld
```

TCP reconstructs original stream.

---

# 4. TLS handshake (HTTPS)

Now comes the important security layer.

Without TLS:

```txt
HTTP = plaintext
```

Anyone on network can:

* read traffic
* modify traffic
* inject responses

TLS solves:

* encryption
* integrity
* authentication

---

# Core TLS problem

Client and server need shared secret key.

But attacker may intercept network.

Question:

> How can they agree on key securely over insecure network?

This is the heart of TLS.

---

# Simplified TLS flow

Modern TLS usually uses:

* asymmetric crypto (RSA/ECDSA)
* Diffie-Hellman key exchange (ECDHE)
* symmetric encryption (AES/ChaCha20)

---

# Important distinction

Asymmetric crypto is slow.

Symmetric crypto is fast.

Therefore TLS does:

```txt
asymmetric crypto -> establish shared secret
symmetric crypto -> encrypt actual traffic
```

---

# TLS 1.3 simplified handshake

## Step 1 — ClientHello

Client sends:

* supported TLS versions
* supported cipher suites
* random bytes
* ephemeral public key (ECDHE)

Example:

```txt
ClientHello:
- TLS 1.3
- AES256-GCM
- public key A
```

---

## Step 2 — ServerHello

Server responds:

* chosen cipher suite
* random bytes
* its ephemeral public key B
* certificate

---

# What is certificate?

Certificate says:

> “This public key belongs to example.com”

It contains:

* domain name
* server public key
* CA signature

Signed by trusted Certificate Authority.

Example CAs:

* Let’s Encrypt
* DigiCert

---

# How browser trusts certificate

Browser/OS ships with trusted CA root certificates.

Browser verifies:

```txt
CA signature valid?
Certificate expired?
Domain matches?
```

If valid:

```txt
browser trusts server public key
```

---

# MITM protection

Suppose attacker intercepts traffic.

Attacker tries:

```txt
Client <-> Attacker <-> Server
```

Attacker could generate own keypair.

But attacker CANNOT forge certificate signed by trusted CA.

Browser would show:

```txt
"Your connection is not private"
```

because certificate signature invalid.

This is the main MITM protection.

---

# But how shared secret is established?

Using Diffie-Hellman (ECDHE).

This is the beautiful part.

---

# Diffie-Hellman intuition

Both parties derive same secret independently.

Without transmitting secret itself.

---

# Simplified math intuition

Public values:

```txt
g, p
```

Client chooses secret:

```txt
a
```

Server chooses secret:

```txt
b
```

Client sends:

```txt
g^a mod p
```

Server sends:

```txt
g^b mod p
```

Now:

Client computes:

```txt
(g^b)^a = g^(ab)
```

Server computes:

```txt
(g^a)^b = g^(ab)
```

Same result.

Attacker sees only:

```txt
g^a
g^b
```

but cannot derive:

```txt
g^(ab)
```

because discrete logarithm problem is hard.

---

# Why MITM still matters here

Pure Diffie-Hellman alone is vulnerable.

Attacker could:

* establish separate keys with client/server
* relay traffic

TLS prevents this by authenticating server via certificate.

So:

```txt
ECDHE + certificates
```

gives:

* secure key exchange
* authenticated server
* MITM resistance

---

# Ephemeral keys and Forward Secrecy

Modern TLS uses ephemeral keys:

```txt
ECDHE = Elliptic Curve Diffie-Hellman Ephemeral
```

New temporary keys generated per session.

Benefits:

If server private key leaks later:

```txt
old traffic still cannot be decrypted
```

because session keys were temporary.

This is Forward Secrecy.

---

# After handshake

Both sides now share symmetric session key.

Traffic encrypted with fast symmetric crypto:

Examples:

* AES-GCM
* ChaCha20-Poly1305

Now HTTP can start securely.

---

# 5. HTTP request

Browser sends:

```http
GET /products?id=10 HTTP/1.1
Host: example.com
Cookie: session=abc
User-Agent: Chrome
```

Important:

HTTP itself is just text protocol.

TLS encrypts it underneath.

---

# 6. Server processing

Server:

* parses request
* routes it
* executes application logic
* queries DB/services
* generates response

---

# 7. HTTP response

Example:

```http
HTTP/1.1 200 OK
Content-Type: text/html

<html>...</html>
```

Browser parses response.

---

# Connection reuse

Opening TCP+TLS is expensive.

Browsers reuse connections:

## HTTP/1.1

Keep-alive.

---

## HTTP/2

Single TCP connection multiplexes many requests simultaneously.

---

## HTTP/3

Uses QUIC over UDP instead of TCP.

Benefits:

* faster handshakes
* avoids TCP head-of-line blocking
* integrated TLS

---

# Important lower-level detail

HTTP does NOT “send packets”.

Hierarchy:

```txt
HTTP
  over TLS
    over TCP
      over IP
        over Ethernet/WiFi
```

Each layer wraps previous layer.

Like envelopes inside envelopes.

---

# Packet flow example

```txt
HTTP request
  ↓
TLS encrypts bytes
  ↓
TCP splits stream into segments
  ↓
IP adds routing info
  ↓
Ethernet/WiFi transmits frames
```

On server:

reverse happens.

---

# Why TCP is reliable

TCP handles:

* retransmission
* congestion control
* flow control
* ordering

Applications don’t need to care.

---

# Congestion control

Internet would collapse without it.

TCP detects congestion via:

* packet loss
* RTT increases

Then reduces sending rate.

Algorithms:

* Reno
* Cubic
* BBR

---

# Why TLS cannot stop ALL MITM

TLS assumes:

```txt
trusted certificate authorities
```

If CA compromised or malicious:

fake certificates possible.

Also corporate proxies may install custom root CA into OS/browser.

Then browser will trust proxy-generated certificates.

That’s how HTTPS inspection works in enterprises.

---

# Modern HTTPS performance optimizations

## TLS session resumption

Reuse prior session secrets.

Avoid full handshake.

---

## 0-RTT

TLS 1.3 can send data immediately using prior session.

Tradeoff:

possible replay attacks.

---

# What actually proves server identity?

Not encryption.

Not Diffie-Hellman.

The critical trust anchor is:

```txt
certificate chain validation
```

That’s the real anti-MITM mechanism.

Diffie-Hellman only establishes shared secret.

Certificates authenticate WHO owns the key.

---

# Full simplified timeline

```txt
Browser:
  Parse URL

DNS:
  example.com -> IP

TCP:
  SYN
  SYN-ACK
  ACK

TLS:
  ClientHello
  ServerHello + certificate
  Key exchange
  Shared symmetric key established

HTTP:
  GET /index.html

Server:
  Process request

HTTP:
  200 OK + HTML

Browser:
  Render page
```

---

# Important mental model

Think of HTTPS as:

```txt
HTTP
inside
encrypted authenticated tunnel
inside
reliable TCP stream
inside
IP network packets
```

Each layer solves different problem:

| Layer | Responsibility             |
| ----- | -------------------------- |
| DNS   | Name → IP                  |
| IP    | Routing                    |
| TCP   | Reliable ordered transport |
| TLS   | Encryption/authentication  |
| HTTP  | Application protocol       |

HTTP 2.0 supports multiplexing (sending several requests over one tcp connect)
