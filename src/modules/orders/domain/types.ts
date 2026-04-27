export type OrderStatus = 'CREATED' | 'PENDING' | 'ACCEPTED' | 'ASSIGNED' | 'PICKED_UP' | 'DELIVERED' | 'CANCELLED';

export interface OrderAttachment {
  type: 'image' | 'document';
  url: string;
  original: string;
  name: string;
  isPDF?: boolean;
  isOffice?: boolean;
}

export interface Order {
  id: string;
  pickupAddress: string;
  deliveryAddress: string;
  pickupLat?: number;
  pickupLng?: number;
  deliveryLat?: number;
  deliveryLng?: number;
  clientName: string;
  clientPhone: string;
  clientNote?: string;
  weight?: number;
  packageType: string;
  description?: string;
  deliveryType: string;
  paymentMethod: string;
  price: number | string;
  requestedAt: string;
  createdAt: string;
  status: OrderStatus;
  vendor?: {
    shopName: string;
  };
  attachments?: OrderAttachment[];
}

export interface OrderRepository {
  getAll(params?: any): Promise<Order[]>;
  getVendorOrders(params?: any): Promise<Order[]>;
  getDriverOrders(params?: any): Promise<Order[]>;
  getById(id: string): Promise<Order>;
  create(order: Partial<Order>): Promise<Order>;
  update(id: string, order: Partial<Order>): Promise<Order>;
  delete(id: string): Promise<void>;
  accept(id: string): Promise<void>;
  pickup(id: string, code: string): Promise<void>;
  deliver(id: string, code: string): Promise<void>;
  getAvailableJobs(params?: any): Promise<Order[]>;
}

export const _ORDER_MODULE = true; // Dummy runtime export to ensure ESM module recognition
