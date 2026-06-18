import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/persona/$personaId")({
  component: () => <Outlet />,
});
