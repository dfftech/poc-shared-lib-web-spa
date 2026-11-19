import { ConstKeys } from 'dff-util';

export const MenuLinkValidation = {
  name: {
    required: {
      value: true,
      message: ConstKeys.REQUIRED,
    },
  },
  icon: {
    required: {
      value: true,
      message: ConstKeys.REQUIRED,
    },
  },
  href: {
    required: {
      value: true,
      message: ConstKeys.REQUIRED,
    },
  },
  menuGroupId: {
    required: {
      value: true,
      message: ConstKeys.REQUIRED,
    },
  },
  priority: {
    required: {
      value: true,
      message: ConstKeys.REQUIRED,
    },
  },
};
