# Diseño: Arquitectura Frontend - Sistema de Donaciones MCI Sabana Norte

**Fecha:** 2025-01-25
**Estado:** Aprobado
**Proyecto:** mci_sbn_donaciones_front

## Contexto

El proyecto actual es un prototipo funcional de sistema de donaciones con React + Vite. El flujo de 4 pasos (donación → pago → datos → confirmación) está completo pero la estructura es plana y todo el estado vive en `App.tsx`.

Se requiere reestructurar para:
- Arquitectura limpia y escalable
- Preparar para deployment en Docker/Dokploy
- Facilitar futuras conexiones con backend

## Decisiones Técnicas

| Aspecto | Decisión | Justificación |
|---------|----------|---------------|
| Arquitectura | Feature-based | Balance entre organización y simplicidad |
| Estado global | Zustand | Minimalista, sin boilerplate, fácil testing |
| Routing | React Router v6 | Preparar para login/register, steps sin rutas |
| Docker | Nginx Alpine + multi-stage | Imagen pequeña (~25MB), estándar industria |
| Env vars | Build time (Vite) | Simple, Dokploy las sobreescribe |
| Backend | Mocks por ahora | Se conectará después |

## Estructura de Carpetas

```
src/
├── app/                    # Configuración global
│   ├── App.tsx            # Root con providers
│   ├── router.tsx         # React Router config
│   └── providers.tsx      # ThemeProvider, Toaster
│
├── features/              # Módulos por funcionalidad
│   ├── donation/
│   │   ├── components/    # DonationWizard, CategoryTabs, CauseCard...
│   │   ├── hooks/         # useDonationFlow
│   │   ├── store.ts       # Zustand: cart, currency, currentStep
│   │   ├── types.ts       # CartItem, Cause, CauseType
│   │   └── index.ts
│   │
│   ├── payment/
│   │   ├── components/    # PaymentMethodCard, CreditCardForm, PSEForm
│   │   ├── store.ts       # Zustand: selectedMethod
│   │   ├── types.ts       # PaymentMethod
│   │   └── index.ts
│   │
│   ├── donor/
│   │   ├── components/    # DonorForm, LoginForm, RegisterForm, GuestForm
│   │   ├── store.ts       # Zustand: donorInfo
│   │   ├── types.ts       # DonorInfo
│   │   └── index.ts
│   │
│   └── auth/
│       ├── components/    # LoginPage, RegisterPage (placeholder)
│       ├── store.ts       # Auth state (placeholder)
│       └── index.ts
│
├── shared/
│   ├── components/ui/     # shadcn components
│   ├── hooks/             # useMediaQuery, etc.
│   ├── lib/               # cn(), formatters
│   └── assets/            # Imágenes
│
├── mocks/
│   └── causes.ts
│
├── pages/
│   ├── HomePage.tsx       # Wizard de donación
│   ├── LoginPage.tsx      # Placeholder
│   └── RegisterPage.tsx   # Placeholder
│
├── main.tsx
└── index.css
```

## Zustand Stores

### DonationStore
```typescript
interface DonationStore {
  cart: CartItem[];
  currency: Currency;
  currentStep: number;

  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  setCurrency: (currency: Currency) => void;
  setStep: (step: number) => void;
  reset: () => void;
}
```

### PaymentStore
```typescript
interface PaymentStore {
  selectedMethod: PaymentMethod | null;
  cardData: CardData | null;

  selectMethod: (method: PaymentMethod) => void;
  setCardData: (data: CardData) => void;
  reset: () => void;
}
```

### DonorStore
```typescript
interface DonorStore {
  donorInfo: DonorInfo | null;
  donorType: 'guest' | 'registered' | null;

  setDonorInfo: (info: DonorInfo) => void;
  setDonorType: (type: 'guest' | 'registered') => void;
  reset: () => void;
}
```

## Router

```typescript
const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
]);
```

## Docker Configuration

### Dockerfile
```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Stage 2: Production
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### nginx.conf
```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## Dependencias Nuevas

```json
{
  "dependencies": {
    "zustand": "^4.5.0",
    "react-router-dom": "^6.22.0"
  }
}
```

## Plan de Migración

1. Instalar dependencias (zustand, react-router-dom)
2. Crear estructura de carpetas
3. Crear archivos Docker (Dockerfile, nginx.conf, .dockerignore, .env.example)
4. Crear Zustand stores
5. Mover componentes UI a shared/components/ui
6. Crear features con sus componentes
7. Crear páginas y router
8. Actualizar App.tsx y main.tsx
9. Verificar que todo funcione
10. Limpiar archivos obsoletos
