import * as React from 'react';
import { Icons } from './icons';

export type IconType = keyof typeof Icons;

type Props = {
  name: IconType;
} & React.SVGProps<SVGSVGElement>;

/**
 * An Branding component that renders an SVG icon.
 * To add a new icon, add it to the `brandings.ts` file and it will be available to use.
 * @param name - The name of the icon to render (must be defined in `brandings.ts`).
 */
export const Icon = ({ name, ...rest }: Props) => {
  const IconComponent = Icons[name];

  return <IconComponent {...rest} />;
};
