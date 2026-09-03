import type { ComponentProps, JSX, ReactNode } from "react";

type HasRequiredProperty<T> = {
  [K in keyof T]-?: Record<string, never> extends Pick<T, K> ? never : K;
}[keyof T];

interface ProviderBase<T> {
  provider: T;
}

interface ProviderProps<T extends keyof JSX.IntrinsicElements> {
  props: Omit<ComponentProps<T>, "children">;
}

// oxlint-disable-next-line no-explicit-any
type ProvidersArray<T extends any[]> = [
  ...{
    [K in keyof T]: HasRequiredProperty<Omit<ComponentProps<T[K]>, "children">> extends never
      ? ProviderBase<T[K]> & Partial<ProviderProps<T[K]>>
      : ProviderBase<T[K]> & ProviderProps<T[K]>;
  },
];

// oxlint-disable-next-line no-explicit-any
interface Props<T extends any[]> {
  providers: ProvidersArray<T>;
  children: ReactNode;
}

// oxlint-disable-next-line no-explicit-any
function Providers<T extends any[]>({ providers, children }: Props<T>) {
  return (
    <>
      {providers.reduceRight(
        (child, { provider: Provider, props }) => (
          <Provider {...props}>{child}</Provider>
        ),
        children,
      )}
    </>
  );
}

export default Providers;
