# Proyecto Cisterna - Backend y Frontend Dockerizados 🚀

Este proyecto contiene:
- Un **backend** en Node.js + Express + SQLite.
- Un **frontend** en React servido por **nginx**.
- Toda la infraestructura montada con **Docker** y **docker-compose**.

---

## 🚀 Requisitos previos

- Tener instalado [Docker](https://www.docker.com/products/docker-desktop/) y [Docker Compose](https://docs.docker.com/compose/install/).

---

## 📂 Estructura del proyecto

```
/cisterna
  ├── backend/
  │    ├── Dockerfile
  │    ├── package.json
  │    └── (código backend)
  ├── frontend/
  │    ├── Dockerfile
  │    ├── package.json
  │    └── (código frontend)
  ├── docker-compose.yml
  └── README.md
```

---

## 🚀 Cómo levantar el proyecto

Desde la carpeta raíz `/cisterna`, en la terminal:

```bash
docker-compose up -d --build
```

- `-d` → Corre en segundo plano (podés cerrar la terminal y todo sigue andando).
- `--build` → Reconstruye las imágenes (recomendado si cambiaste código).

### Puertos utilizados:

| Servicio | URL |
|:---|:---|
| Backend (API) | [http://localhost:3000](http://localhost:3000) |
| Frontend (App Web) | [http://localhost:3001](http://localhost:3001) |

---

## 🛠️ Comandos útiles

- **Ver contenedores corriendo:**

```bash
docker ps
```

- **Ver logs en tiempo real:**

```bash
docker-compose logs -f
```

- **Detener todos los servicios:**

```bash
docker-compose down
```

---

## 📦 Cómo mover este proyecto a otra computadora

1. Copiar toda la carpeta `/cisterna`.
2. En la nueva computadora:
   - Instalar Docker y Docker Compose.
   - Abrir terminal en `/cisterna`.
   - Correr:

```bash
docker-compose up -d --build
```

¡Y todo debería funcionar sin problemas!

---

## ✅ Estado actual del proyecto

- [x] Backend dockerizado.
- [x] Frontend dockerizado.
- [x] Build de producción del frontend (nginx).
- [x] Sistema portátil y reproducible en cualquier máquina.

---

## 🚀 Futuras mejoras (opcional)

- Variables de entorno (.env) para configurar API URLs.
- Deploy real en un VPS (DigitalOcean, AWS, etc.).
- Certificados HTTPS para nginx.

---

# 🏆 ¡Proyecto Full-Stack listo para producción! 🚀
