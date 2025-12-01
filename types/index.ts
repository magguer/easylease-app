// User & Authentication
export type UserRole = 'manager' | 'owner' | 'tenant';

export interface User {
  id: string;
  _id?: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  owner_id?: string;
  tenant_id?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Listing
export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  propertyType: 'apartment' | 'house' | 'studio' | 'loft' | 'penthouse';
  status: 'active' | 'pending' | 'rented' | 'inactive';
  images: string[];
  amenities?: string[];
  partnerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateListingData {
  title: string;
  description: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  propertyType: string;
  amenities?: string[];
  partnerId: string;
}

// Lead
export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  listingId?: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  source: 'website' | 'referral' | 'direct' | 'other';
  createdAt: string;
  updatedAt: string;
}

export interface UpdateLeadData {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  status?: string;
}

// Partner
export interface Partner {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  address?: string;
  notes?: string;
  status: 'active' | 'inactive';
  listingsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePartnerData {
  name: string;
  email: string;
  phone: string;
  company?: string;
  address?: string;
  notes?: string;
}

// Dashboard
export interface DashboardStats {
  // Manager stats (flattened from API response)
  totalListings?: number;
  activeListings?: number;
  totalLeads?: number;
  newLeads?: number;
  totalOwners?: number;
  totalTenants?: number;
  activeTenants?: number;
  tenantsEndingSoon?: number;

  // Nested structure (API response)
  stats?: {
    listings?: {
      total: number;
      active: number;
    };
    leads?: {
      total: number;
      new: number;
    };
    owners?: {
      total: number;
      active: number;
    };
    tenants?: {
      total: number;
      active: number;
      ending_soon: number;
    };
    income?: {
      monthly: number;
    };
    // Tenant specific
    tenant?: any;
    property?: any;
    nextPayment?: any;
  };
  recentLeads?: any[];
  recentListings?: any[];
  recentTenants?: any[];
  tenantData?: any;
}

// Tenant
export interface Tenant {
  id: string;
  _id?: string;
  name: string;
  email: string;
  phone: string;
  listing_id: string | Listing;
  lease_start: string;
  lease_end: string;
  weekly_rent: number;
  bond_paid: number;
  payment_method: 'bank_transfer' | 'cash' | 'card' | 'other';
  status: 'active' | 'ending_soon' | 'ended' | 'terminated';
  emergency_contact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  documents?: {
    id_document?: string;
    proof_of_income?: string;
    references?: string[];
    lease_agreement?: string;
    other?: string[];
  };
  notes?: string;
  converted_from_lead_id?: string;
  move_in_inspection?: {
    date: string;
    photos: string[];
    notes: string;
    condition_report: string;
  };
  lease_duration_weeks?: number;
  days_remaining?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTenantData {
  name: string;
  email: string;
  phone: string;
  listing_id: string;
  lease_start: string;
  lease_end: string;
  weekly_rent: number;
  bond_paid: number;
  payment_method?: string;
  emergency_contact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  notes?: string;
}

// API Response
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
