// src/hooks/useLeads.js
import { useDispatch, useSelector } from "react-redux";
import {
  fetchLeads,
  addLead,
  updateLead,
  deleteLead,
  socketAddLead,
  socketUpdateLead,
  socketDeleteLead,
} from "../redux/leadSlice";
import { useEffect, useCallback } from "react";
import { getSocket } from "../api/socket";
import { toast } from "sonner";

export const useLeads = (customerId = null, socket = null) => {
  const dispatch = useDispatch();

  // Normalize: make sure customerId is null instead of undefined
  const safeCustomerId = customerId ?? null;

  // Pick correct leads slice depending on scope
  const leads = useSelector((state) =>
    safeCustomerId ? state.leads.byCustomer[safeCustomerId] || [] : state.leads.all || []
  );
  const { loading, error } = useSelector((state) => state.leads);

  // Attach socket listeners
  useEffect(() => {
    const s = socket || getSocket();
    if (!s) return;

    const handleCreated = (data) => {
      if (!safeCustomerId || (data.customerId?.toString && data.customerId.toString()) === safeCustomerId.toString()) {
        dispatch(socketAddLead({ customerId: data.customerId, lead: data }));
        toast.dismiss(`leadCreated-${data._id}`);
        toast.success("Lead created", { id: `leadCreated-${data._id}` });
      }
    };

    const handleUpdated = (data) => {
      if (!safeCustomerId || (data.customerId?.toString && data.customerId.toString()) === safeCustomerId.toString()) {
        dispatch(socketUpdateLead({ customerId: data.customerId, lead: data }));
        toast.dismiss(`leadUpdated-${data._id}`);
        toast.success("Lead updated", { id: `leadUpdated-${data._id}` });
      }
    };

    const handleDeleted = (data) => {
      if (!safeCustomerId || data.customerId === safeCustomerId) {
        dispatch(socketDeleteLead({ customerId: data.customerId, leadId: data.leadId }));
        toast.dismiss(`leadDeleted-${data.leadId}`);
        toast.success("Lead deleted", { id: `leadDeleted-${data.leadId}` });
      }
    };

    // Avoid duplicate listener registration by clearing first
    s.off("leadCreated", handleCreated);
    s.off("leadUpdated", handleUpdated);
    s.off("leadDeleted", handleDeleted);
    s.on("leadCreated", handleCreated);
    s.on("leadUpdated", handleUpdated);
    s.on("leadDeleted", handleDeleted);

    return () => {
      s.off("leadCreated", handleCreated);
      s.off("leadUpdated", handleUpdated);
      s.off("leadDeleted", handleDeleted);
    };
  }, [socket, dispatch, safeCustomerId]);

  // Fetch leads (global or scoped)
  const fetchAll = useCallback(
    (params = {}) => {
      if (safeCustomerId) {
        return dispatch(fetchLeads({ customerId: safeCustomerId, ...params }));
      } else {
        return dispatch(fetchLeads(params)); // global fetch
      }
    },
    [dispatch, safeCustomerId]
  );

  // CRUD helpers
  const create = useCallback(
    (leadData) => dispatch(addLead({ customerId: safeCustomerId, leadData, socket })),
    [dispatch, safeCustomerId, socket]
  );

  const update = useCallback(
    (leadId, leadData) => dispatch(updateLead({ customerId: safeCustomerId, leadId, leadData, socket })),
    [dispatch, safeCustomerId, socket]
  );

  const remove = useCallback(
    (leadId) => dispatch(deleteLead({ customerId: safeCustomerId, leadId, socket })),
    [dispatch, safeCustomerId, socket]
  );

  return { leads, loading, error, fetchAll, create, update, remove };
};