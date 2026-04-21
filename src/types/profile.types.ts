export interface EmployeeProfile {
  id: string;
  email: string;
  name: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  role: string | null;
  imageUrl: string | null;
  dob: string | null;
  gender: string | null;
  storeName: string | null;
  createdAt: string | null;
}

export interface EditForm {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phone: string;
  imageUrl: string;
  gender: string;
  dob: string;
  storeName: string;
}
