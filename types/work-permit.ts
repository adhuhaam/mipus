export interface WorkPermitRecord {
  workPermitNumber: string;
  workPermitStateName: string | null;
  occupationName: string | null;
  isValid: string | null;
  fullName: string | null;
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  passportNumber: string | null;
  isoAlpha3CountryCode: string | null;
  nationality: string | null;
  contactNumber: string | null;
  photoUrl: string | null;
  verifyUrl: string | null;
  workPermitIssuedDate: string | null;
  workPermitExpiry: string | null;
  employerName: string | null;
  employerNumber: string | null;
  employerContactNumber: string | null;
}

export interface WorkPermitLookupResult {
  record: WorkPermitRecord;
  photoIds: { photoId: string; serviceId: string } | null;
}

export interface ApiErrorResponse {
  errors: string[];
}
