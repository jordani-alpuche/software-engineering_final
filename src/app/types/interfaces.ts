// types/interfaces.ts
export interface BlackListVisitorsProps {
  searchParams: {
    vid?: string;
    c?: string;
  };
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
