// types/index.ts
export type User = {
  id: string;
  email: string;
  name: string;
  role: 'Volunteer' | 'Admin' | 'Parent';
  createdAt?: string;
};

// types/index.ts
export type ChatMessage = {
  id: string;
  text: string;
  user_id: string;
  created_at: string;
  user: {
    _id: string;
    name: string;
    role: 'Admin' | 'Volunteer' | 'Parent';
  };
};
export type Event = {
  id: string;
  title: string;
  description?: string;
  date: string; // '2025-04-05'
  time: string; // '2:00 PM'
  location?: string;
  volunteers_needed: number;
  created_by?: string;
  created_at?: string;
};

export type EventSignup = {
  id: string;
  event_id: string;
  volunteer_id: string;
  status: 'confirmed' | 'cancelled';
  signed_up_at: string;
};

export interface Parent {
  id: string;
  name: string;
  phone: string;
  email: string;
  hasConsent: boolean;
  children: string[];
}

export interface VolunteerHours {
  volunteered: number;
  remaining: number;
  total: number;
}