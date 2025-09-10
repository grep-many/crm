import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import api from "@/api/axios";

export default function DeleteCustomerModal({ customerId, triggerElement, onConfirm }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customer, setCustomer] = useState(null);
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    if (!open || !customerId) return;
    let ignore = false;
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/customers/${customerId}`);
        if (!ignore) {
          setCustomer(res.data);
          setLeads(res.data?.leads || []);
        }
      } catch (e) {
        // noop
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchDetails();
    return () => { ignore = true; };
  }, [open, customerId]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{triggerElement}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl w-full p-6 backdrop-blur-sm" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Are you sure you want to delete this customer?</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading details…</div>
          ) : (
            <>
              {customer && (
                <Card className="p-4">
                  <div className="text-sm">
                    <div className="font-medium">{customer.name}</div>
                    <div className="text-muted-foreground">{customer.email} · {customer.phone} · {customer.company}</div>
                    {(() => { try { const u = JSON.parse(localStorage.getItem('user')); if (u?.role === 'admin') return (<div className="text-xs text-muted-foreground mt-1">Owner: {customer.ownerId?.name || '-'} ({customer.ownerId?.email || ''})</div>); } catch(e){} return null; })()}
                  </div>
                </Card>
              )}
              <Card className="p-4">
                <div className="text-sm font-medium mb-2">Leads ({leads.length})</div>
                <div className="max-h-56 overflow-auto space-y-2">
                  {leads.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No leads for this customer.</div>
                  ) : (
                    leads.map((lead) => (
                      <div key={lead._id || lead.id} className="flex items-center justify-between text-sm border-b pb-2 last:border-b-0">
                        <div className="truncate">
                          <div className="font-medium truncate">{lead.title}</div>
                          <div className="text-muted-foreground truncate">{lead.description}</div>
                        </div>
                        <div className="shrink-0 text-xs text-muted-foreground ml-4">{lead.status} · {new Date(lead.createdAt).toLocaleDateString()}</div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
              <div className="text-xs text-muted-foreground">This action cannot be undone.</div>
            </>
          )}
        </div>

        <DialogFooter className="mt-4 flex gap-2">
          <Button variant="outline" className="w-1/2" onClick={() => setOpen(false)}>Abort</Button>
          <Button
            variant="destructive"
            className="w-1/2"
            onClick={() => {
              onConfirm?.();
              setOpen(false);
            }}
          >
            Confirm Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


