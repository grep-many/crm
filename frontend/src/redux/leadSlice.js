import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

// ✅ Fetch leads for a customer
export const fetchLeads = createAsyncThunk(
  "leads/fetchLeads",
  async ({ customerId, status }, thunkAPI) => {
    try {
      const response = await api.get(`/customers/${customerId}/leads`, {
        params: status ? { status } : {},
      });
      return { customerId, leads: response.data };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.error || "Failed to fetch leads");
    }
  }
);

// ✅ Add a lead
export const addLead = createAsyncThunk(
  "leads/addLead",
  async ({ customerId, leadData, socket }, thunkAPI) => {
    try {
      const response = await api.post(`/customers/${customerId}/leads`, leadData);
      const lead = response.data;

      // No client emit; server broadcasts authoritative events

      return { customerId, lead };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.error || "Failed to add lead");
    }
  }
);

// ✅ Update a lead
export const updateLead = createAsyncThunk(
  "leads/updateLead",
  async ({ customerId, leadId, leadData, socket }, thunkAPI) => {
    try {
      const response = await api.put(`/customers/${customerId}/leads/${leadId}`, leadData);
      const updated = response.data;

      // No client emit; server broadcasts authoritative events

      return { customerId, lead: updated };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.error || "Failed to update lead");
    }
  }
);

// ✅ Delete a lead
export const deleteLead = createAsyncThunk(
  "leads/deleteLead",
  async ({ customerId, leadId, socket }, thunkAPI) => {
    try {
      await api.delete(`/customers/${customerId}/leads/${leadId}`);

      // No client emit; server broadcasts authoritative events

      return { customerId, leadId };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.error || "Failed to delete lead");
    }
  }
);

// ✅ Slice
const leadSlice = createSlice({
  name: "leads",
  initialState: {
    byCustomer: {}, // { [customerId]: [leads] }
    loading: false,
    error: null,
  },
  reducers: {
    socketAddLead: (state, action) => {
      const { customerId, lead } = action.payload;
      if (!state.byCustomer[customerId]) state.byCustomer[customerId] = [];
      const idx = state.byCustomer[customerId].findIndex((l) => (l._id || l.id) === (lead._id || lead.id));
      if (idx >= 0) {
        state.byCustomer[customerId][idx] = lead;
      } else {
        // guard against duplicates by filtering all occurrences first
        state.byCustomer[customerId] = state.byCustomer[customerId].filter((l) => (l._id || l.id) !== (lead._id || lead.id));
        state.byCustomer[customerId].unshift(lead); // newest first
      }
    },
    socketUpdateLead: (state, action) => {
      const { customerId, lead } = action.payload;
      const list = state.byCustomer[customerId] || [];
      const idx = list.findIndex((l) => (l._id || l.id) === (lead._id || lead.id));
      if (idx >= 0) list[idx] = lead;
    },
    socketDeleteLead: (state, action) => {
      const { customerId, leadId } = action.payload;
      const list = state.byCustomer[customerId] || [];
      state.byCustomer[customerId] = list.filter((l) => (l._id || l.id) !== leadId);
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchLeads
      .addCase(fetchLeads.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchLeads.fulfilled, (state, action) => {
        state.loading = false;
        state.byCustomer[action.payload.customerId] = action.payload.leads;
      })
      .addCase(fetchLeads.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      // addLead
      .addCase(addLead.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(addLead.fulfilled, (state, action) => {
        state.loading = false;
        const { customerId, lead } = action.payload;
        if (!state.byCustomer[customerId]) state.byCustomer[customerId] = [];
        state.byCustomer[customerId].unshift(lead);
      })
      .addCase(addLead.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      // updateLead
      .addCase(updateLead.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateLead.fulfilled, (state, action) => {
        state.loading = false;
        const { customerId, lead } = action.payload;
        const list = state.byCustomer[customerId] || [];
        const idx = list.findIndex((l) => l._id === lead._id);
        if (idx >= 0) list[idx] = lead;
      })
      .addCase(updateLead.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      // deleteLead
      .addCase(deleteLead.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(deleteLead.fulfilled, (state, action) => {
        state.loading = false;
        const { customerId, leadId } = action.payload;
        const list = state.byCustomer[customerId] || [];
        state.byCustomer[customerId] = list.filter((l) => l._id !== leadId);
      })
      .addCase(deleteLead.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { socketAddLead, socketUpdateLead, socketDeleteLead } = leadSlice.actions;
export default leadSlice.reducer;