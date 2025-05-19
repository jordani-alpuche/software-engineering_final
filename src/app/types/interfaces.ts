// types/interfaces.ts
import { ReactNode } from 'react';

export interface BlackListVisitorsProps {
  searchParams: {
    vid: string ; 
    c: string ;
  };
}

export interface WrapperProps {
  children: ReactNode;
}

export interface ExtendedVisitor extends Visitor {
  reason: string;
  visitor_entry_logs: VisitorEntryLog[];
  visitors_schedule: Omit<ScheduleData, 'visitiors' | 'visitor_entry_logs'>;
}


export interface VisitorData {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface BlacklistVisitorData {
  visitor_id: number;
  createdAt: Date;
  updatedAt: Date;
  visitiors: VisitorData;
}
export interface BlacklistVisitors {
  blacklistData: BlacklistVisitorData[];
  visitorData?: VisitorData;
  type?: string;
  visitorsData?: VisitorData[];
  userid?: number;
  visitorId?: number;
  visitorName?: string;
  visitorEmail?: string;
  visitorPhone?: string;
  visitorAddress?: string;
  visitorCreatedAt?: Date;
  visitorUpdatedAt?: Date;
}

export interface Visitor {
  id: number;
  visitor_first_name: string;
  visitor_last_name: string;
  visitor_id_type: string;
  visitor_id_number: string;
  created_date: string;
  visitor_schedule_id: number;
}

export interface VisitorEntryLog {
  id: number;
  security_id: number;
  created_at: string; // or Date if already parsed
  updated_at: string;
  visitor_schedule_id: number;
  entry_type: string | null;
  visitor_id: number;
  entry_time: string;
  exit_time: string;
}

export interface ScheduleData {
  id: number;
  resident_id: number;
  visitor_phone: string;
  visitor_email: string;
  status: string;
  created_at: string;
  visitor_type: string;
  license_plate: string;
  visitor_entry_date: string;
  visitor_exit_date: string;
  visitor_qrcode: string;
  visitor_qrcode_url: string | null;
  visitor_qrcode_path: string | null;
  comments: string;
  sg_type: number;
  visitiors: Visitor[]; // double check spelling — possibly a typo?
  visitor_entry_logs: VisitorEntryLog[];
}
