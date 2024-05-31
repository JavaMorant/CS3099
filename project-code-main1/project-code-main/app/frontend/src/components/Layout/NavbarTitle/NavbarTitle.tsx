type Props = {
  children: React.ReactNode;
};

/**
 * A NavbarTitle component that renders a title in the navbar.
 * @param children - The text to display in the title.
 */
export const NavbarTitle = ({ children }: Props) => {
  return (
    <h1
      className="bg-clip-text
font-jakarta text-4xl font-bold leading-tight text-black">
      {children}
    </h1>
  );
};
