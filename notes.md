- Clienttan servera user creedntialslarla beraber istek atılır.

## Server-side Sessions

Store unique identifier on server, send same identifier to client
Client sends identifier along with requests to protected resources

### Server-side Sessions Nasıl Çalışır?

1. **Login Süreci:**

   - Kullanıcı email/password ile login olur
   - Server credentials'ları doğrular (database'de kontrol eder)
   - Eğer doğruysa, server unique bir session ID oluşturur
   - Session ID ve kullanıcı bilgileri server'da saklanır (memory, database, Redis vs.)
   - Session ID client'a cookie olarak gönderilir

2. **Sonraki İstekler:**

   - Client her istekte session ID'yi cookie ile gönderir
   - Server session ID'yi kontrol eder
   - Session geçerliyse ve expire olmamışsa işlemi gerçekleştirir
   - Session yoksa veya expire olduysa 401 Unauthorized döner

3. **Logout Süreci:**
   - Client logout isteği gönderir
   - Server session'ı siler
   - Client'daki cookie temizlenir

### Avantajları:

- Server tam kontrol sahibi (session'ı istediği zaman silebilir)
- Sensitive data server'da kalır
- Traditional ve güvenilir yöntem

### Dezavantajları:

- Server memory/storage kullanır
- Horizontal scaling zorlaşır
- Multiple server olduğunda session sharing gerekir

## Authentication Tokens (JWT)

Token-based authentication, stateless bir yaklaşımdır. Server'da session saklamak yerine, kullanıcı bilgileri token içinde encode edilir ve client'a gönderilir.

### Authentication Tokens Nasıl Çalışır?

1. **Login Süreci:**

   - Kullanıcı email/password ile login olur
   - Server credentials'ları doğrular
   - Server bir JWT token oluşturur (payload + signature)
   - Token client'a gönderilir (localStorage, sessionStorage veya cookie)

2. **Token İçeriği (JWT):**

   ```
   Header: { "alg": "HS256", "typ": "JWT" }
   Payload: { "userId": 123, "email": "user@example.com", "exp": 1640995200 }
   Signature: HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), secret)
   ```

3. **Sonraki İstekler:**

   - Client her istekte token'ı Authorization header'da gönderir
   - `Authorization: Bearer eyJhbGciOiJIUzI1NiIs...`
   - Server token'ı verify eder (signature kontrolü)
   - Token geçerliyse işlemi gerçekleştirir

4. **Logout Süreci:**
   - Client token'ı localStorage/sessionStorage'dan siler
   - Server-side'da token blacklist'e eklenebilir (opsiyonel)

### Avantajları:

- **Stateless:** Server'da session saklamaya gerek yok
- **Scalable:** Multiple server arasında problem yok
- **Cross-domain:** Farklı domain'lerde kullanılabilir
- **Mobile-friendly:** API'ler için ideal
- **Decentralized:** Token kendi kendini verify eder

### Dezavantajları:

- **Token boyutu:** Session ID'den daha büyük
- **Revoke etmek zor:** Token expire olana kadar geçerli
- **XSS risk:** localStorage'da saklanırsa XSS'e açık
- **Secret key güvenliği:** Key sızdırırsa tüm tokenlar tehlikede

### JWT Token Yapısı:

```
xxxxx.yyyyy.zzzzz
  |     |     |
Header Payload Signature
```

### Güvenlik Önerileri:

- Token'ları httpOnly cookie'lerde sakla
- Kısa expiration time kullan (15-30 dakika)
- Refresh token mekanizması ekle
- HTTPS kullan
- Secret key'i güvenli tut

## SPAs Neden Tokens Kullanır (Sessions Yerine)?

Single Page Applications (SPAs) genellikle sessions yerine tokens tercih eder. Bunun temel sebepleri:

### SPA'ların Yapısı ve Token İhtiyacı:

1. **Client-Side Rendering:**

   - SPA'lar JavaScript ile client-side'da render olur
   - Initial load'dan sonra sadece API calls yapılır
   - Traditional server-side rendering yok

2. **API-First Yaklaşım:**

   - SPA'lar backend'le sadece REST/GraphQL API'ler üzerinden konuşur
   - Her request ayrı bir HTTP call'dur
   - Sessions cookie-based olduğu için API'ler için ideal değil

3. **Stateless Communication:**
   - Her API call independent olmalı
   - Server her request'i tek başına anlayabilmeli
   - Session state server'da tutmak SPA mimarisine uymuyor

### Sessions ile SPA'larda Yaşanan Problemler:

1. **CORS Issues:**

   - Cross-origin requests'lerde cookie gönderimi karmaşık
   - `credentials: 'include'` gerekli ama güvenlik riski
   - Preflight requests her zaman cookie göndermez

2. **Mobile/Desktop Apps:**

   - Native mobile apps cookie storage'ı desteklemez
   - Same-origin policy mobilde geçerli değil
   - Token'lar localStorage/memory'de kolayca saklanır

3. **Microservices Architecture:**
   - Multiple API endpoints olduğunda session sharing zor
   - Her service aynı session store'a erişmeli
   - Token'lar her service tarafından verify edilebilir

### Token'ların SPA'larda Avantajları:

1. **Cross-Domain Support:**

   ```javascript
   // Her API call'da token gönderimi
   fetch('https://api.example.com/user', {
     headers: {
       Authorization: `Bearer ${token}`,
     },
   });
   ```

2. **Client-Side Storage:**

   ```javascript
   // Token storage options
   localStorage.setItem('token', jwtToken); // Persistent
   sessionStorage.setItem('token', jwtToken); // Session-based
   // veya memory'de tut (en güvenli)
   ```

3. **No Server State:**
   - Server restart olsa bile authentication devam eder
   - Load balancer arkasında problem yok
   - Horizontal scaling kolay

### SPA Authentication Flow (Token-based):

```javascript
// 1. Login
const response = await fetch('/api/login', {
  method: 'POST',
  body: JSON.stringify({ email, password }),
});
const { token } = await response.json();
localStorage.setItem('token', token);

// 2. Subsequent requests
const getData = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch('/api/protected', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
};

// 3. Logout
const logout = () => {
  localStorage.removeItem('token');
  // Redirect to login
};
```

### Modern SPA Authentication Patterns:

1. **Access + Refresh Tokens:**

   - Short-lived access token (15 min)
   - Long-lived refresh token (7 days)
   - Automatic token refresh

2. **Token Storage Strategies:**

   - **httpOnly cookies:** XSS'e karşı güvenli ama CORS zor
   - **localStorage:** XSS riski var ama kolay kullanım
   - **Memory only:** En güvenli ama refresh'te kaybolur

3. **Token Validation:**
   ```javascript
   // JWT decode ve expiry check
   const isTokenValid = (token) => {
     try {
       const decoded = jwt.decode(token);
       return decoded.exp > Date.now() / 1000;
     } catch {
       return false;
     }
   };
   ```

**Sonuç:** SPAs'lar API-first, stateless ve cross-platform doğalarından dolayı tokens kullanır. Sessions daha çok traditional server-rendered applications için uygundur.

## JWT (JSON Web Token) Nedir?

JWT, JSON formatında bilgileri güvenli bir şekilde taraflar arasında aktarmak için kullanılan açık standart (RFC 7519) bir token formatıdır.

### JWT'nin Temel Özellikleri:

1. **Self-contained:** Token kendi içinde tüm gerekli bilgileri barındırır
2. **Stateless:** Server'da session saklamaya gerek yoktur
3. **URL-safe:** Base64URL encoding kullanır, URL'lerde güvenle kullanılabilir
4. **Compact:** Küçük boyutlu, HTTP headers'da rahatlıkla taşınabilir
5. **Digital Signature:** Token'ın değiştirilip değiştirilmediği kontrol edilebilir

### JWT'nin 3 Ana Bileşeni:

JWT üç bölümden oluşur ve nokta (.) ile ayrılır:

```
Header.Payload.Signature
xxxxx.yyyyy.zzzzz
```

#### 1. Header (Başlık):

Token'ın tipini ve kullanılan hash algoritmasını belirtir.

```json
{
  "alg": "HS256", // Algoritma (HMAC SHA256)
  "typ": "JWT" // Token tipi
}
```

**Base64URL Encoded:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`

#### 2. Payload (Veri Kısmı):

Kullanıcı bilgileri ve metadata'yı içerir. Claims (iddialar) olarak adlandırılır.

**Standart Claims:**

```json
{
  "sub": "1234567890", // Subject (kullanıcı ID)
  "name": "John Doe", // Kullanıcı adı
  "email": "john@example.com", // Email
  "iat": 1516239022, // Issued at (oluşturulma zamanı)
  "exp": 1516242622, // Expiration (son kullanma)
  "iss": "https://myapp.com", // Issuer (kim oluşturdu)
  "aud": "https://api.com" // Audience (kime yönelik)
}
```

**Base64URL Encoded:** `eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ`

#### 3. Signature (İmza):

Token'ın değiştirilip değiştirilmediğini kontrol etmek için kullanılır. Sİgned, not encrypted! Can be parsed + read by anyone

```javascript
// HMAC SHA256 algoritması ile oluşturulur
HMACSHA256(base64UrlEncode(header) + '.' + base64UrlEncode(payload), secret_key);
```

**Base64URL Encoded:** `SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`

### Tam JWT Örneği:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

### JWT Claims Türleri:

1. **Registered Claims (Standart):**

   - `iss` (issuer): Token'ı kim oluşturdu
   - `sub` (subject): Token'ın konusu (genelde user ID)
   - `aud` (audience): Token'ın hedef kitlesi
   - `exp` (expiration): Son kullanma tarihi
   - `iat` (issued at): Oluşturulma tarihi
   - `nbf` (not before): Bu tarihten önce geçersiz

2. **Public Claims:**

   - Herkesçe bilinen, standartlaşmış claim'ler
   - Collision'dan kaçınmak için namespace kullanılır

3. **Private Claims:**
   - Uygulamaya özel custom claim'ler
   - Taraflar arasında anlaşılan özel bilgiler

### JWT Nasıl Doğrulanır?

```javascript
// 1. Token'ı parse et
const [header, payload, signature] = token.split('.');

// 2. Header ve payload'ı decode et
const decodedHeader = JSON.parse(base64UrlDecode(header));
const decodedPayload = JSON.parse(base64UrlDecode(payload));

// 3. Signature'ı verify et
const expectedSignature = createSignature(header, payload, secretKey);
const isValid = signature === expectedSignature;

// 4. Expiration check
const isNotExpired = decodedPayload.exp > Date.now() / 1000;

return isValid && isNotExpired;
```

### JWT Güvenlik Notları:

⚠️ **Önemli:**

- Payload Base64 ile encode edilir, şifrelenmez!
- Sensitive bilgileri payload'a koymayın
- Sadece imza sayesinde değişiklik tespit edilir
- HTTPS kullanımı zorunludur

### JWT vs Session Karşılaştırması:

| Özellik     | JWT             | Session         |
| ----------- | --------------- | --------------- |
| Storage     | Client-side     | Server-side     |
| State       | Stateless       | Stateful        |
| Scalability | Yüksek          | Düşük           |
| Revocation  | Zor             | Kolay           |
| Boyut       | Büyük           | Küçük           |
| Güvenlik    | Payload görünür | Server'da gizli |

JWT kullanımı hakkında:
Şimdi, eğer başka sağlayıcılar kullanıyorsanız, o zaman elbette bir veritabanı ve kullanıcı oturumu ekleyebilirsiniz. Bu gerçekten hangi kimlik doğrulama sağlayıcısını kullandığınıza bağlıdır Örneğin, size gönderilen sihirli bağlantıyı içeren bir e-posta aldığınız e-posta kimlik doğrulama sağlayıcısını kullanıyorsanız, e-postaların depolanacağı bir veritabanı eklemeniz gerekir ve JWT kullanmanıza gerek yoktur.
https://next-auth.js.org/configuration/options#session
