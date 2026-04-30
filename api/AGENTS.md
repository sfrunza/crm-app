## Project Overview

This project is a Moving Company CRM system.

Architecture:

- Backend: Ruby on Rails API (JSON only)
- Frontend: React + TypeScript (Vite)
- UI: shadcn/ui
- State/Data: React Query + domain-based stores
- Realtime: ActionCable (WebSockets)
- Background jobs: SolidQueue
- Cache: SolidCache
- Database: PostgreSQL

Architecture emphasizes:

- Service objects
- Background jobs
- Model-level validations
- Thin controllers

---

# Rails 8 API Rules

- API-only mode
- No ERB views
- Use JSON serializers
- Use service objects for business logic
- Controllers must stay thin
- Use Pundit for authorization
- Use strong params
- Use pagination for index actions
- Use concerns only for shared controller behavior
- Prefer POROs in app/services
- No fat models
- No callbacks for business logic
- Use enums instead of magic strings
- Follow REST conventions strictly

---

# Model Principles

✔ Business rules belong in models or services  
✔ Controllers must stay thin  
✔ No heavy logic inside callbacks

---
