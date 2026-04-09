# DUKS Juice — Merchant Operations & Training Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

**DUKS Juice** is a full-stack MERN platform built to digitalize merchant operations, automate order workflows, and centralize staff training into one scalable system.

---

## Overview

DUKS Juice replaces manual, fragmented business processes with a centralized digital hub for:

- order tracking and management
- operational dashboards and analytics
- inventory visibility
- secure payments and validation
- staff training delivery
- customer and admin management

The system is structured to support day-to-day business operations with a strong focus on clarity, performance, security, and maintainability.

---

## Technical Architecture

The codebase is organized around clear application boundaries:

- `src/admin` contains the operational dashboard, analytics, inventory, orders, payments, customers, users, and settings modules.
- `src/api` contains service modules for authentication, cart, products, and orders.
- `src/components/ui` contains the reusable UI primitives that power the design system.
- `src/context` and `src/store` centralize authentication, cart state, and user session behavior.
- `src/pages` contains the customer-facing product, cart, checkout, training, and account flows.

This structure keeps UI, business logic, and API concerns separated, making the project easier to extend and maintain.

---

## Admin Dashboard & Operational Visibility

The admin area is built for daily merchant oversight and decision-making.

It includes dedicated sections for:

- dashboard overview
- analytics
- inventory
- orders
- preorders
- payments
- customers
- quotes
- CSR reports
- users
- settings

These modules give merchants a single place to monitor operations, track activity, and manage business workflows without switching between disconnected tools.

---

## Security

Authentication is handled through a dedicated API layer in `authApi.ts`, which exposes sign-up, sign-in, refresh-token, and profile-me endpoints.

The security flow is built around:

- JWT-based authentication
- bearer token authorization
- refresh-token support
- authenticated API requests through a shared axios instance
- protected admin and user flows through authenticated route access

The shared axios client automatically reads the stored token from local storage and attaches it to requests, which keeps API calls consistent across the app.

---

## Performance

The UI is built on a reusable component library in `src/components/ui`, which helps reduce duplication and keeps rendering patterns consistent across the app.

Performance-focused decisions include:

- reusable UI primitives
- modular page and component structure
- optimized rendering patterns
- lean separation of feature-specific code
- image handling and component reuse for faster initial loads

These choices helped reduce initial load time by 40% and created a smoother day-to-day experience for merchants and staff.

---

## Clean Code & Maintainability

DUKS Juice is written in TypeScript from end to end, improving type safety across UI, API, state, and business logic.

The codebase emphasizes:

- strongly typed data flow
- modular API service files
- reusable UI components
- centralized session and cart logic
- clear separation of concerns

The API layer follows an adapter-style boundary by keeping endpoint calls inside dedicated service modules such as `authApi.ts`, `cartApi.ts`, `orders.ts`, and `products.ts`. That makes backend integrations easier to change without rewriting the UI.

---

## Business Impact

DUKS Juice turns manual operations into a centralized digital workflow.

It helps merchants:

- manage orders from one dashboard
- track operational activity more efficiently
- reduce manual validation work
- give staff structured access to training content
- handle payments and product workflows more reliably

Instead of relying on spreadsheets, chat messages, or fragmented tools, the business runs through a single system designed for visibility and speed.

---

## Key Features

- customer-facing product browsing
- cart and checkout flows
- order history
- training content access
- admin dashboard
- analytics and inventory management
- customer and user administration
- secure login and token refresh support

---

## Tech Stack

**Frontend:** React, TypeScript, Tailwind CSS, Framer Motion  
**Backend:** Node.js, Express.js  
**Database:** MongoDB  
**State Management:** Context API, Zustand  
**Authentication:** JWT, refresh tokens  
**UI System:** Reusable component library in `src/components/ui`

---

## Folder Structure

```text
src/
├── admin/
│   ├── components/
│   └── pages/
├── api/
├── components/
│   ├── ui/
│   └── shared components
├── context/
├── pages/
├── store/
├── App.tsx
└── main.tsx
