import api from '../lib/api';

export interface Subscriber {
  id: number;
  username: string;
  email: string;
  register_date: number;
  expire_date: number;
  status: number;
  active: number;
  group?: number;
  // New backend fields
  name?: string;
  phone_number?: string;
  company?: string;
  fiscal_number?: string;
  contact?: string;
  package?: string;
  // Computed fields
  register_date_formatted?: Date;
  expire_date_formatted?: Date;
  is_expired?: boolean;
  is_expiring_soon?: boolean;
  account_status?: string;
}

export interface SubscriberCreateData {
  username: string;
  password: string;
  email: string;
  register_date?: number;
  expire_date?: number;
  status?: number;
  active?: number;
  group?: number;
  // New fields
  name?: string;
  phone_number?: string;
  company?: string;
  fiscal_number?: string;
  contact?: string;
  package?: string;
}

export interface SubscriberUpdateData extends Partial<SubscriberCreateData> {
  id: number;
}

class SubscribersService {
  private readonly baseEndpoint = '/members';

  async getAll(): Promise<Subscriber[]> {
    try {
      const response = await api.get(this.baseEndpoint);
      console.log('Subscribers API Response:', response.data);
      
      // Handle different response formats
      if (response.data && response.data.success) {
        return Array.isArray(response.data.data) ? response.data.data : [];
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else {
        console.warn('Unexpected response format:', response.data);
        return [];
      }
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      throw error;
    }
  }

  async getById(id: number): Promise<Subscriber> {
    try {
      const response = await api.get(`${this.baseEndpoint}/${id}`);
      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      console.error(`Error fetching subscriber ${id}:`, error);
      throw error;
    }
  }

  async create(subscriberData: SubscriberCreateData): Promise<Subscriber> {
    try {
      // Set defaults and clean data
      const dataToSend: any = {
        username: subscriberData.username.trim(),
        password: subscriberData.password,
        email: subscriberData.email.trim().toLowerCase(),
        register_date: subscriberData.register_date || Math.floor(Date.now() / 1000),
        expire_date: subscriberData.expire_date || Math.floor(Date.now() / 1000) + (365 * 24 * 3600),
        status: subscriberData.status !== undefined ? subscriberData.status : 1,
        active: subscriberData.active !== undefined ? subscriberData.active : 1,
        group: subscriberData.group || null
      };

      // Add new fields if provided
      if (subscriberData.name) dataToSend.name = subscriberData.name.trim();
      if (subscriberData.phone_number) dataToSend.phone_number = subscriberData.phone_number.trim();
      if (subscriberData.company) dataToSend.company = subscriberData.company.trim();
      if (subscriberData.fiscal_number) dataToSend.fiscal_number = subscriberData.fiscal_number.trim();
      if (subscriberData.contact) dataToSend.contact = subscriberData.contact.trim();
      if (subscriberData.package) dataToSend.package = subscriberData.package.trim();

      const response = await api.post(this.baseEndpoint, dataToSend);
      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      console.error('Error creating subscriber:', error);
      throw error;
    }
  }

  async update(subscriberData: SubscriberUpdateData): Promise<Subscriber> {
    try {
      const { id, ...updateData } = subscriberData;
      
      // Clean the data
      const dataToSend: any = {};
      if (updateData.username) dataToSend.username = updateData.username.trim();
      if (updateData.password) dataToSend.password = updateData.password;
      if (updateData.email) dataToSend.email = updateData.email.trim().toLowerCase();
      if (updateData.register_date !== undefined) dataToSend.register_date = updateData.register_date;
      if (updateData.expire_date !== undefined) dataToSend.expire_date = updateData.expire_date;
      if (updateData.status !== undefined) dataToSend.status = updateData.status;
      if (updateData.active !== undefined) dataToSend.active = updateData.active;
      if (updateData.group !== undefined) dataToSend.group = updateData.group;
      
      // Add new fields if provided
      if (updateData.name !== undefined) dataToSend.name = updateData.name ? updateData.name.trim() : '';
      if (updateData.phone_number !== undefined) dataToSend.phone_number = updateData.phone_number ? updateData.phone_number.trim() : '';
      if (updateData.company !== undefined) dataToSend.company = updateData.company ? updateData.company.trim() : '';
      if (updateData.fiscal_number !== undefined) dataToSend.fiscal_number = updateData.fiscal_number ? updateData.fiscal_number.trim() : '';
      if (updateData.contact !== undefined) dataToSend.contact = updateData.contact ? updateData.contact.trim() : '';
      if (updateData.package !== undefined) dataToSend.package = updateData.package ? updateData.package.trim() : '';

      const response = await api.put(`${this.baseEndpoint}/${id}`, dataToSend);
      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      console.error('Error updating subscriber:', error);
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await api.delete(`${this.baseEndpoint}/${id}`);
    } catch (error) {
      console.error('Error deleting subscriber:', error);
      throw error;
    }
  }

  // Helper method to extend expiry date
  async extendExpiry(id: number, newExpiryDate: string): Promise<Subscriber> {
    try {
      const expiryTimestamp = Math.floor(new Date(newExpiryDate).getTime() / 1000);
      return await this.update({ 
        id, 
        expire_date: expiryTimestamp 
      });
    } catch (error) {
      console.error('Error extending subscriber expiry:', error);
      throw error;
    }
  }

  // Helper method to format dates
  formatDate(timestamp: number): string {
    if (!timestamp) return '';
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    return new Date(timestamp * 1000).toLocaleDateString(undefined, options);
  }

  // Helper method to check if subscriber is expired
  isExpired(subscriber: Subscriber): boolean {
    if (!subscriber.expire_date) return false;
    return subscriber.expire_date < Math.floor(Date.now() / 1000);
  }

  // Helper method to get account status
  getAccountStatus(subscriber: Subscriber): string {
    if (subscriber.active !== 1) return 'Inactive';
    if (this.isExpired(subscriber)) return 'Expired';
    
    const daysUntilExpiry = this.getDaysUntilExpiry(subscriber);
    if (daysUntilExpiry <= 7 && daysUntilExpiry >= 0) return 'Expiring Soon';
    
    if (subscriber.status !== 1) return 'Invalid Status';
    return 'Active';
  }

  // Helper method to get days until expiry
  getDaysUntilExpiry(subscriber: Subscriber): number {
    if (!subscriber.expire_date) return 0;
    const currentTime = Math.floor(Date.now() / 1000);
    const daysInSeconds = (subscriber.expire_date - currentTime) / (24 * 3600);
    return Math.ceil(daysInSeconds);
  }
}

export default new SubscribersService();