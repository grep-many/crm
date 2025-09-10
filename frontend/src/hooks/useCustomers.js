// src/hooks/useCustomers.js
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useCallback } from "react";
import {
  fetchCustomers,
  addCustomer,
  updateCustomer,
  deleteCustomer,
  socketAddCustomer,
  socketUpdateCustomer,
  socketDeleteCustomer,
} from "../redux/customerSlice";
import { toast } from "sonner";

import { getSocket } from "../api/socket";

export const useCustomers = (socket = null) => {
  const dispatch = useDispatch();
  const { list, loading, error } = useSelector((state) => state.customers);

  // ----------------- SOCKET LISTENERS -----------------
  useEffect(() => {
    const s = socket || getSocket();
    if (!s) return;

    const currentUserId = (() => {
      try { return JSON.parse(localStorage.getItem('user'))?._id; } catch { return undefined; }
    })();

    const isOwnedByCurrent = (customer) => {
      const owner = customer?.ownerId;
      const ownerId = typeof owner === 'object' ? owner?._id : owner;
      return currentUserId && ownerId && ownerId.toString() === currentUserId.toString();
    };

    const dedupeToast = (key, message) => {
      toast.dismiss(key);
      toast.success(message, { id: key });
    };

    const handleAdd = (data) => {
      dispatch(socketAddCustomer(data));
      if (isOwnedByCurrent(data)) dedupeToast(`customerCreated-${data._id}`, "Customer created");
    };
    const handleUpdate = (data) => {
      dispatch(socketUpdateCustomer(data));
      if (isOwnedByCurrent(data)) dedupeToast(`customerUpdated-${data._id}`, "Customer updated");
    };
    const handleDelete = (id) => {
      dispatch(socketDeleteCustomer(id));
      dedupeToast(`customerDeleted-${id}`, "Customer deleted");
    };

    // Avoid duplicate listener registration by clearing first
    s.off("customerCreated", handleAdd);
    s.off("customerUpdated", handleUpdate);
    s.off("customerDeleted", handleDelete);
    s.on("customerCreated", handleAdd);
    s.on("customerUpdated", handleUpdate);
    s.on("customerDeleted", handleDelete);

    return () => {
      s.off("customerCreated", handleAdd);
      s.off("customerUpdated", handleUpdate);
      s.off("customerDeleted", handleDelete);
    };
  }, [socket, dispatch]);

  // ----------------- ACTION WRAPPERS -----------------
  const fetchAll = useCallback(
    async (params = {}) => {
      try {
        await dispatch(fetchCustomers(params)).unwrap();
        // no toast for fetch success to avoid noise
      } catch (err) {
        console.error("Failed to fetch customers:", err);
        toast.error(typeof err === 'string' ? err : 'Failed to fetch customers');
      }
    },
    [dispatch]
  );

  const create = useCallback(
    async ({ customerData, socket: socketInstance }) => {
      if (!customerData) return;
      try {
        await dispatch(addCustomer({ customerData, socket: socketInstance })).unwrap();
        toast.success("Customer created");
      } catch (err) {
        console.error("Failed to add customer:", err);
        toast.error(typeof err === 'string' ? err : 'Failed to add customer');
      }
    },
    [dispatch]
  );

  const update = useCallback(
    async ({ id, customerData, socket: socketInstance }) => {
      if (!id || !customerData) return;
      try {
        await dispatch(updateCustomer({ id, customerData, socket: socketInstance })).unwrap();
        toast.success("Customer updated");
      } catch (err) {
        console.error("Failed to update customer:", err);
        toast.error(typeof err === 'string' ? err : 'Failed to update customer');
      }
    },
    [dispatch]
  );

  const remove = useCallback(
    async ({ id, socket: socketInstance }) => {
      if (!id) return;
      try {
        await dispatch(deleteCustomer({ id, socket: socketInstance })).unwrap();
        toast.success("Customer deleted");
      } catch (err) {
        console.error("Failed to delete customer:", err);
        toast.error(typeof err === 'string' ? err : 'Failed to delete customer');
      }
    },
    [dispatch]
  );

  return { list, loading, error, fetchAll, create, update, remove };
};
