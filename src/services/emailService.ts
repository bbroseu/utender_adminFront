import api from '../lib/api';

export interface EmailTemplate {
  value: string;
  label: string;
}

export interface UserOption {
  value: number;
  label: string;
  email: string;
  name: string;
  active: number;
}

export interface RecipientGroup {
  value: string;
  label: string;
}

export interface SendEmailRequest {
  recipients?: string;
  recipientType?: string;
  customEmails?: string[];
  specificUsers?: number[];
  subject: string;
  message: string;
  template?: string;
  templateData?: any;
}

export interface SendEmailResponse {
  success: boolean;
  message: string;
  data?: {
    totalRecipients: number;
    successful: number;
    failed: number;
    recipients: string[] | string;
  };
  error?: string;
}

class EmailService {
  async sendEmail(emailData: SendEmailRequest): Promise<SendEmailResponse> {
    try {
      const response = await api.post('/email/send', emailData);
      return response.data;
    } catch (error: any) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  async getEmailTemplates(): Promise<EmailTemplate[]> {
    try {
      const response = await api.get('/email/templates');
      return response.data.success ? response.data.data : [];
    } catch (error: any) {
      console.error('Error fetching email templates:', error);
      throw error;
    }
  }

  async getUsersForEmail(search?: string, limit: number = 50): Promise<UserOption[]> {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      params.append('limit', limit.toString());

      const response = await api.get(`/email/users?${params.toString()}`);
      return response.data.success ? response.data.data : [];
    } catch (error: any) {
      console.error('Error fetching users for email:', error);
      throw error;
    }
  }

  async getRecipientGroups(): Promise<RecipientGroup[]> {
    try {
      const response = await api.get('/email/recipient-groups');
      return response.data.success ? response.data.data : [];
    } catch (error: any) {
      console.error('Error fetching recipient groups:', error);
      throw error;
    }
  }
}

export default new EmailService();