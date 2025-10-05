import { ReactNode, HTMLAttributes, ButtonHTMLAttributes, InputHTMLAttributes } from 'react';

// Component Prop Types

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export interface LabelProps extends HTMLAttributes<HTMLLabelElement> {
  htmlFor?: string;
}

export interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  children: ReactNode;
}

export interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

export interface AlertDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export interface TableProps extends HTMLAttributes<HTMLTableElement> {
  children: ReactNode;
}

export interface ToastProps {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  action?: ReactNode;
}

export interface FormFieldProps {
  name: string;
  control: any;
  render: (field: any) => ReactNode;
}

export interface ChartConfig {
  [key: string]: {
    label: string;
    color?: string;
  };
}

export interface ChartProps {
  data: any[];
  config: ChartConfig;
  className?: string;
}
