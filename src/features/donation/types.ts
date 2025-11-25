export type CauseType = 'MOTIVE' | 'PROJECT' | 'EVENT';

export type Currency = 'COP' | 'USD';

export interface Cause {
  id: string;
  type: CauseType;
  name: string;
  description: string;
  fixedAmount?: number;
  presets?: number[];
  presetsUSD?: number[];
  allowQuantity?: boolean;
}

export interface CartItem {
  id: string;
  causeId: string;
  causeName: string;
  type: CauseType;
  amount: number;
  quantity: number;
}

export type StepStatus = 'current' | 'completed' | 'disabled' | 'waiting';

export interface Step {
  number: number;
  title: string;
  status: StepStatus;
}
