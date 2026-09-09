
# Ver.ID disclosure flow

* [Ver.ID Node.js SDK](https://github.com/ver-id/verid-sdk-js-mono/tree/main/packages/node-client)
* [Ver.ID disclosure documentatie](https://docs.ver.id/integration/disclosures/introduction)

## Doel

Een bewindvoerder logt vanuit Mijn Nijmegen in via een wallet.

Mijn Nijmegen stuurt door naar:

`/gemachtigd/login?method=IDWallet`

Vanaf dat moment handelt mijn-nijmegen-gemachtigd de login af.

Voor IDWallet gebruiken we Ver.ID Disclosure. Ver.ID levert een gecontroleerde machtiging terug. Gemachtigd maakt daarna zelf een sessie.

## Hoofdflow

```mermaid
flowchart TD
    A["Mijn Nijmegen<br/>Namens iemand anders"] --> B["/gemachtigd/login<br/>method=IDWallet"]

    B --> C["Gemachtigd<br/>start Ver.ID disclosure"]
    C --> D["Ver.ID"]
    D --> E["Yivi of NL Wallet"]
    E --> F["Machtiging delen"]

    F --> G["/gemachtigd/auth/verid/callback"]
    G --> H["Disclosure controleren"]
    H --> I["Gemachtigd sessie maken"]
    I --> J["/gemachtigd/home"]
    J --> K["Scopes tonen"]

    classDef mijn fill:#e7f0ff,stroke:#3973b9,color:#111;
    classDef gemachtigd fill:#e8f5e9,stroke:#388e3c,color:#111;
    classDef verid fill:#fff3e0,stroke:#e07b00,color:#111;
    classDef wallet fill:#f3e5f5,stroke:#8e44ad,color:#111;

    class A mijn;
    class B,C,G,H,I,J,K gemachtigd;
    class D verid;
    class E,F wallet;
```

## Wat krijgen we uit de disclosure?

Ver.ID zet de gegevens uit verschillende wallets om naar dezelfde velden:

* identifier
* type
* clientBsn
* kvkNumber
* scopes

Gemachtigd hoeft daardoor niet te weten hoe Yivi of NL Wallet deze gegevens intern opslaat.

De ruwe disclosure wordt niet als sessie opgeslagen. Eerst controleren we de disclosure en zetten we deze om naar een intern AuthenticationResult.

## State en Proof Key for Code Exchange (PKCE)

Bij het starten van de disclosure maakt Ver.ID tijdelijke beveiligingsgegevens aan.

Proof Key for Code Exchange, voorkomt dat een onderschepte authorization code zomaar gebruikt kan worden.

De tijdelijke state en PKCE-gegevens moeten beschikbaar blijven tot de callback.

Daarvoor gebruiken we dezelfde DynamoDB-tabel als de Gemachtigd-sessies.

```mermaid
flowchart TD
    A["Login starten"] --> B["Ver.ID SDK"]
    B --> C["State + PKCE maken"]
    C --> D["Tijdelijk opslaan<br/>in DynamoDB"]

    D --> E["Gebruiker doorloopt wallet"]
    E --> F["Callback met code + state"]

    F --> G["Tijdelijke gegevens ophalen"]
    G --> H["Ver.ID disclosure afronden"]
    H --> I["Disclosure geldig?"]

    I -->|Ja| J["Nieuwe applicatiesessie"]
    I -->|Nee| K["Geen sessie"]

    classDef app fill:#e8f5e9,stroke:#388e3c,color:#111;
    classDef storage fill:#e8eaf6,stroke:#5c6bc0,color:#111;
    classDef verid fill:#fff3e0,stroke:#e07b00,color:#111;
    classDef error fill:#ffebee,stroke:#c62828,color:#111;

    class A,J app;
    class D,G storage;
    class B,C,E,F,H,I verid;
    class K error;
```

## Verdeling in de code

```text
app/login
  start de gekozen loginmethode

app/auth
  algemene authenticatie-interface

app/auth/verid
  Ver.ID disclosure, configuratie en tijdelijke cache

app/home
  leest de Gemachtigd-sessie

app/logout
  beëindigt de sessie
```

VerIdDisclosureFlow weet hoe Ver.ID werkt.

De algemene applicatie krijgt daarna alleen een AuthenticationResult terug. Daardoor kan later een andere loginmethode worden toegevoegd zonder de sessie- en homepagecode opnieuw te bouwen.

## Belangrijk

We loggen wel technische stappen, maar nooit:

* BSN
* KVK-nummer
* authorization code
* state of PKCE-verifier
* Ver.ID tokens
* sessie-id of cookie
