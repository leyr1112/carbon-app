import {
  VariantColor,
  VariantFullWidth,
  VariantSize,
} from 'components/common/variants';
import { cva } from 'class-variance-authority';

type ButtonVariants = VariantColor & VariantSize & VariantFullWidth;

export const buttonStyles = cva<ButtonVariants>(
  [
    'text-black',
    'font-weight-500',
    'rounded-full px-30',
    'transition duration-300 ease-in-out',
    'disabled:cursor-not-allowed',
    'disabled:opacity-25',
  ],
  {
    variants: {
      variant: {
        black: [
          'bg-black border-2 border-black !text-white',
          'hover:border-grey3 hover:disabled:black',
        ],
        white: [
          'bg-white border-2 border-white',
          'hover:border-grey4 hover:disabled:border-white',
        ],
        secondary: [
          'bg-silver border-2 border-silver !text-white',
          'hover:border-grey3 hover:disabled:border-silver',
        ],
        success: [
          'bg-green border-2 border-green',
          'hover:border-greenLight hover:disabled:border-green',
        ],
        'success-light': [
          'bg-green/20 border-2 border-green/0 !text-green',
          'hover:border-greenLight hover:!text-black hover:bg-green hover:disabled:border-green',
        ],
        error: [
          'bg-red border-2 border-red',
          'hover:border-redLight hover:disabled:border-red',
        ],
      },
      size: {
        sm: ['text-12', 'h-30'],
        md: ['text-14', 'h-40'],
        lg: ['text-16', 'h-50'],
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'white',
      size: 'md',
    },
  }
);
