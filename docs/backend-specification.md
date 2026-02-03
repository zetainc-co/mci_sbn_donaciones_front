# Especificación Técnica del Backend - Sistema de Donaciones MCI

**Versión**: 1.0.0
**Fecha**: 2026-02-03
**Proyecto Frontend**: mci_sbn_donaciones_front (React + TypeScript)
**Stack Backend**: Laravel + PostgreSQL + Wompi

---

## 1. Resumen Ejecutivo

### 1.1 Objetivo
Construir un backend API REST para un sistema de donaciones eclesiástico que soporte:
- Donaciones únicas (guest y usuarios registrados)
- Múltiples métodos de pago (tarjeta crédito/débito, PSE)
- Suscripciones con cobro automático mensual
- Recordatorios de donación por email
- Multi-moneda (COP/USD)

### 1.2 Stack Tecnológico
| Componente | Tecnología |
|------------|------------|
| Framework | Laravel 11.x |
| Base de datos | PostgreSQL 15+ |
| Autenticación | Laravel Sanctum (API tokens) |
| Gateway de pago | Wompi (Colombia) |
| Email | Laravel Mail (SMTP/Resend/SES) |
| Colas | Laravel Queue (database/redis) |
| Scheduler | Laravel Task Scheduling |

### 1.3 Alcance MVP
- ✅ Autenticación (registro, login, perfil)
- ✅ CRUD de causas de donación
- ✅ Procesamiento de donaciones únicas
- ✅ Integración Wompi (tarjeta + PSE)
- ✅ Suscripciones automáticas y recordatorios
- ✅ Notificaciones por email
- ✅ Generación de recibos PDF
- ❌ Panel administrativo (fase 2)
- ❌ Reportes avanzados (fase 2)

---

## 2. Arquitectura del Sistema

### 2.1 Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND (React SPA)                        │
│              https://donaciones.mci-sabanorte.org               │
└─────────────────────────┬───────────────────────────────────────┘
                          │ HTTPS REST API
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                     LARAVEL API BACKEND                         │
│               https://api.mci-sabanorte.org                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │ Controllers │  │  Services   │  │     Jobs (Queue)        │ │
│  ├─────────────┤  ├─────────────┤  ├─────────────────────────┤ │
│  │ AuthCtrl    │  │ WompiSvc    │  │ ProcessDonationJob      │ │
│  │ CauseCtrl   │  │ DonationSvc │  │ SendReceiptEmailJob     │ │
│  │ DonationCtrl│  │ ReceiptSvc  │  │ ChargeSubscriptionJob   │ │
│  │ PaymentCtrl │  │ SubsSvc     │  │ SendReminderJob         │ │
│  │ SubsCtrl    │  │ NotifySvc   │  │ RetryFailedPaymentJob   │ │
│  │ WebhookCtrl │  │             │  │                         │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
│                                                                 │
└────────┬────────────────┬────────────────┬─────────────────────┘
         │                │                │
         ▼                ▼                ▼
┌─────────────┐   ┌──────────────┐  ┌──────────────┐
│ PostgreSQL  │   │    Wompi     │  │ Mail Service │
│  Database   │   │   Gateway    │  │ (SMTP/SES)   │
└─────────────┘   └──────────────┘  └──────────────┘
```

### 2.2 Estructura de Carpetas Laravel

```
app/
├── Http/
│   ├── Controllers/
│   │   ├── Api/
│   │   │   ├── AuthController.php
│   │   │   ├── CauseController.php
│   │   │   ├── DonationController.php
│   │   │   ├── PaymentController.php
│   │   │   ├── SubscriptionController.php
│   │   │   └── WebhookController.php
│   │   └── Controller.php
│   ├── Requests/
│   │   ├── StoreDonationRequest.php
│   │   ├── StoreSubscriptionRequest.php
│   │   └── ...
│   └── Resources/
│       ├── DonationResource.php
│       ├── CauseResource.php
│       └── ...
├── Models/
│   ├── User.php
│   ├── Cause.php
│   ├── Donation.php
│   ├── DonationItem.php
│   ├── Subscription.php
│   └── PaymentLog.php
├── Services/
│   ├── WompiService.php
│   ├── DonationService.php
│   ├── SubscriptionService.php
│   ├── ReceiptService.php
│   └── NotificationService.php
├── Jobs/
│   ├── ProcessDonationJob.php
│   ├── SendReceiptEmailJob.php
│   ├── ChargeSubscriptionJob.php
│   └── SendReminderJob.php
├── Mail/
│   ├── DonationReceiptMail.php
│   ├── DonationReminderMail.php
│   └── SubscriptionChargedMail.php
└── Enums/
    ├── CauseType.php
    ├── Currency.php
    ├── PaymentMethod.php
    ├── PaymentStatus.php
    ├── SubscriptionType.php
    └── SubscriptionStatus.php
```

---

## 3. Modelo de Datos

### 3.1 Diagrama Entidad-Relación

```
┌──────────────────┐       ┌──────────────────┐
│      users       │       │      causes      │
├──────────────────┤       ├──────────────────┤
│ id (UUID) PK     │       │ id (UUID) PK     │
│ email (unique)   │       │ type (enum)      │
│ password         │       │ name             │
│ full_name        │       │ description      │
│ phone            │       │ fixed_amount     │
│ document_type    │       │ presets_cop[]    │
│ document_number  │       │ presets_usd[]    │
│ country          │       │ allow_quantity   │
│ email_verified_at│       │ is_active        │
│ created_at       │       │ sort_order       │
│ updated_at       │       │ created_at       │
└────────┬─────────┘       │ updated_at       │
         │                 └────────┬─────────┘
         │                          │
         │    ┌─────────────────────┼─────────────────────┐
         │    │                     │                     │
         ▼    ▼                     ▼                     ▼
┌──────────────────┐       ┌──────────────────┐  ┌──────────────────┐
│    donations     │       │ donation_items   │  │  subscriptions   │
├──────────────────┤       ├──────────────────┤  ├──────────────────┤
│ id (UUID) PK     │       │ id (UUID) PK     │  │ id (UUID) PK     │
│ user_id (FK null)│◄──────│ donation_id (FK) │  │ user_id (FK)     │
│ guest_email      │       │ cause_id (FK)    │──┤ cause_id (FK)    │
│ guest_name       │       │ cause_name       │  │ amount           │
│ guest_phone      │       │ amount           │  │ currency         │
│ guest_document   │       │ quantity         │  │ frequency        │
│ prayer_request   │       │ subtotal         │  │ type (enum)      │
│ status (enum)    │       │ created_at       │  │ status (enum)    │
│ total_amount     │       └──────────────────┘  │ next_charge_at   │
│ currency (enum)  │                             │ last_charged_at  │
│ payment_method   │       ┌──────────────────┐  │ failed_attempts  │
│ wompi_reference  │       │  payment_logs    │  │ wompi_source_id  │
│ wompi_status     │       ├──────────────────┤  │ created_at       │
│ paid_at          │       │ id (UUID) PK     │  │ updated_at       │
│ created_at       │       │ donation_id (FK) │  └──────────────────┘
│ updated_at       │◄──────│ subscription_id  │
└──────────────────┘       │ wompi_tx_id      │
                           │ status           │
                           │ amount           │
                           │ response_json    │
                           │ created_at       │
                           └──────────────────┘
```

### 3.2 Definición de Tablas

#### 3.2.1 Tabla: `users`
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    document_type VARCHAR(10), -- CC, CE, TI, PAS, NIT
    document_number VARCHAR(20),
    country VARCHAR(2) DEFAULT 'CO',
    email_verified_at TIMESTAMP,
    remember_token VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
```

#### 3.2.2 Tabla: `causes`
```sql
CREATE TABLE causes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(20) NOT NULL, -- MOTIVE, PROJECT, EVENT
    name VARCHAR(255) NOT NULL,
    description TEXT,
    fixed_amount DECIMAL(12,2), -- Para PROJECT y EVENT
    presets_cop JSONB DEFAULT '[]', -- [20000, 50000, 100000]
    presets_usd JSONB DEFAULT '[]', -- [10, 20, 50]
    allow_quantity BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_causes_type ON causes(type);
CREATE INDEX idx_causes_active ON causes(is_active);
```

#### 3.2.3 Tabla: `donations`
```sql
CREATE TABLE donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Datos guest (cuando user_id es null)
    guest_email VARCHAR(255),
    guest_name VARCHAR(255),
    guest_phone VARCHAR(20),
    guest_document_type VARCHAR(10),
    guest_document_number VARCHAR(20),
    prayer_request TEXT,

    -- Totales
    total_amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'COP', -- COP, USD

    -- Estado del pago
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    -- PENDING, PROCESSING, COMPLETED, FAILED, REFUNDED

    -- Datos Wompi
    payment_method VARCHAR(20), -- CREDIT_CARD, DEBIT_CARD, PSE
    wompi_reference VARCHAR(100),
    wompi_transaction_id VARCHAR(100),
    wompi_status VARCHAR(50),
    wompi_response JSONB,

    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_donations_user ON donations(user_id);
CREATE INDEX idx_donations_status ON donations(status);
CREATE INDEX idx_donations_created ON donations(created_at);
CREATE INDEX idx_donations_wompi_ref ON donations(wompi_reference);
```

#### 3.2.4 Tabla: `donation_items`
```sql
CREATE TABLE donation_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donation_id UUID NOT NULL REFERENCES donations(id) ON DELETE CASCADE,
    cause_id UUID NOT NULL REFERENCES causes(id),
    cause_name VARCHAR(255) NOT NULL, -- Snapshot del nombre
    cause_type VARCHAR(20) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    subtotal DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_donation_items_donation ON donation_items(donation_id);
```

#### 3.2.5 Tabla: `subscriptions`
```sql
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    cause_id UUID NOT NULL REFERENCES causes(id),

    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'COP',
    frequency VARCHAR(20) NOT NULL DEFAULT 'MONTHLY', -- MONTHLY, WEEKLY

    type VARCHAR(20) NOT NULL DEFAULT 'AUTOMATIC', -- AUTOMATIC, REMINDER
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    -- ACTIVE, PAUSED, CANCELLED, FAILED

    -- Para cobro automático
    wompi_source_id VARCHAR(100), -- Token de tarjeta guardada
    wompi_customer_id VARCHAR(100),

    next_charge_at TIMESTAMP,
    last_charged_at TIMESTAMP,
    failed_attempts INTEGER DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_next_charge ON subscriptions(next_charge_at);
```

#### 3.2.6 Tabla: `payment_logs`
```sql
CREATE TABLE payment_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donation_id UUID REFERENCES donations(id),
    subscription_id UUID REFERENCES subscriptions(id),

    wompi_transaction_id VARCHAR(100),
    status VARCHAR(50) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    payment_method VARCHAR(20),

    request_json JSONB,
    response_json JSONB,
    error_message TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payment_logs_donation ON payment_logs(donation_id);
CREATE INDEX idx_payment_logs_subscription ON payment_logs(subscription_id);
```

### 3.3 Enums

```php
// app/Enums/CauseType.php
enum CauseType: string {
    case MOTIVE = 'MOTIVE';     // Diezmo, Ofrenda, Primicia, Pacto
    case PROJECT = 'PROJECT';   // Construcción, Misiones
    case EVENT = 'EVENT';       // Conferencias, Retiros
}

// app/Enums/Currency.php
enum Currency: string {
    case COP = 'COP';
    case USD = 'USD';
}

// app/Enums/PaymentMethod.php
enum PaymentMethod: string {
    case CREDIT_CARD = 'CREDIT_CARD';
    case DEBIT_CARD = 'DEBIT_CARD';
    case PSE = 'PSE';
    case NEQUI = 'NEQUI';      // Futuro
    case DAVIPLATA = 'DAVIPLATA'; // Futuro
}

// app/Enums/PaymentStatus.php
enum PaymentStatus: string {
    case PENDING = 'PENDING';
    case PROCESSING = 'PROCESSING';
    case COMPLETED = 'COMPLETED';
    case FAILED = 'FAILED';
    case REFUNDED = 'REFUNDED';
}

// app/Enums/SubscriptionType.php
enum SubscriptionType: string {
    case AUTOMATIC = 'AUTOMATIC';  // Cobro automático
    case REMINDER = 'REMINDER';    // Solo recordatorio
}

// app/Enums/SubscriptionStatus.php
enum SubscriptionStatus: string {
    case ACTIVE = 'ACTIVE';
    case PAUSED = 'PAUSED';
    case CANCELLED = 'CANCELLED';
    case FAILED = 'FAILED';       // Después de 3 reintentos fallidos
}
```

---

## 4. API REST - Endpoints

### 4.1 Autenticación

#### POST `/api/auth/register`
Registra un nuevo usuario.

**Request:**
```json
{
    "email": "usuario@ejemplo.com",
    "password": "contraseña123",
    "password_confirmation": "contraseña123",
    "full_name": "Juan Pérez",
    "phone": "+573001234567",
    "document_type": "CC",
    "document_number": "1234567890"
}
```

**Response (201):**
```json
{
    "data": {
        "id": "uuid",
        "email": "usuario@ejemplo.com",
        "full_name": "Juan Pérez",
        "phone": "+573001234567"
    },
    "token": "1|abc123...",
    "message": "Usuario registrado exitosamente"
}
```

#### POST `/api/auth/login`
Inicia sesión.

**Request:**
```json
{
    "email": "usuario@ejemplo.com",
    "password": "contraseña123"
}
```

**Response (200):**
```json
{
    "data": {
        "id": "uuid",
        "email": "usuario@ejemplo.com",
        "full_name": "Juan Pérez"
    },
    "token": "2|xyz789..."
}
```

#### POST `/api/auth/logout`
Cierra sesión (requiere autenticación).

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
    "message": "Sesión cerrada exitosamente"
}
```

#### GET `/api/auth/me`
Obtiene usuario actual (requiere autenticación).

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
    "data": {
        "id": "uuid",
        "email": "usuario@ejemplo.com",
        "full_name": "Juan Pérez",
        "phone": "+573001234567",
        "document_type": "CC",
        "document_number": "1234567890",
        "country": "CO",
        "email_verified": true
    }
}
```

---

### 4.2 Causas

#### GET `/api/causes`
Lista todas las causas activas.

**Query params:**
- `type` (opcional): Filtrar por tipo (MOTIVE, PROJECT, EVENT)

**Response (200):**
```json
{
    "data": [
        {
            "id": "uuid-m1",
            "type": "MOTIVE",
            "name": "Diezmo",
            "description": "Fidelidad y obediencia a Dios",
            "fixed_amount": null,
            "presets_cop": [20000, 50000, 100000, 200000],
            "presets_usd": [10, 20, 50, 100],
            "allow_quantity": false
        },
        {
            "id": "uuid-p1",
            "type": "PROJECT",
            "name": "Construcción nueva sede",
            "description": "Apoyo para el nuevo templo",
            "fixed_amount": 100000,
            "presets_cop": null,
            "presets_usd": null,
            "allow_quantity": false
        },
        {
            "id": "uuid-e1",
            "type": "EVENT",
            "name": "Conferencia Jóvenes 2025",
            "description": "Inscripción al evento anual",
            "fixed_amount": 30000,
            "presets_cop": null,
            "presets_usd": null,
            "allow_quantity": true
        }
    ]
}
```

#### GET `/api/causes/{id}`
Obtiene detalle de una causa.

**Response (200):**
```json
{
    "data": {
        "id": "uuid-m1",
        "type": "MOTIVE",
        "name": "Diezmo",
        "description": "Fidelidad y obediencia a Dios...",
        "fixed_amount": null,
        "presets_cop": [20000, 50000, 100000, 200000],
        "presets_usd": [10, 20, 50, 100],
        "allow_quantity": false
    }
}
```

---

### 4.3 Donaciones

#### POST `/api/donations`
Crea una nueva donación.

**Request (Usuario autenticado):**
```json
{
    "items": [
        {
            "cause_id": "uuid-m1",
            "amount": 100000,
            "quantity": 1
        },
        {
            "cause_id": "uuid-e1",
            "amount": 30000,
            "quantity": 2
        }
    ],
    "currency": "COP",
    "payment_method": "CREDIT_CARD",
    "prayer_request": "Por mi familia"
}
```

**Request (Guest):**
```json
{
    "items": [
        {
            "cause_id": "uuid-m1",
            "amount": 100000,
            "quantity": 1
        }
    ],
    "currency": "COP",
    "payment_method": "PSE",
    "guest_info": {
        "email": "invitado@ejemplo.com",
        "full_name": "María García",
        "phone": "+573009876543",
        "document_type": "CC",
        "document_number": "9876543210"
    },
    "prayer_request": "Por sanidad"
}
```

**Response (201):**
```json
{
    "data": {
        "id": "uuid-donation",
        "status": "PENDING",
        "total_amount": 160000,
        "currency": "COP",
        "payment_method": "CREDIT_CARD",
        "items": [
            {
                "cause_name": "Diezmo",
                "amount": 100000,
                "quantity": 1,
                "subtotal": 100000
            },
            {
                "cause_name": "Conferencia Jóvenes 2025",
                "amount": 30000,
                "quantity": 2,
                "subtotal": 60000
            }
        ],
        "created_at": "2026-02-03T10:00:00Z"
    },
    "payment": {
        "wompi_reference": "ref_abc123",
        "redirect_url": null,  // Para PSE sería la URL de redirección
        "requires_action": false
    }
}
```

#### GET `/api/donations`
Lista donaciones del usuario (requiere autenticación).

**Query params:**
- `page` (default: 1)
- `per_page` (default: 10, max: 50)
- `status` (opcional): PENDING, COMPLETED, FAILED

**Response (200):**
```json
{
    "data": [
        {
            "id": "uuid",
            "status": "COMPLETED",
            "total_amount": 100000,
            "currency": "COP",
            "payment_method": "CREDIT_CARD",
            "paid_at": "2026-02-03T10:05:00Z",
            "items_count": 1,
            "created_at": "2026-02-03T10:00:00Z"
        }
    ],
    "meta": {
        "current_page": 1,
        "last_page": 5,
        "per_page": 10,
        "total": 45
    }
}
```

#### GET `/api/donations/{id}`
Obtiene detalle de una donación.

**Response (200):**
```json
{
    "data": {
        "id": "uuid",
        "status": "COMPLETED",
        "total_amount": 100000,
        "currency": "COP",
        "payment_method": "CREDIT_CARD",
        "wompi_reference": "ref_abc123",
        "paid_at": "2026-02-03T10:05:00Z",
        "items": [
            {
                "cause_name": "Diezmo",
                "cause_type": "MOTIVE",
                "amount": 100000,
                "quantity": 1,
                "subtotal": 100000
            }
        ],
        "donor": {
            "full_name": "Juan Pérez",
            "email": "juan@ejemplo.com"
        },
        "prayer_request": "Por mi familia",
        "created_at": "2026-02-03T10:00:00Z"
    }
}
```

#### GET `/api/donations/{id}/receipt`
Descarga recibo en PDF.

**Response:** Binary PDF file

---

### 4.4 Pagos

#### POST `/api/payments/card/tokenize`
Tokeniza una tarjeta para pago.

**Request:**
```json
{
    "card_number": "4242424242424242",
    "card_holder": "JUAN PEREZ",
    "expiry_month": "12",
    "expiry_year": "2028",
    "cvv": "123"
}
```

**Response (200):**
```json
{
    "token": "tok_abc123xyz",
    "brand": "VISA",
    "last_four": "4242",
    "expires_at": "2026-02-03T10:30:00Z"
}
```

#### POST `/api/payments/process`
Procesa el pago de una donación.

**Request (Tarjeta):**
```json
{
    "donation_id": "uuid-donation",
    "payment_method": "CREDIT_CARD",
    "card_token": "tok_abc123xyz",
    "installments": 1
}
```

**Request (PSE):**
```json
{
    "donation_id": "uuid-donation",
    "payment_method": "PSE",
    "pse_data": {
        "bank_code": "1007",
        "person_type": "NATURAL",
        "document_type": "CC",
        "document_number": "1234567890"
    }
}
```

**Response (200) - Tarjeta aprobada:**
```json
{
    "status": "APPROVED",
    "donation_id": "uuid-donation",
    "wompi_transaction_id": "tx_abc123",
    "message": "Pago procesado exitosamente"
}
```

**Response (200) - PSE (redirección):**
```json
{
    "status": "PENDING",
    "donation_id": "uuid-donation",
    "redirect_url": "https://banco.com/pse/confirm?ref=abc123",
    "message": "Redirigiendo al banco"
}
```

#### GET `/api/payments/pse/banks`
Lista bancos disponibles para PSE.

**Response (200):**
```json
{
    "data": [
        {"code": "1007", "name": "Bancolombia"},
        {"code": "1009", "name": "Banco de Bogotá"},
        {"code": "1013", "name": "BBVA"},
        {"code": "1019", "name": "Scotiabank"},
        {"code": "1023", "name": "Banco de Occidente"},
        {"code": "1040", "name": "Banco Agrario"},
        {"code": "1052", "name": "Banco AV Villas"},
        {"code": "1058", "name": "Banco Procredit"},
        {"code": "1059", "name": "Bancoomeva"},
        {"code": "1060", "name": "Banco Pichincha"},
        {"code": "1061", "name": "Bancóldex"},
        {"code": "1062", "name": "Banco Falabella"},
        {"code": "1063", "name": "Banco Finandina"},
        {"code": "1064", "name": "Banco Multibank"},
        {"code": "1065", "name": "Banco Santander"},
        {"code": "1066", "name": "Banco Cooperativo Coopcentral"},
        {"code": "1067", "name": "Banco Serfinanza"},
        {"code": "1069", "name": "Banco Itaú"},
        {"code": "1151", "name": "Daviplata"},
        {"code": "1507", "name": "Nequi"}
    ]
}
```

---

### 4.5 Suscripciones

#### POST `/api/subscriptions`
Crea una suscripción (automática o recordatorio).

**Request (Suscripción automática):**
```json
{
    "cause_id": "uuid-m1",
    "amount": 100000,
    "currency": "COP",
    "frequency": "MONTHLY",
    "type": "AUTOMATIC",
    "card_token": "tok_abc123xyz",
    "start_date": "2026-03-01"
}
```

**Request (Solo recordatorio):**
```json
{
    "cause_id": "uuid-m1",
    "amount": 100000,
    "currency": "COP",
    "frequency": "MONTHLY",
    "type": "REMINDER",
    "start_date": "2026-03-01"
}
```

**Response (201):**
```json
{
    "data": {
        "id": "uuid-subscription",
        "cause": {
            "id": "uuid-m1",
            "name": "Diezmo"
        },
        "amount": 100000,
        "currency": "COP",
        "frequency": "MONTHLY",
        "type": "AUTOMATIC",
        "status": "ACTIVE",
        "next_charge_at": "2026-03-01T00:00:00Z",
        "created_at": "2026-02-03T10:00:00Z"
    },
    "message": "Suscripción creada exitosamente"
}
```

#### GET `/api/subscriptions`
Lista suscripciones del usuario.

**Response (200):**
```json
{
    "data": [
        {
            "id": "uuid",
            "cause": {
                "id": "uuid-m1",
                "name": "Diezmo"
            },
            "amount": 100000,
            "currency": "COP",
            "frequency": "MONTHLY",
            "type": "AUTOMATIC",
            "status": "ACTIVE",
            "next_charge_at": "2026-03-01T00:00:00Z",
            "last_charged_at": "2026-02-01T00:00:00Z"
        }
    ]
}
```

#### PATCH `/api/subscriptions/{id}`
Actualiza estado de suscripción.

**Request:**
```json
{
    "status": "PAUSED"
}
```

**Response (200):**
```json
{
    "data": {
        "id": "uuid",
        "status": "PAUSED",
        "message": "Suscripción pausada"
    }
}
```

#### DELETE `/api/subscriptions/{id}`
Cancela suscripción.

**Response (200):**
```json
{
    "message": "Suscripción cancelada exitosamente"
}
```

---

### 4.6 Webhooks

#### POST `/api/webhooks/wompi`
Recibe notificaciones de Wompi.

**Headers:**
- `X-Event-Checksum`: Firma HMAC para validación

**Request (ejemplo transacción aprobada):**
```json
{
    "event": "transaction.updated",
    "data": {
        "transaction": {
            "id": "tx_abc123",
            "reference": "ref_donation_uuid",
            "status": "APPROVED",
            "amount_in_cents": 10000000,
            "currency": "COP",
            "payment_method_type": "CARD"
        }
    },
    "timestamp": 1706961600
}
```

**Response (200):**
```json
{
    "received": true
}
```

**Lógica del webhook:**
1. Validar firma HMAC
2. Buscar donación por `reference`
3. Actualizar estado de la donación
4. Si APPROVED: disparar `SendReceiptEmailJob`
5. Si FAILED: marcar donación como fallida

---

## 5. Flujos de Negocio

### 5.1 Flujo de Donación con Tarjeta

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Frontend   │    │   Backend   │    │    Wompi    │    │    Email    │
└──────┬──────┘    └──────┬──────┘    └──────┬──────┘    └──────┬──────┘
       │                  │                  │                  │
       │ POST /donations  │                  │                  │
       │─────────────────>│                  │                  │
       │                  │                  │                  │
       │                  │ Crear donation   │                  │
       │                  │ status=PENDING   │                  │
       │                  │                  │                  │
       │ POST /payments/  │                  │                  │
       │ card/tokenize    │                  │                  │
       │─────────────────>│                  │                  │
       │                  │                  │                  │
       │                  │ Tokenize card    │                  │
       │                  │─────────────────>│                  │
       │                  │                  │                  │
       │                  │<─────────────────│                  │
       │                  │ card_token       │                  │
       │<─────────────────│                  │                  │
       │                  │                  │                  │
       │ POST /payments/  │                  │                  │
       │ process          │                  │                  │
       │─────────────────>│                  │                  │
       │                  │                  │                  │
       │                  │ Create transaction│                  │
       │                  │─────────────────>│                  │
       │                  │                  │                  │
       │                  │<─────────────────│                  │
       │                  │ APPROVED         │                  │
       │                  │                  │                  │
       │                  │ Update donation  │                  │
       │                  │ status=COMPLETED │                  │
       │                  │                  │                  │
       │                  │ Dispatch job     │                  │
       │                  │──────────────────────────────────────>│
       │                  │                  │  SendReceiptEmail │
       │                  │                  │                  │
       │<─────────────────│                  │                  │
       │ {status: OK}     │                  │                  │
       │                  │                  │                  │
```

### 5.2 Flujo de Donación con PSE

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Frontend   │    │   Backend   │    │    Wompi    │    │    Banco    │
└──────┬──────┘    └──────┬──────┘    └──────┬──────┘    └──────┬──────┘
       │                  │                  │                  │
       │ POST /donations  │                  │                  │
       │─────────────────>│                  │                  │
       │                  │ Crear donation   │                  │
       │                  │ status=PENDING   │                  │
       │                  │                  │                  │
       │ POST /payments/  │                  │                  │
       │ process (PSE)    │                  │                  │
       │─────────────────>│                  │                  │
       │                  │                  │                  │
       │                  │ Create PSE tx    │                  │
       │                  │─────────────────>│                  │
       │                  │                  │                  │
       │                  │<─────────────────│                  │
       │                  │ redirect_url     │                  │
       │                  │                  │                  │
       │<─────────────────│                  │                  │
       │ {redirect_url}   │                  │                  │
       │                  │                  │                  │
       │ Usuario redirige │                  │                  │
       │─────────────────────────────────────────────────────────>│
       │                  │                  │                  │
       │                  │                  │                  │
       │                  │                  │ Webhook callback │
       │                  │<─────────────────│                  │
       │                  │ transaction.updated                 │
       │                  │                  │                  │
       │                  │ Update donation  │                  │
       │                  │ + Send email     │                  │
       │                  │                  │                  │
       │<─────────────────────────────────────────────────────────│
       │ Usuario retorna a│confirmación      │                  │
       │                  │                  │                  │
```

### 5.3 Flujo de Suscripción Automática (Cobro Mensual)

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Scheduler  │    │  Job Queue  │    │    Wompi    │    │    Email    │
└──────┬──────┘    └──────┬──────┘    └──────┬──────┘    └──────┬──────┘
       │                  │                  │                  │
       │ Cron daily 6am   │                  │                  │
       │                  │                  │                  │
       │ Query: subs where│                  │                  │
       │ next_charge <= now                  │                  │
       │ AND status=ACTIVE│                  │                  │
       │                  │                  │                  │
       │ Dispatch jobs    │                  │                  │
       │─────────────────>│                  │                  │
       │                  │                  │                  │
       │                  │ ChargeSubscriptionJob               │
       │                  │                  │                  │
       │                  │ Create transaction                  │
       │                  │─────────────────>│                  │
       │                  │                  │                  │
       │                  │<─────────────────│                  │
       │                  │ APPROVED         │                  │
       │                  │                  │                  │
       │                  │ Create donation  │                  │
       │                  │ Update next_charge                  │
       │                  │                  │                  │
       │                  │ Send receipt     │                  │
       │                  │──────────────────────────────────────>│
       │                  │                  │                  │
       │                  │                  │                  │
       │                  │ IF FAILED:       │                  │
       │                  │ failed_attempts++│                  │
       │                  │                  │                  │
       │                  │ IF failed >= 3:  │                  │
       │                  │ status=FAILED    │                  │
       │                  │ Send alert email │                  │
       │                  │                  │                  │
```

### 5.4 Flujo de Recordatorio

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Scheduler  │    │  Job Queue  │    │    Email    │
└──────┬──────┘    └──────┬──────┘    └──────┬──────┘
       │                  │                  │
       │ Cron daily 8am   │                  │
       │                  │                  │
       │ Query: subs where│                  │
       │ type=REMINDER    │                  │
       │ AND next_charge  │                  │
       │ <= now           │                  │
       │                  │                  │
       │ Dispatch jobs    │                  │
       │─────────────────>│                  │
       │                  │                  │
       │                  │ SendReminderJob  │
       │                  │                  │
       │                  │ Generate link    │
       │                  │ with pre-filled  │
       │                  │ donation data    │
       │                  │                  │
       │                  │ Send email       │
       │                  │─────────────────>│
       │                  │                  │
       │                  │ Update           │
       │                  │ next_charge_at   │
       │                  │ (+1 month)       │
       │                  │                  │
```

---

## 6. Integración Wompi

### 6.1 Configuración

```env
# .env
WOMPI_PUBLIC_KEY=pub_test_xxxxx
WOMPI_PRIVATE_KEY=prv_test_xxxxx
WOMPI_EVENTS_SECRET=events_secret_xxxxx
WOMPI_ENVIRONMENT=sandbox  # sandbox | production
WOMPI_API_URL=https://sandbox.wompi.co/v1  # o https://production.wompi.co/v1
```

### 6.2 WompiService

```php
// app/Services/WompiService.php

class WompiService
{
    /**
     * Tokenizar tarjeta de crédito
     */
    public function tokenizeCard(array $cardData): array
    {
        // POST /tokens/cards
        // Retorna: {id, brand, last_four, exp_month, exp_year}
    }

    /**
     * Crear transacción con tarjeta
     */
    public function createCardTransaction(
        string $reference,
        int $amountInCents,
        string $currency,
        string $cardToken,
        string $customerEmail,
        int $installments = 1
    ): array {
        // POST /transactions
        // Retorna: {id, status, reference, ...}
    }

    /**
     * Crear transacción PSE
     */
    public function createPSETransaction(
        string $reference,
        int $amountInCents,
        string $currency,
        string $bankCode,
        string $personType,
        string $documentType,
        string $documentNumber,
        string $customerEmail,
        string $redirectUrl
    ): array {
        // POST /transactions
        // Retorna: {id, status, redirect_url, ...}
    }

    /**
     * Consultar estado de transacción
     */
    public function getTransaction(string $transactionId): array
    {
        // GET /transactions/{id}
    }

    /**
     * Validar firma del webhook
     */
    public function validateWebhookSignature(
        string $payload,
        string $signature,
        string $timestamp
    ): bool {
        // HMAC SHA256 validation
    }

    /**
     * Crear fuente de pago (para suscripciones)
     */
    public function createPaymentSource(
        string $cardToken,
        string $customerEmail,
        string $acceptanceToken
    ): array {
        // POST /payment_sources
        // Retorna: {id, type, status, ...}
    }

    /**
     * Cobrar a fuente de pago existente
     */
    public function chargePaymentSource(
        string $reference,
        int $amountInCents,
        string $currency,
        string $paymentSourceId
    ): array {
        // POST /transactions
    }
}
```

### 6.3 Endpoints Wompi Utilizados

| Endpoint | Método | Propósito |
|----------|--------|-----------|
| `/tokens/cards` | POST | Tokenizar tarjeta |
| `/transactions` | POST | Crear transacción |
| `/transactions/{id}` | GET | Consultar transacción |
| `/pse/financial_institutions` | GET | Listar bancos PSE |
| `/payment_sources` | POST | Crear fuente de pago recurrente |
| `/merchants/{id}` | GET | Obtener acceptance_token |

### 6.4 Manejo de Estados Wompi

```php
// Mapeo de estados Wompi → estados internos
$statusMap = [
    'PENDING' => PaymentStatus::PROCESSING,
    'APPROVED' => PaymentStatus::COMPLETED,
    'DECLINED' => PaymentStatus::FAILED,
    'VOIDED' => PaymentStatus::REFUNDED,
    'ERROR' => PaymentStatus::FAILED,
];
```

---

## 7. Emails y Notificaciones

### 7.1 Plantillas de Email

#### 7.1.1 Recibo de Donación
**Trigger:** Donación completada (APPROVED)

**Contenido:**
- Logo MCI
- Saludo personalizado
- Detalle de items donados (causa, monto, cantidad)
- Total pagado
- Método de pago (últimos 4 dígitos si tarjeta)
- Referencia de transacción
- Fecha y hora
- Mensaje de agradecimiento
- Botón "Descargar recibo PDF"

#### 7.1.2 Recordatorio de Donación
**Trigger:** Suscripción tipo REMINDER en fecha programada

**Contenido:**
- Saludo personalizado
- Recordatorio de compromiso (causa, monto)
- Botón "Donar ahora" (link pre-llenado)
- Opción para cancelar recordatorios

#### 7.1.3 Confirmación de Suscripción
**Trigger:** Nueva suscripción creada

**Contenido:**
- Detalles de la suscripción
- Fecha del próximo cobro
- Cómo cancelar/pausar

#### 7.1.4 Cobro Automático Realizado
**Trigger:** Suscripción automática cobrada exitosamente

**Contenido:**
- Confirmación del cobro
- Detalle (causa, monto)
- Referencia de transacción
- Próximo cobro programado

#### 7.1.5 Cobro Fallido
**Trigger:** Fallo en cobro de suscripción (después de reintentos)

**Contenido:**
- Notificación del problema
- Solicitud de actualizar método de pago
- Link para gestionar suscripción

### 7.2 Configuración de Email

```env
# .env
MAIL_MAILER=smtp
MAIL_HOST=smtp.resend.com
MAIL_PORT=587
MAIL_USERNAME=resend
MAIL_PASSWORD=re_xxxxx
MAIL_FROM_ADDRESS=donaciones@mci-sabanorte.org
MAIL_FROM_NAME="MCI Sabana Norte"
```

---

## 8. Jobs y Scheduler

### 8.1 Jobs (Queue)

```php
// Jobs a implementar

ProcessDonationJob::class
// - Procesa donación después de pago confirmado
// - Crea registro final
// - Dispara email de recibo

SendReceiptEmailJob::class
// - Genera PDF del recibo
// - Envía email con adjunto

ChargeSubscriptionJob::class
// - Cobra suscripción automática
// - Maneja reintentos (max 3)
// - Actualiza next_charge_at
// - Crea donación asociada

SendReminderJob::class
// - Envía email de recordatorio
// - Incluye link pre-llenado
// - Actualiza next_charge_at

RetryFailedPaymentJob::class
// - Reintenta pagos fallidos
// - Ejecuta cada 24h por 3 días
```

### 8.2 Scheduler (Cron)

```php
// app/Console/Kernel.php

protected function schedule(Schedule $schedule)
{
    // Procesar suscripciones automáticas (diario 6am)
    $schedule->job(new ProcessSubscriptionsCommand)
        ->dailyAt('06:00')
        ->timezone('America/Bogota');

    // Enviar recordatorios (diario 8am)
    $schedule->job(new SendRemindersCommand)
        ->dailyAt('08:00')
        ->timezone('America/Bogota');

    // Reintentar pagos fallidos (diario 10am)
    $schedule->job(new RetryFailedPaymentsCommand)
        ->dailyAt('10:00')
        ->timezone('America/Bogota');

    // Limpiar tokens expirados (diario medianoche)
    $schedule->command('sanctum:prune-expired --hours=24')
        ->daily();
}
```

---

## 9. Validaciones y Reglas de Negocio

### 9.1 Validaciones de Donación

```php
// Reglas para StoreDonationRequest

'items' => 'required|array|min:1',
'items.*.cause_id' => 'required|uuid|exists:causes,id',
'items.*.amount' => 'required|numeric|min:1000', // Mínimo 1000 COP
'items.*.quantity' => 'required|integer|min:1|max:100',

'currency' => 'required|in:COP,USD',
'payment_method' => 'required|in:CREDIT_CARD,DEBIT_CARD,PSE',

// Guest info (requerido si no autenticado)
'guest_info.email' => 'required_without:user|email',
'guest_info.full_name' => 'required_without:user|string|max:255',
'guest_info.document_type' => 'required_without:user|in:CC,CE,TI,PAS,NIT',
'guest_info.document_number' => 'required_without:user|string|max:20',

'prayer_request' => 'nullable|string|max:1000',
```

### 9.2 Reglas de Negocio

1. **Montos mínimos:**
   - COP: $1,000
   - USD: $1

2. **Causas:**
   - MOTIVE: Monto libre (presets sugeridos)
   - PROJECT: Monto fijo, no editable
   - EVENT: Monto fijo, cantidad variable (si allow_quantity=true)

3. **Métodos de pago por moneda:**
   - COP: Tarjeta, PSE
   - USD: Solo tarjeta

4. **Suscripciones:**
   - Solo usuarios registrados
   - Mínimo 1 mes de frecuencia
   - Máximo 3 reintentos en cobros fallidos
   - Automáticamente pausada después de 3 fallos

5. **Recibos:**
   - Generados solo para donaciones COMPLETED
   - PDF descargable hasta 1 año después

---

## 10. Seguridad

### 10.1 Autenticación

- Laravel Sanctum para API tokens
- Tokens expiran en 24 horas (configurable)
- Rate limiting: 60 requests/minuto por IP

### 10.2 Webhooks

- Validación HMAC SHA256 obligatoria
- IPs de Wompi en whitelist (opcional)
- Idempotencia: verificar si transacción ya procesada

### 10.3 Datos Sensibles

- Nunca almacenar números de tarjeta completos
- Solo guardar últimos 4 dígitos para referencia
- Wompi maneja toda la data sensible (PCI DSS)

### 10.4 Headers de Seguridad

```php
// Middleware recomendado
'X-Content-Type-Options' => 'nosniff',
'X-Frame-Options' => 'DENY',
'X-XSS-Protection' => '1; mode=block',
```

---

## 11. Datos de Prueba (Seeders)

### 11.1 Causas Iniciales

```php
// database/seeders/CauseSeeder.php

$causes = [
    // MOTIVES
    [
        'type' => 'MOTIVE',
        'name' => 'Diezmo',
        'description' => 'Fidelidad y obediencia a Dios',
        'presets_cop' => [20000, 50000, 100000, 200000],
        'presets_usd' => [10, 20, 50, 100],
    ],
    [
        'type' => 'MOTIVE',
        'name' => 'Ofrenda',
        'description' => 'Expresión de gratitud y adoración',
        'presets_cop' => [10000, 20000, 40000],
        'presets_usd' => [5, 10, 20],
    ],
    [
        'type' => 'MOTIVE',
        'name' => 'Primicia',
        'description' => 'Lo primero y mejor para Dios',
        'presets_cop' => [50000, 100000, 200000],
        'presets_usd' => [25, 50, 100],
    ],
    [
        'type' => 'MOTIVE',
        'name' => 'Pacto',
        'description' => 'Siembra con propósito específico',
        'presets_cop' => [100000, 300000, 500000],
        'presets_usd' => [50, 150, 250],
    ],

    // PROJECTS
    [
        'type' => 'PROJECT',
        'name' => 'Construcción nueva sede',
        'description' => 'Apoyo para el nuevo templo',
        'fixed_amount' => 100000,
    ],
    [
        'type' => 'PROJECT',
        'name' => 'Misión urbana',
        'description' => 'Alcance en comunidades vulnerables',
        'fixed_amount' => 50000,
    ],

    // EVENTS
    [
        'type' => 'EVENT',
        'name' => 'Conferencia Jóvenes 2026',
        'description' => 'Inscripción al evento anual de jóvenes',
        'fixed_amount' => 30000,
        'allow_quantity' => true,
    ],
    [
        'type' => 'EVENT',
        'name' => 'Retiro familiar',
        'description' => 'Fin de semana de restauración familiar',
        'fixed_amount' => 200000,
        'allow_quantity' => false,
    ],
];
```

### 11.2 Tarjetas de Prueba Wompi

| Número | Resultado |
|--------|-----------|
| 4242 4242 4242 4242 | Aprobada |
| 4111 1111 1111 1111 | Declinada |
| 4012 8888 8888 1881 | Pendiente (3DS) |

---

## 12. Variables de Entorno

```env
# Aplicación
APP_NAME="MCI Donaciones API"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.mci-sabanorte.org

# Base de datos
DB_CONNECTION=pgsql
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=mci_donaciones
DB_USERNAME=mci_user
DB_PASSWORD=secure_password

# Wompi
WOMPI_PUBLIC_KEY=pub_prod_xxxxx
WOMPI_PRIVATE_KEY=prv_prod_xxxxx
WOMPI_EVENTS_SECRET=events_secret_xxxxx
WOMPI_ENVIRONMENT=production
WOMPI_API_URL=https://production.wompi.co/v1

# Email
MAIL_MAILER=smtp
MAIL_HOST=smtp.resend.com
MAIL_PORT=587
MAIL_USERNAME=resend
MAIL_PASSWORD=re_xxxxx
MAIL_FROM_ADDRESS=donaciones@mci-sabanorte.org
MAIL_FROM_NAME="MCI Sabana Norte"

# Queue
QUEUE_CONNECTION=database

# Sanctum
SANCTUM_STATEFUL_DOMAINS=donaciones.mci-sabanorte.org
```

---

## 13. Checklist de Implementación

### Fase 1: Fundamentos
- [ ] Crear proyecto Laravel 11
- [ ] Configurar PostgreSQL
- [ ] Crear migraciones (todas las tablas)
- [ ] Crear modelos con relaciones
- [ ] Crear Enums
- [ ] Configurar Sanctum
- [ ] Implementar AuthController

### Fase 2: Causas y Donaciones
- [ ] CauseController (CRUD básico)
- [ ] DonationController
- [ ] DonationService
- [ ] Validations (Form Requests)
- [ ] API Resources

### Fase 3: Integración Wompi
- [ ] WompiService
- [ ] PaymentController
- [ ] WebhookController
- [ ] Validación de firmas
- [ ] Manejo de estados

### Fase 4: Suscripciones
- [ ] SubscriptionController
- [ ] SubscriptionService
- [ ] ChargeSubscriptionJob
- [ ] SendReminderJob
- [ ] Scheduler configuration

### Fase 5: Notificaciones
- [ ] Mail templates (Blade)
- [ ] SendReceiptEmailJob
- [ ] ReceiptService (PDF generation)
- [ ] Queue workers

### Fase 6: Testing y Deploy
- [ ] Tests unitarios (Services)
- [ ] Tests de integración (API)
- [ ] Seeders de producción
- [ ] Documentación API (opcional: Scribe/Swagger)
- [ ] Deploy y configuración servidor

---

## 14. Notas para el Desarrollador IA

### Contexto del Frontend
El frontend ya está construido con React + TypeScript. Los stores de Zustand manejan:
- `donationStore`: carrito, moneda, paso actual
- `paymentStore`: método seleccionado, datos de tarjeta/PSE
- `donorStore`: información del donante
- `authStore`: usuario autenticado

### Contratos de API Esperados
El frontend espera respuestas JSON con estructura:
```json
{
    "data": { ... },        // Datos principales
    "message": "...",       // Mensaje opcional
    "meta": { ... }         // Paginación si aplica
}
```

Errores:
```json
{
    "message": "Error description",
    "errors": {
        "field": ["Error message"]
    }
}
```

### Prioridades de Implementación
1. **Crítico:** Auth, Causes, Donations básicas
2. **Alto:** Integración Wompi (tarjeta + PSE)
3. **Medio:** Suscripciones automáticas
4. **Bajo:** Recordatorios, PDF receipts

### Consideraciones Técnicas
- Usar UUIDs en lugar de IDs auto-incrementales
- Implementar soft deletes donde tenga sentido
- Logging extensivo para debugging de pagos
- Idempotencia en webhooks (evitar duplicados)

---

**Documento generado para construcción de backend con IA**
**Versión**: 1.0.0
**Fecha**: 2026-02-03
