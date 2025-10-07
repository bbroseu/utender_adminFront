import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState } from '../index';
import api from '../../lib/api';

// Types
export interface EmailState {
  sending: boolean;
  error: string | null;
  lastSentEmail: {
    success: boolean;
    recipientCount: number;
    message: string;
  } | null;
}

export interface SendEmailToMemberRequest {
  memberId: number;
  subject: string;
  message: string;
}

export interface SendEmailToActiveRequest {
  subject: string;
  message: string;
}

export interface EmailResponse {
  success: boolean;
  message: string;
  data?: {
    totalRecipients: number;
    successful: number;
    failed: number;
  };
}

// Initial state
const initialState: EmailState = {
  sending: false,
  error: null,
  lastSentEmail: null,
};

// Async thunks
export const sendEmailToMember = createAsyncThunk(
  'email/sendToMember',
  async ({ memberId, subject, message }: SendEmailToMemberRequest) => {
    const response = await api.post(`/emails/send-to-member/${memberId}`, {
      subject,
      message,
    });
    return response.data;
  }
);

export const sendEmailToActiveMembers = createAsyncThunk(
  'email/sendToActiveMembers',
  async ({ subject, message }: SendEmailToActiveRequest) => {
    const response = await api.post('/emails/send-to-active-members', {
      subject,
      message,
    });
    return response.data;
  }
);

// Slice
const emailSlice = createSlice({
  name: 'email',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearLastSentEmail: (state) => {
      state.lastSentEmail = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Send email to member
      .addCase(sendEmailToMember.pending, (state) => {
        state.sending = true;
        state.error = null;
      })
      .addCase(sendEmailToMember.fulfilled, (state, action) => {
        state.sending = false;
        state.error = null;
        state.lastSentEmail = {
          success: action.payload.success,
          recipientCount: 1,
          message: action.payload.message,
        };
      })
      .addCase(sendEmailToMember.rejected, (state, action) => {
        state.sending = false;
        state.error = action.error.message || 'Failed to send email to member';
        state.lastSentEmail = null;
      })
      // Send email to active members
      .addCase(sendEmailToActiveMembers.pending, (state) => {
        state.sending = true;
        state.error = null;
      })
      .addCase(sendEmailToActiveMembers.fulfilled, (state, action) => {
        state.sending = false;
        state.error = null;
        state.lastSentEmail = {
          success: action.payload.success,
          recipientCount: action.payload.data?.totalRecipients || 0,
          message: action.payload.message,
        };
      })
      .addCase(sendEmailToActiveMembers.rejected, (state, action) => {
        state.sending = false;
        state.error = action.error.message || 'Failed to send email to active members';
        state.lastSentEmail = null;
      });
  },
});

// Actions
export const { clearError, clearLastSentEmail } = emailSlice.actions;

// Selectors
export const selectEmailSending = (state: RootState) => state.email.sending;
export const selectEmailError = (state: RootState) => state.email.error;
export const selectLastSentEmail = (state: RootState) => state.email.lastSentEmail;

export default emailSlice.reducer;