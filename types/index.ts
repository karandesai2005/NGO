export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'Volunteer' | 'Admin' | 'Parent';
  createdAt: string;
}

export interface ChatMessage {
  _id: string;
  text: string;
  createdAt: Date;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
}

export interface Event {
  id: string;
  date: string;
  title: string;
  teacher: string;
  time: string;
  subject: string;
}

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