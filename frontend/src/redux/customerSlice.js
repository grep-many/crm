import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

// ✅ Fetch customers
export const fetchCustomers = createAsyncThunk(
  "customers/fetchCustomers",
  async ({ search = "" }, thunkAPI) => {
    try {
      const response = await api.get("/customers", { params: { search } });
      return response.data; // array of customers
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.error || "Failed to fetch customers");
    }
  }
);

// ✅ Add customer
export const addCustomer = createAsyncThunk(
  "customers/addCustomer",
  async ({ customerData, socket }, thunkAPI) => {
    try {
      const response = await api.post("/customers", customerData);
      const customer = response.data;

      // If admin, fetch populated owner info for the newly created customer
      try {
        const state = thunkAPI.getState();
        const role = state?.auth?.user?.role;
        if (role === 'admin' && customer?._id) {
          const populated = await api.get(`/customers/${customer._id}`);
          // overwrite with populated
          return populated.data;
        }
      } catch {}

      // No client emit; server broadcasts authoritative events

      return customer;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.error || "Failed to add customer");
    }
  }
);

// ✅ Update customer
export const updateCustomer = createAsyncThunk(
  "customers/updateCustomer",
  async ({ id, customerData, socket }, thunkAPI) => {
    try {
      const response = await api.put(`/customers/${id}`, customerData);
      const updated = response.data;

      // If admin, fetch populated owner info for the updated customer
      try {
        const state = thunkAPI.getState();
        const role = state?.auth?.user?.role;
        if (role === 'admin' && updated?._id) {
          const populated = await api.get(`/customers/${updated._id}`);
          // No client emit; server broadcasts authoritative events
          return populated.data;
        }
      } catch {}

      // No client emit; server broadcasts authoritative events

      return updated;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.error || "Failed to update customer");
    }
  }
);

// ✅ Delete customer
export const deleteCustomer = createAsyncThunk(
  "customers/deleteCustomer",
  async ({ id, socket }, thunkAPI) => {
    try {
      await api.delete(`/customers/${id}`);

      // No client emit; server broadcasts authoritative events

      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.error || "Failed to delete customer");
    }
  }
);

// ✅ Slice
const customerSlice = createSlice({
  name: "customers",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {
    // Socket event handlers
    socketAddCustomer: (state, action) => {
      const idx = state.list.findIndex((c) => (c._id || c.id) === (action.payload._id || action.payload.id));
      if (idx >= 0) {
        state.list[idx] = action.payload;
      } else {
        state.list.push(action.payload);
      }
    },
    socketUpdateCustomer: (state, action) => {
      const idx = state.list.findIndex((c) => (c._id || c.id) === (action.payload._id || action.payload.id));
      if (idx >= 0) state.list[idx] = action.payload;
    },
    socketDeleteCustomer: (state, action) => {
      state.list = state.list.filter((c) => (c._id || c.id) !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchCustomers.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload || [];
      })
      .addCase(fetchCustomers.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      // Add (no global loading toggle to avoid page-wide re-render)
      .addCase(addCustomer.pending, (state) => { state.error = null; })
      .addCase(addCustomer.fulfilled, (state, action) => {
        const payload = action.payload;
        const idx = state.list.findIndex((c) => (c._id || c.id) === (payload._id || payload.id));
        if (idx >= 0) {
          state.list[idx] = payload;
        } else {
          state.list.push(payload);
        }
      })
      .addCase(addCustomer.rejected, (state, action) => { state.error = action.payload; })

      // Update (no global loading toggle)
      .addCase(updateCustomer.pending, (state) => { state.error = null; })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        const idx = state.list.findIndex((c) => c._id === action.payload._id);
        if (idx >= 0) state.list[idx] = action.payload;
      })
      .addCase(updateCustomer.rejected, (state, action) => { state.error = action.payload; })

      // Delete (no global loading toggle)
      .addCase(deleteCustomer.pending, (state) => { state.error = null; })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.list = state.list.filter((c) => c._id !== action.payload);
      })
      .addCase(deleteCustomer.rejected, (state, action) => { state.error = action.payload; });
  },
});

export const { socketAddCustomer, socketUpdateCustomer, socketDeleteCustomer } = customerSlice.actions;
export default customerSlice.reducer;
