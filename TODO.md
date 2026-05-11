# Bizify v2 TODO

## Confirmed scope for this version
- The only fully working dashboard in this release is the **entrepreneur dashboard**.
- Entrepreneur quick access should focus on:
  - AI Chat
  - Ideas
  - Team
  - Marketplace
- Other roles must still have their own routes, but only as **simple placeholder pages** for now.
- Keep the route structure scalable so full dashboards can be added later without changing the URL design.

## Placeholder routes to keep
- `/manufacturer` -> Manufacturer home coming soon
- `/mentor` -> Mentor home coming soon
- `/supplier` -> Supplier home coming soon
- `/admin` -> Admin home coming soon

## Prioritized TODOs
1. Keep the entrepreneur dashboard as the only interactive role dashboard.
2. Add lightweight role landing pages for the other roles with a clear "coming soon" message.
3. Make sure each role keeps its own route so future dashboards can be added cleanly.
4. Keep auth redirect logic aligned with the role route structure.
5. Update any UI copy that still implies all role dashboards are already built.

## Not in scope for this version
- Full manufacturer dashboard
- Full supplier dashboard
- Full mentor dashboard
- Full admin dashboard
- Advanced role-specific analytics, messaging, or marketplace tooling

## Follow-up backlog for later versions
- Build the entrepreneur AI chat experience
- Expand ideas management
- Add team collaboration tools
- Add marketplace workflows
- Implement the remaining role dashboards when the product scope expands
