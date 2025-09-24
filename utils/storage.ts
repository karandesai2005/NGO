import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, ChatMessage, Event, Parent, VolunteerHours } from '@/types';

// Keys for AsyncStorage
const STORAGE_KEYS = {
  USERS: 'users',
  CURRENT_USER: 'currentUser',
  MESSAGES: 'messages',
  EVENTS: 'events',
  PARENTS: 'parents',
  VOLUNTEER_HOURS: 'volunteerHours',
};

// Default data
const defaultUsers: User[] = [
  {
    id: '1',
    email: 'admin@akshar.org',
    password: 'admin123',
    name: 'Admin User',
    role: 'Admin',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    email: 'volunteer@akshar.org',
    password: 'volunteer123',
    name: 'Volunteer User',
    role: 'Volunteer',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    email: 'parent@akshar.org',
    password: 'parent123',
    name: 'Parent User',
    role: 'Parent',
    createdAt: new Date().toISOString(),
  },
];

const defaultMessages: ChatMessage[] = [
  {
    _id: '1',
    text: 'Welcome to the volunteer group chat!',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    user: {
      _id: '1',
      name: 'Nagesh Sir',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
    },
  },
  {
    _id: '2',
    text: 'Thank you for all your hard work this week!',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    user: {
      _id: '1',
      name: 'Nagesh Sir',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
    },
  },
];

const defaultEvents: Event[] = [
  {
    id: '1',
    date: '2025-01-26',
    title: 'English Class',
    teacher: 'Archisha Yadav',
    time: '12:00 PM',
    subject: 'English',
  },
  {
    id: '2',
    date: '2025-01-27',
    title: 'Math Class',
    teacher: 'Rajesh Kumar',
    time: '10:00 AM',
    subject: 'Mathematics',
  },
  {
    id: '3',
    date: '2025-01-28',
    title: 'Science Workshop',
    teacher: 'Priya Sharma',
    time: '2:00 PM',
    subject: 'Science',
  },
];

const defaultParents: Parent[] = [
  {
    id: '1',
    name: 'Ramesh Gupta',
    phone: '+91 9876543210',
    email: 'ramesh@example.com',
    hasConsent: true,
    children: ['Amit Gupta', 'Sunita Gupta'],
  },
  {
    id: '2',
    name: 'Sunita Devi',
    phone: '+91 9876543211',
    email: 'sunita@example.com',
    hasConsent: true,
    children: ['Rajesh Devi'],
  },
];

const defaultVolunteerHours: VolunteerHours = {
  volunteered: 70,
  remaining: 50,
  total: 120,
};

// Storage functions
export const initializeDefaultData = async () => {
  try {
    const users = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
    if (!users) {
      await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
    }

    const messages = await AsyncStorage.getItem(STORAGE_KEYS.MESSAGES);
    if (!messages) {
      await AsyncStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(defaultMessages));
    }

    const events = await AsyncStorage.getItem(STORAGE_KEYS.EVENTS);
    if (!events) {
      await AsyncStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(defaultEvents));
    }

    const parents = await AsyncStorage.getItem(STORAGE_KEYS.PARENTS);
    if (!parents) {
      await AsyncStorage.setItem(STORAGE_KEYS.PARENTS, JSON.stringify(defaultParents));
    }

    const volunteerHours = await AsyncStorage.getItem(STORAGE_KEYS.VOLUNTEER_HOURS);
    if (!volunteerHours) {
      await AsyncStorage.setItem(STORAGE_KEYS.VOLUNTEER_HOURS, JSON.stringify(defaultVolunteerHours));
    }
  } catch (error) {
    console.error('Error initializing default data:', error);
  }
};

// User management
export const getUsers = async (): Promise<User[]> => {
  try {
    const users = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
    return users ? JSON.parse(users) : [];
  } catch (error) {
    console.error('Error getting users:', error);
    return [];
  }
};

export const addUser = async (user: User): Promise<void> => {
  try {
    const users = await getUsers();
    users.push(user);
    await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  } catch (error) {
    console.error('Error adding user:', error);
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const user = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const setCurrentUser = async (user: User | null): Promise<void> => {
  try {
    if (user) {
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  } catch (error) {
    console.error('Error setting current user:', error);
  }
};

// Messages management
export const getMessages = async (): Promise<ChatMessage[]> => {
  try {
    const messages = await AsyncStorage.getItem(STORAGE_KEYS.MESSAGES);
    return messages ? JSON.parse(messages) : [];
  } catch (error) {
    console.error('Error getting messages:', error);
    return [];
  }
};

export const addMessage = async (message: ChatMessage): Promise<void> => {
  try {
    const messages = await getMessages();
    messages.unshift(message);
    await AsyncStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  } catch (error) {
    console.error('Error adding message:', error);
  }
};

// Events management
export const getEvents = async (): Promise<Event[]> => {
  try {
    const events = await AsyncStorage.getItem(STORAGE_KEYS.EVENTS);
    return events ? JSON.parse(events) : [];
  } catch (error) {
    console.error('Error getting events:', error);
    return [];
  }
};

export const addEvent = async (event: Event): Promise<void> => {
  try {
    const events = await getEvents();
    events.push(event);
    await AsyncStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  } catch (error) {
    console.error('Error adding event:', error);
  }
};

// Parents management
export const getParents = async (): Promise<Parent[]> => {
  try {
    const parents = await AsyncStorage.getItem(STORAGE_KEYS.PARENTS);
    return parents ? JSON.parse(parents) : [];
  } catch (error) {
    console.error('Error getting parents:', error);
    return [];
  }
};

// Volunteer hours management
export const getVolunteerHours = async (): Promise<VolunteerHours> => {
  try {
    const hours = await AsyncStorage.getItem(STORAGE_KEYS.VOLUNTEER_HOURS);
    return hours ? JSON.parse(hours) : defaultVolunteerHours;
  } catch (error) {
    console.error('Error getting volunteer hours:', error);
    return defaultVolunteerHours;
  }
};