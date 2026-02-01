
export interface FormData {
  yeshivaName: string;
  managerName: string;
  phoneNumber: string; // Added phone number field
  campaignDuration: string;
  campaignGoal: string;
  averageStudents: string;
  usesFieldDevices: 'yes' | 'no' | '';
  deviceCount: string;
  deviceType: string;
  deviceProvider: string;
  clearingCompany: string;
  specialRemarks: string;
}

export interface Submission extends FormData {
  id: string;
  timestamp: string;
  calculatedPrice: string;
}

export enum Step {
  Welcome = 0,
  InitialDetails = 1,
  CampaignDetails = 2,
  ClearingDetails = 3,
  SpecialRemarks = 4,
  PriceSummary = 5,
  Success = 6,
  Admin = 7
}
