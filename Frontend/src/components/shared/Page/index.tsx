import { Fragment, useEffect, type ElementType, type ReactNode } from 'react';

type PageProps<T extends ElementType = typeof Fragment> = {
  title?: string;
  component?: T;
  children: ReactNode;
} & React.ComponentPropsWithoutRef<T>;

function Page<T extends ElementType = typeof Fragment>({
  title = '',
  component,
  children,
  ...rest
}: PageProps<T>) {
  const Component: ElementType = component || Fragment;

  useEffect(() => {
    if (title) {
      document.title = title;
    }
  }, [title]);

  return <Component {...rest}>{children}</Component>;
}

export { Page };
