import data from "./assets/states.json";

type StatesData = {
  [abbreviation: string]: string;
};

export const statesData: StatesData = data;

export const ID = "ID";
export const FULL_NAME = "Full Name";
export const PHONE = "Phone";
export const EMAIL = "Email";
export const AGE = "Age";
export const EXPERIENCE = "Experience";
export const YEARLY_INCOME = "Yearly Income";
export const HAS_CHILDREN = "Has children";
export const LICENSE_STATES = "License states";
export const EXPIRATION_DATE = "Expiration date";
export const LICENSE_NUMBER = "License number";
export const DUPLICATE_WITH = "Duplicate with";

export const YEARLY_INCOME_MAX = 1000000;
export const AGE_MIN = 21;

export const dateFormats = ["YYYY-MM-DD", "MM/DD/YYYY"];
export const hasChildren = ["TRUE", "FALSE"];
