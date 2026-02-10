import * as React from "react";
import { DataTable, type Column } from "@/shared/components/ui/data-table";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { usersService, type User, type SyncStats } from "@/shared/lib/api/services";
import { RefreshCw, MoreHorizontal, Users, UserCheck, UserX, Clock } from "lucide-react";
import { toast } from "sonner";

export function UsersPage() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [stats, setStats] = React.useState<SyncStats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [syncing, setSyncing] = React.useState(false);

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [usersResponse, statsResponse] = await Promise.all([
        usersService.getUsers({ per_page: 1000 }),
        usersService.getSyncStats(),
      ]);
      setUsers(usersResponse.data);
      setStats(statsResponse);
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSync = async (full = false) => {
    try {
      setSyncing(true);
      const result = await usersService.triggerSync({ full });
      toast.success(
        `Sincronizado: ${result.created} nuevos, ${result.updated} actualizados, ${result.merged} fusionados`
      );
      loadData();
    } catch (error) {
      console.error("Error syncing:", error);
      toast.error("Error al sincronizar con Planning Center");
    } finally {
      setSyncing(false);
    }
  };

  const handleAssignRole = async (userId: number, role: string) => {
    try {
      await usersService.assignRole(userId, role);
      toast.success("Rol asignado correctamente");
      loadData();
    } catch (error) {
      console.error("Error assigning role:", error);
      toast.error("Error al asignar rol");
    }
  };

  const columns: Column<User>[] = [
    {
      key: "name",
      header: "Nombre",
      sortable: true,
      render: (_, row) => (
        <div>
          <div className="font-medium">{row.name}</div>
          <div className="text-sm text-muted-foreground">{row.email}</div>
        </div>
      ),
    },
    {
      key: "profile.phone",
      header: "Teléfono",
      sortable: true,
      render: (_, row) => row.profile?.phone || "-",
    },
    {
      key: "profile.status",
      header: "Estado",
      sortable: true,
      render: (_, row) => {
        const status = row.profile?.status || "pending";
        const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
          active: "default",
          inactive: "destructive",
          pending: "secondary",
        };
        return (
          <Badge variant={variants[status] || "outline"}>
            {status === "active" ? "Activo" : status === "inactive" ? "Inactivo" : "Pendiente"}
          </Badge>
        );
      },
    },
    {
      key: "roles",
      header: "Roles",
      render: (_, row) => (
        <div className="flex gap-1 flex-wrap">
          {row.roles?.map((role) => (
            <Badge key={role.id} variant="outline">
              {role.display_name}
            </Badge>
          )) || <span className="text-muted-foreground">Sin rol</span>}
        </div>
      ),
    },
    {
      key: "profile.ministerio",
      header: "Ministerio",
      sortable: true,
      render: (_, row) => row.profile?.ministerio || "-",
    },
    {
      key: "source",
      header: "Origen",
      sortable: true,
      render: (_, row) => (
        <Badge variant={row.source === "planning_center" ? "default" : "secondary"}>
          {row.source === "planning_center" ? "Planning Center" : "Manual"}
        </Badge>
      ),
    },
    {
      key: "profile.last_synced_at",
      header: "Última Sincronización",
      sortable: true,
      render: (_, row) => {
        if (!row.profile?.last_synced_at) return "-";
        return new Date(row.profile.last_synced_at).toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      },
    },
    {
      key: "actions",
      header: "",
      className: "w-[50px]",
      render: (_, row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleAssignRole(row.id, "administrador")}>
              Asignar Admin
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAssignRole(row.id, "lider")}>
              Asignar Líder
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAssignRole(row.id, "usuario")}>
              Asignar Usuario
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Usuarios</h1>
          <p className="text-muted-foreground">
            Gestión de usuarios sincronizados desde Planning Center
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleSync(false)} disabled={syncing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
            Sync Incremental
          </Button>
          <Button onClick={() => handleSync(true)} disabled={syncing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
            Sync Completo
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_users}</div>
              <p className="text-xs text-muted-foreground">
                {stats.planning_center_linked} de Planning Center
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Activos</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active_users}</div>
              <p className="text-xs text-muted-foreground">
                {stats.pending_users} pendientes
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactivos</CardTitle>
              <UserX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inactive_users}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sincronizados (24h)</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recently_synced}</div>
              <p className="text-xs text-muted-foreground">
                {stats.needs_sync} necesitan sync
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Data Table */}
      <Card>
        <CardContent className="pt-6">
          <DataTable
            data={users}
            columns={columns}
            loading={loading}
            searchPlaceholder="Buscar por nombre, email, ministerio..."
            searchableColumns={["name", "email", "profile.ministerio"]}
            pageSize={25}
            emptyMessage="No se encontraron usuarios"
          />
        </CardContent>
      </Card>
    </div>
  );
}
