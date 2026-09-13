import { FormEvent, useEffect, useMemo, useState } from "react";
import { KeyRound, Loader2, ShieldCheck, UserPlus, UserX } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ListPagination } from "@/components/ListPagination";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

type StaffRole = "owner" | "admin" | "cashier";
interface StaffAccessRow {
  id: string;
  email: string;
  role: StaffRole;
  active: boolean;
  createdAt: string;
}

const roleLabel: Record<StaffRole, string> = {
  owner: "Propietario",
  admin: "Administrador",
  cashier: "Cajero",
};

export default function StaffAccess() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [rows, setRows] = useState<StaffAccessRow[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<StaffRole>("cashier");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingId, setChangingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const load = async () => {
    setRows(await api<StaffAccessRow[]>("/staff-access"));
  };

  useEffect(() => {
    load()
      .catch((reason) =>
        toast({
          title: "No se pudo cargar el personal",
          description: reason instanceof Error ? reason.message : undefined,
          variant: "destructive",
        }),
      )
      .finally(() => setLoading(false));
  }, [toast]);

  const visibleRows = useMemo(
    () => rows.slice((page - 1) * pageSize, page * pageSize),
    [rows, page],
  );
  useEffect(() => {
    if ((page - 1) * pageSize >= rows.length)
      setPage(Math.max(1, Math.ceil(rows.length / pageSize)));
  }, [page, rows.length]);

  const add = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await api("/staff-access", {
        method: "POST",
        body: JSON.stringify({ email, role }),
      });
      await load();
      setEmail("");
      setPage(1);
      toast({
        title: "Acceso autorizado",
        description: "Podrá entrar con Google o con su contraseña.",
      });
    } catch (reason) {
      toast({
        title: "No se pudo autorizar",
        description: reason instanceof Error ? reason.message : undefined,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const revoke = async (row: StaffAccessRow) => {
    setRemovingId(row.id);
    try {
      await api(`/staff-access/${row.id}`, { method: "DELETE" });
      setRows((current) => current.filter((item) => item.id !== row.id));
      toast({ title: "Acceso retirado", description: row.email });
    } catch (reason) {
      toast({
        title: "No se pudo retirar",
        description: reason instanceof Error ? reason.message : undefined,
        variant: "destructive",
      });
    } finally {
      setRemovingId(null);
    }
  };

  const changeRole = async (row: StaffAccessRow, nextRole: StaffRole) => {
    if (nextRole === row.role) return;
    setChangingId(row.id);
    try {
      const updated = await api<StaffAccessRow>(`/staff-access/${row.id}`, {
        method: "PUT",
        body: JSON.stringify({ role: nextRole }),
      });
      setRows((current) =>
        current.map((item) => (item.id === row.id ? updated : item)),
      );
      toast({
        title: "Rol actualizado",
        description: `${row.email} ahora es ${roleLabel[nextRole].toLowerCase()}.`,
      });
    } catch (reason) {
      toast({
        title: "No se pudo cambiar el rol",
        description: reason instanceof Error ? reason.message : undefined,
        variant: "destructive",
      });
    } finally {
      setChangingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary/60">
          Seguridad del equipo
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold">
          Personal autorizado
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Google verifica quién es la persona. Esta lista decide quién puede
          entrar y qué puede hacer.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-sans text-lg">
            <UserPlus className="h-5 w-5 text-primary" />
            Autorizar una cuenta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={add}
            className="grid gap-4 sm:grid-cols-[1fr_210px_auto] sm:items-end"
          >
            <div className="space-y-2">
              <Label htmlFor="staff-email">Correo de Google</Label>
              <Input
                id="staff-email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="persona@gmail.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Rol</Label>
              <Select
                value={role}
                onValueChange={(value) => setRole(value as StaffRole)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cashier">Cajero</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="owner">Propietario</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <KeyRound className="mr-2 h-4 w-4" />
              )}
              Autorizar
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-sans text-lg">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Lista de acceso
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-3 p-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Correo</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody key={page} className="list-enter">
                    {visibleRows.map((row) => {
                      const self = row.email === user?.email.toLowerCase();
                      return (
                        <TableRow key={row.id}>
                          <TableCell className="font-medium">
                            {row.email}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={row.role}
                              disabled={self || changingId === row.id}
                              onValueChange={(value) =>
                                changeRole(row, value as StaffRole)
                              }
                            >
                              <SelectTrigger className="h-9 w-40">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="cashier">Cajero</SelectItem>
                                <SelectItem value="admin">
                                  Administrador
                                </SelectItem>
                                <SelectItem value="owner">
                                  Propietario
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <span className="text-primary">Autorizado</span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              disabled={self || removingId === row.id}
                              onClick={() => revoke(row)}
                            >
                              {removingId === row.id ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <UserX className="mr-2 h-4 w-4" />
                              )}
                              Retirar
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              <div className="px-4 pb-4">
                <ListPagination
                  page={page}
                  total={rows.length}
                  onPageChange={setPage}
                  itemLabel="cuentas"
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
